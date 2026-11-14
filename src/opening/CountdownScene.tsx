import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { soundEngine } from '../services/soundEngine'

interface CountdownSceneProps {
  onComplete: () => void
}

function countColor(count: number): string {
  if (count >= 6) return '#e8e6ff'
  if (count >= 3) return '#e67a2e'
  return '#ff3b3b'
}

function countGlow(count: number): string {
  if (count >= 6) return '0 0 28px rgba(200, 210, 255, 0.45)'
  if (count >= 3) return '0 0 36px rgba(230, 122, 46, 0.65)'
  return '0 0 48px rgba(255, 59, 59, 0.8)'
}

type Star = {
  x: number
  y: number
  z: number
  pz: number
  /** Twinkle phase for ambient (non-warp) stars */
  phase: number
  size: number
}

/**
 * Space field that fades black → deep blue while stars densify,
 * then stretches into warp streaks near liftoff.
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function WarpStarsCanvas({ progress, warp }: { progress: number; warp: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressTargetRef = useRef(progress)
  const warpTargetRef = useRef(warp)
  const rafRef = useRef(0)

  useEffect(() => {
    progressTargetRef.current = progress
  }, [progress])

  useEffect(() => {
    warpTargetRef.current = warp
  }, [warp])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let smoothProgress = 0
    let smoothWarp = 0
    let lastNow = performance.now()
    const stars: Star[] = []
    const COUNT = 220
    const t0 = performance.now()
    // ~1.1s to catch a step change — soft ramp between ticks
    const LERP_PER_SEC = 1.15

    const resetWarp = (s: Star, randomZ: boolean) => {
      s.x = (Math.random() - 0.5) * w * 2
      s.y = (Math.random() - 0.5) * h * 2
      s.z = randomZ ? Math.random() * w : w
      s.pz = s.z
    }

    const resize = () => {
      const parent = canvas.parentElement
      const rect = parent?.getBoundingClientRect()
      w = Math.max(1, Math.floor(rect?.width || window.innerWidth))
      h = Math.max(1, Math.floor(rect?.height || window.innerHeight))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (stars.length === 0) {
        for (let i = 0; i < COUNT; i++) {
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            z: Math.random() * w,
            pz: 0,
            phase: Math.random() * Math.PI * 2,
            size: Math.random() * 1.8 + 0.4,
          })
          resetWarp(stars[i]!, true)
        }
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - lastNow) / 1000)
      lastNow = now
      const lerpT = 1 - Math.exp(-LERP_PER_SEC * dt)
      smoothProgress += (progressTargetRef.current - smoothProgress) * lerpT
      smoothWarp += (warpTargetRef.current - smoothWarp) * lerpT

      const p = easeInOutCubic(Math.min(1, Math.max(0, smoothProgress)))
      const warpAmt = easeInOutCubic(Math.min(1, Math.max(0, smoothWarp)))
      const t = (now - t0) / 1000

      // Black → deep space blue (smoothed)
      const r = Math.round(2 + p * 18)
      const g = Math.round(4 + p * 42)
      const b = Math.round(8 + p * 110)
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(0, 0, w, h)

      // Soft blue nebula bloom
      if (p > 0.02) {
        const neb = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, w * 0.75)
        neb.addColorStop(0, `rgba(70,130,240,${0.06 + p * 0.22})`)
        neb.addColorStop(0.5, `rgba(35,70,160,${0.05 + p * 0.12})`)
        neb.addColorStop(1, 'transparent')
        ctx.fillStyle = neb
        ctx.fillRect(0, 0, w, h)
      }

      // Ambient stars densify smoothly with progress
      const visibleCount = Math.floor(8 + p * (COUNT - 8))
      const ambientAlpha = Math.min(1, p * 1.15)

      for (let i = 0; i < visibleCount; i++) {
        const s = stars[i]!
        const fadeWarp = Math.max(0, 1 - warpAmt * 1.1)
        if (fadeWarp < 0.02) continue
        const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.6 + s.phase))
        const a = ambientAlpha * twinkle * fadeWarp
        if (a < 0.015) continue
        ctx.fillStyle = `rgba(220,235,255,${a})`
        const sx = ((s.x + t * 3.2 * (0.25 + (i % 5) * 0.08)) % w + w) % w
        ctx.fillRect(sx, s.y, s.size, s.size)
      }

      // Warp streaks ease in near zero
      if (warpAmt > 0.015) {
        const speed = 2 + warpAmt * 46
        const cx = w / 2
        const cy = h / 2
        const streakCount = Math.floor(30 + warpAmt * (COUNT - 30))

        for (let i = 0; i < streakCount; i++) {
          const s = stars[i]!
          s.pz = s.z
          s.z -= speed
          if (s.z <= 1) {
            resetWarp(s, false)
            continue
          }
          const sx = cx + (s.x / s.z) * w * 0.5
          const sy = cy + (s.y / s.z) * h * 0.5
          const px = cx + (s.x / s.pz) * w * 0.5
          const py = cy + (s.y / s.pz) * h * 0.5
          const alpha = Math.min(1, (1 - s.z / w) * 1.55) * warpAmt
          ctx.strokeStyle = `rgba(210,230,255,${alpha})`
          ctx.lineWidth = Math.max(1, (1 - s.z / w) * (1.1 + warpAmt * 2.8))
          ctx.beginPath()
          ctx.moveTo(px, py)
          ctx.lineTo(sx, sy)
          ctx.stroke()
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
}

const FLASH_DURATION_S = 2.8
const TICK_MS = 550

const GO_COLOR = '#ffffff'
const GO_GLOW = '0 0 42px rgba(255, 255, 255, 0.85)'

export function CountdownScene({ onComplete }: CountdownSceneProps) {
  const [count, setCount] = useState<number | null>(null)
  const [phase, setPhase] = useState<'counting' | 'go' | 'flash' | 'done'>('counting')

  // Absolute timeline: digit + beep fire in the same callback every 1s
  useEffect(() => {
    if (phase !== 'counting') return

    let cancelled = false
    const timers: number[] = []

    for (let n = 10; n >= 0; n--) {
      const delay = (10 - n) * TICK_MS
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return
          setCount(n)
          soundEngine.countdownTick(n)
          if (n === 0) {
            timers.push(
              window.setTimeout(() => {
                if (cancelled) return
                setPhase('go')
                soundEngine.goStart()
              }, TICK_MS),
            )
          }
        }, delay),
      )
    }

    return () => {
      cancelled = true
      for (const id of timers) window.clearTimeout(id)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'go') return
    const id = window.setTimeout(() => setPhase('flash'), TICK_MS)
    return () => window.clearTimeout(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'done') return
    onComplete()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- invoke once when done
  }, [phase])

  const displayCount = count ?? 10
  const progress = phase === 'counting' ? (10 - displayCount) / 10 : 1
  const warp =
    phase === 'flash' || phase === 'done'
      ? 1
      : phase === 'go'
        ? 1
        : displayCount >= 6
          ? Math.max(0, (10 - displayCount) / 10) * 0.12
          : Math.max(0, Math.min(1, (5.5 - displayCount) / 5.5))

  const shake =
    phase === 'counting' && count !== null && count <= 3
      ? 0.45 + (3 - count) * 0.4
      : phase === 'go'
        ? 0.7
        : phase === 'flash'
          ? 0.55
          : 0
  const shakeX = shake > 0 ? [0, -7 * shake, 6 * shake, -5 * shake, 4 * shake, 0] : 0
  const shakeY = shake > 0 ? [0, 5 * shake, -6 * shake, 4 * shake, -3 * shake, 0] : 0
  const color = countColor(displayCount)

  return (
    <motion.div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black"
      style={{ touchAction: 'manipulation' }}
      animate={{ x: shakeX, y: shakeY }}
      transition={{ duration: 0.4, repeat: shake > 0 ? Infinity : 0 }}
    >
      <WarpStarsCanvas progress={progress} warp={warp} />

      <AnimatePresence>
        {phase === 'counting' && count !== null && (
          <motion.span
            key={count}
            className="absolute z-10 font-pixel text-[7rem] leading-none sm:text-[9rem]"
            style={{ color, textShadow: countGlow(count) }}
            initial={{ scale: 0.7, opacity: 0.35 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.25, opacity: 0 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
          >
            {count}
          </motion.span>
        )}
        {phase === 'go' && (
          <motion.span
            key="go"
            className="absolute z-10 font-pixel text-[5.5rem] leading-none tracking-wide sm:text-[7.5rem]"
            style={{ color: GO_COLOR, textShadow: GO_GLOW }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.15, 1], opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            GO!!!
          </motion.span>
        )}
      </AnimatePresence>

      {(phase === 'flash' || phase === 'done') && (
        <motion.div
          className="absolute inset-0 z-20 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: FLASH_DURATION_S, ease: [0.22, 0.08, 0.2, 1] }}
          onAnimationComplete={() => {
            if (phase === 'flash') setPhase('done')
          }}
        />
      )}
    </motion.div>
  )
}
