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
function WarpStarsCanvas({ progress, warp }: { progress: number; warp: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(progress)
  const warpRef = useRef(warp)
  const rafRef = useRef(0)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    warpRef.current = warp
  }, [warp])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    const stars: Star[] = []
    const COUNT = 220
    const t0 = performance.now()

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
      const p = progressRef.current
      const warpAmt = warpRef.current
      const t = (now - t0) / 1000

      // Black → deep space blue as countdown advances
      const r = Math.round(2 + p * 12)
      const g = Math.round(4 + p * 28)
      const b = Math.round(8 + p * 72)
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(0, 0, w, h)

      // Soft blue nebula bloom
      if (p > 0.05) {
        const neb = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, w * 0.7)
        neb.addColorStop(0, `rgba(60,110,220,${0.08 + p * 0.18})`)
        neb.addColorStop(0.55, `rgba(30,60,140,${0.06 + p * 0.1})`)
        neb.addColorStop(1, 'transparent')
        ctx.fillStyle = neb
        ctx.fillRect(0, 0, w, h)
      }

      // How many ambient stars are visible (ramps up through countdown)
      const visibleCount = Math.floor(12 + p * (COUNT - 12))
      const ambientAlpha = Math.min(1, p * 1.35)

      for (let i = 0; i < visibleCount; i++) {
        const s = stars[i]!
        if (warpAmt < 0.35) {
          // Twinkling field while building atmosphere
          const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.2 + s.phase))
          const a = ambientAlpha * twinkle * (1 - warpAmt * 0.85)
          if (a < 0.02) continue
          ctx.fillStyle = `rgba(220,235,255,${a})`
          const sx = ((s.x + t * 4 * (0.3 + (i % 5) * 0.1)) % w + w) % w
          const sy = s.y
          ctx.fillRect(sx, sy, s.size, s.size)
        }
      }

      // Warp streaks intensify near zero
      if (warpAmt > 0.02) {
        const speed = 3 + warpAmt * 48
        const cx = w / 2
        const cy = h / 2
        const streakCount = Math.floor(40 + warpAmt * (COUNT - 40))

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
          const alpha = Math.min(1, (1 - s.z / w) * 1.6) * warpAmt
          ctx.strokeStyle = `rgba(210,230,255,${alpha})`
          ctx.lineWidth = Math.max(1, (1 - s.z / w) * (1.2 + warpAmt * 3))
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

const FLASH_DURATION_S = 2.4

export function CountdownScene({ onComplete }: CountdownSceneProps) {
  const [count, setCount] = useState(10)
  const [phase, setPhase] = useState<'counting' | 'flash' | 'done'>('counting')
  const [showDigit, setShowDigit] = useState(true)

  useEffect(() => {
    if (phase !== 'counting') return

    soundEngine.countdownTick(count)

    const id = window.setTimeout(() => {
      if (count <= 0) {
        setShowDigit(false)
        setPhase('flash')
      } else {
        setCount((c) => c - 1)
      }
    }, 1000)
    return () => clearTimeout(id)
  }, [count, phase])

  useEffect(() => {
    if (phase !== 'done') return
    onComplete()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- invoke once when done
  }, [phase])

  // 0 at 10 → 1 at 0; stays max during flash
  const progress = phase === 'counting' ? (10 - count) / 10 : 1
  const warp =
    phase === 'flash' || phase === 'done'
      ? 1
      : Math.max(0, Math.min(1, (4 - count) / 4))

  const shake =
    phase === 'counting' && count <= 3 ? 0.45 + (3 - count) * 0.4 : phase === 'flash' ? 0.55 : 0
  const shakeX = shake > 0 ? [0, -7 * shake, 6 * shake, -5 * shake, 4 * shake, 0] : 0
  const shakeY = shake > 0 ? [0, 5 * shake, -6 * shake, 4 * shake, -3 * shake, 0] : 0
  const color = countColor(count)

  return (
    <motion.div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black"
      style={{ touchAction: 'manipulation' }}
      animate={{ x: shakeX, y: shakeY }}
      transition={{ duration: 0.4, repeat: shake > 0 ? Infinity : 0 }}
    >
      <WarpStarsCanvas progress={progress} warp={warp} />

      <AnimatePresence mode="wait">
        {showDigit && phase === 'counting' && (
          <motion.span
            key={count}
            className="relative z-10 font-pixel text-[7rem] leading-none sm:text-[9rem]"
            style={{ color, textShadow: countGlow(count) }}
            initial={{ scale: 0.35, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.55, opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            {count}
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
