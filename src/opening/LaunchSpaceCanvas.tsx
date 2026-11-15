import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  z: number
  pz: number
}

interface LaunchSpaceCanvasProps {
  /** 0 = cruise, 1 = full warp */
  warp?: number
  /** Show pulsing hologram light in cockpit center */
  hologramActive?: boolean
  /** Cockpit frame overlay (off for full-bleed title space) */
  cockpit?: boolean
  /** Freeze canvas rAF + CSS anims (e.g. while a dialog is open) */
  paused?: boolean
  className?: string
}

/** Futuristic canopy cockpit — angular, luminous, not a flat monitor bezel. */
function TechCockpit({ hologramActive }: { hologramActive: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
      {/* Canopy vignette / depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 72% 62% at 50% 42%, transparent 42%, rgba(2,6,14,0.55) 78%, rgba(2,4,10,0.92) 100%),
            linear-gradient(180deg, rgba(4,10,22,0.55) 0%, transparent 18%, transparent 62%, rgba(4,10,22,0.75) 100%)
          `,
        }}
      />

      {/* Hexagonal canopy rim */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="techEdge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5ee7ff" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#7ec8ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#4ea1ff" stopOpacity="0.2" />
          </linearGradient>
          <filter id="edgeBloom">
            <feGaussianBlur stdDeviation="0.35" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M8 18 L22 8 H78 L92 18 L94 72 L78 88 H22 L6 72 Z"
          fill="none"
          stroke="url(#techEdge)"
          strokeWidth="0.45"
          filter="url(#edgeBloom)"
          opacity="0.9"
        />
        <path
          d="M11 20 L24 11 H76 L89 20 L91 70 L76 85 H24 L9 70 Z"
          fill="none"
          stroke="#5ee7ff"
          strokeWidth="0.15"
          opacity="0.35"
        />
        <path d="M18 22 H26 M18 22 V30" stroke="#5ee7ff" strokeWidth="0.35" opacity="0.7" />
        <path d="M82 22 H74 M82 22 V30" stroke="#5ee7ff" strokeWidth="0.35" opacity="0.7" />
        <path d="M18 68 H26 M18 68 V60" stroke="#5ee7ff" strokeWidth="0.35" opacity="0.55" />
        <path d="M82 68 H74 M82 68 V60" stroke="#5ee7ff" strokeWidth="0.35" opacity="0.55" />
        <line x1="28" y1="48" x2="40" y2="48" stroke="#5ee7ff" strokeWidth="0.12" opacity="0.35" />
        <line x1="60" y1="48" x2="72" y2="48" stroke="#5ee7ff" strokeWidth="0.12" opacity="0.35" />
        <circle cx="50" cy="48" r="1.2" fill="none" stroke="#5ee7ff" strokeWidth="0.2" opacity="0.45" />
      </svg>

      {/* Left tech wing */}
      <div
        className="absolute top-[14%] bottom-[22%] left-0 w-[min(18vw,7.5rem)]"
        style={{
          background: 'linear-gradient(105deg, rgba(6,12,24,0.95) 0%, rgba(10,20,40,0.82) 55%, transparent 100%)',
          clipPath: 'polygon(0 0, 100% 8%, 78% 92%, 0 100%)',
          boxShadow: 'inset -2px 0 12px rgba(94,231,255,0.15)',
        }}
      >
        <div className="flex h-full flex-col justify-center gap-2 py-6 pl-2 pr-4">
          {[0.7, 0.45, 0.9, 0.55].map((h, i) => (
            <div key={i} className="relative h-1.5 overflow-hidden rounded-sm bg-void-950/80 ring-1 ring-cyan-hud/30">
              <div
                className="absolute inset-y-0 left-0 bg-cyan-hud/80"
                style={{
                  width: `${h * 100}%`,
                  animation: `cockpitPulse ${1.4 + i * 0.3}s ease-in-out infinite`,
                }}
              />
            </div>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-1">
            {['#2ecc71', '#f0b429', '#4ea1ff', '#e67a2e'].map((c, i) => (
              <div
                key={i}
                className="h-2 rounded-sm"
                style={{ background: c, opacity: 0.75, animation: `cockpitBlink ${1.1 + i * 0.4}s infinite` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right tech wing */}
      <div
        className="absolute top-[14%] right-0 bottom-[22%] w-[min(18vw,7.5rem)]"
        style={{
          background: 'linear-gradient(255deg, rgba(6,12,24,0.95) 0%, rgba(10,20,40,0.82) 55%, transparent 100%)',
          clipPath: 'polygon(0 8%, 100% 0, 100% 100%, 22% 92%)',
          boxShadow: 'inset 2px 0 12px rgba(94,231,255,0.15)',
        }}
      >
        <div className="flex h-full flex-col items-end justify-center gap-3 py-8 pr-3 pl-5">
          <div
            className="relative h-14 w-14 rounded-full border border-cyan-hud/50"
            style={{ boxShadow: '0 0 16px rgba(94,231,255,0.25), inset 0 0 10px rgba(94,231,255,0.15)' }}
          >
            <div
              className="absolute inset-2 rounded-full border border-dashed border-cyan-hud/40"
              style={{ animation: 'cockpitSpin 10s linear infinite' }}
            />
            <div className="absolute inset-[35%] rounded-full bg-cyan-hud/70" />
          </div>
          <div className="w-full space-y-1 font-mono text-[9px] tracking-wider text-cyan-hud/70">
            <div className="flex justify-between gap-1">
              <span>VEL</span>
              <span className="text-cyan-hud">0.87c</span>
            </div>
            <div className="flex justify-between gap-1">
              <span>HDG</span>
              <span className="text-cyan-hud">142°</span>
            </div>
            <div className="h-0.5 overflow-hidden rounded bg-void-950">
              <div className="h-full w-2/3 bg-star/80" style={{ animation: 'cockpitPulse 2s infinite' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Top canopy rail */}
      <div
        className="absolute top-0 right-0 left-0 h-[11%]"
        style={{
          background: 'linear-gradient(180deg, rgba(8,14,28,0.95) 0%, rgba(12,22,44,0.75) 60%, transparent 100%)',
          clipPath: 'polygon(0 0, 100% 0, 88% 100%, 12% 100%)',
        }}
      >
        <div className="flex h-full items-end justify-center gap-6 pb-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-1 w-1 rounded-full"
              style={{
                background: i === 4 ? '#5ee7ff' : '#4ea1ff',
                opacity: 0.4 + (i % 3) * 0.2,
                boxShadow: i === 4 ? '0 0 8px #5ee7ff' : undefined,
                animation: `cockpitBlink ${1.6 + (i % 4) * 0.25}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Perspective command console */}
      <div
        className="absolute right-0 bottom-0 left-0 h-[26%]"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(6,12,26,0.4) 12%, rgba(8,14,28,0.92) 35%, #060c18 100%)',
        }}
      >
        <div
          className="absolute right-[6%] bottom-[8%] left-[6%] top-[18%]"
          style={{
            background: 'linear-gradient(180deg, rgba(20,36,64,0.9) 0%, rgba(8,14,28,0.98) 100%)',
            clipPath: 'polygon(6% 0, 94% 0, 100% 100%, 0 100%)',
            boxShadow: '0 -8px 28px rgba(94,231,255,0.12), inset 0 1px 0 rgba(94,231,255,0.25)',
            borderTop: '1px solid rgba(94,231,255,0.35)',
          }}
        >
          <div className="flex h-full items-stretch gap-2 px-3 py-2 sm:gap-3 sm:px-5 sm:py-2.5">
            <div className="flex min-w-0 flex-1 flex-col rounded-sm bg-black/50 p-1.5 ring-1 ring-cyan-hud/25">
              <div className="mb-1 font-mono text-[8px] tracking-widest text-cyan-hud/60">NAV CORE</div>
              <svg className="h-full w-full flex-1" viewBox="0 0 100 28" preserveAspectRatio="none">
                <polyline
                  points="0,20 10,14 20,18 30,8 40,16 50,6 60,14 70,10 80,16 90,12 100,18"
                  fill="none"
                  stroke="#2ecc71"
                  strokeWidth="1.2"
                  opacity="0.85"
                >
                  <animate attributeName="opacity" values="0.45;1;0.45" dur="2s" repeatCount="indefinite" />
                </polyline>
              </svg>
            </div>

            <div className="flex min-w-0 flex-[1.2] items-end justify-center gap-1 rounded-sm bg-black/50 px-2 py-1.5 ring-1 ring-cyan-hud/25 sm:gap-1.5">
              {[40, 65, 85, 55, 70, 95, 50].map((h, i) => (
                <div key={i} className="flex h-full w-2 flex-col justify-end sm:w-2.5">
                  <div
                    className="w-full rounded-sm"
                    style={{
                      height: `${h}%`,
                      background:
                        h > 80
                          ? 'linear-gradient(#5ee7ff,#4ea1ff)'
                          : h > 55
                            ? 'linear-gradient(#2ecc71,#1a7a3a)'
                            : 'linear-gradient(#f0b429,#e67a2e)',
                      boxShadow: '0 0 6px rgba(94,231,255,0.35)',
                      animation: `cockpitPulse ${1.2 + i * 0.15}s ease-in-out infinite`,
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="relative flex w-14 shrink-0 items-center justify-center sm:w-16">
              <div
                className={`absolute h-10 w-10 rounded-full sm:h-12 sm:w-12 ${hologramActive ? 'bg-cyan-hud/30' : 'bg-star/10'}`}
                style={{
                  boxShadow: hologramActive
                    ? '0 0 28px rgba(94,231,255,0.65), inset 0 0 12px rgba(94,231,255,0.5)'
                    : '0 0 10px rgba(78,161,255,0.25)',
                  animation: hologramActive ? 'cockpitPulse 1s ease-in-out infinite' : undefined,
                }}
              />
              <div
                className={`relative h-4 w-4 rounded-full sm:h-5 sm:w-5 ${hologramActive ? 'bg-cyan-hud' : 'bg-star-dim'}`}
                style={{ boxShadow: hologramActive ? '0 0 14px #5ee7ff' : undefined }}
              />
            </div>

            <div className="hidden min-w-0 flex-1 grid-cols-4 gap-1 rounded-sm bg-black/50 p-1.5 ring-1 ring-cyan-hud/25 sm:grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-sm ring-1 ring-cyan-hud/20"
                  style={{
                    background:
                      i % 3 === 0 ? 'rgba(230,122,46,0.85)' : i % 2 === 0 ? 'rgba(94,231,255,0.45)' : 'rgba(40,60,90,0.8)',
                    animation: i % 3 === 0 ? `cockpitBlink ${1.8 + i * 0.1}s infinite` : undefined,
                  }}
                />
              ))}
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 rounded-sm bg-black/50 p-1.5 ring-1 ring-cyan-hud/25">
              <div className="font-mono text-[8px] tracking-widest text-cyan-hud/60">CMD LINK</div>
              <div className="flex gap-1">
                {['#2ecc71', '#2ecc71', '#5ee7ff', '#f0b429', '#4ea1ff', '#e67a2e'].map((c, i) => (
                  <div
                    key={i}
                    className="h-2 flex-1 rounded-sm"
                    style={{ background: c, animation: `cockpitBlink ${1.2 + i * 0.2}s infinite` }}
                  />
                ))}
              </div>
              <div className="h-1 overflow-hidden rounded-sm bg-void-950">
                <div className="h-full w-[72%] bg-gradient-to-r from-star to-cyan-hud" style={{ animation: 'cockpitPulse 2.2s infinite' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {hologramActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-[min(38vh,16rem)] w-[min(38vh,16rem)] rounded-full border border-cyan-hud/30"
            style={{
              boxShadow: '0 0 40px rgba(94,231,255,0.2), inset 0 0 30px rgba(94,231,255,0.08)',
              animation: 'cockpitSpin 18s linear infinite',
            }}
          />
          <div
            className="absolute h-[min(28vh,11rem)] w-[min(28vh,11rem)] rounded-full border border-dashed border-cyan-hud/40"
            style={{ animation: 'cockpitSpin 12s linear infinite reverse' }}
          />
        </div>
      )}
    </div>
  )
}

export function LaunchSpaceCanvas({
  warp = 0.55,
  hologramActive = false,
  cockpit = true,
  paused = false,
  className = '',
}: LaunchSpaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const warpRef = useRef(warp)
  const pausedRef = useRef(paused)
  const rafRef = useRef(0)
  const drawRef = useRef<((now: number) => void) | null>(null)
  const lastNowRef = useRef(performance.now())

  useEffect(() => {
    warpRef.current = warp
  }, [warp])

  useEffect(() => {
    pausedRef.current = paused
    if (paused) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      return
    }
    // Resume only after the canvas loop has registered a real draw fn.
    if (drawRef.current && rafRef.current === 0) {
      lastNowRef.current = performance.now()
      rafRef.current = requestAnimationFrame((t) => drawRef.current?.(t))
    }
  }, [paused])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let alive = true
    lastNowRef.current = performance.now()
    const stars: Star[] = []
    const STAR_COUNT = 240

    const resize = () => {
      const parent = canvas.parentElement
      const rect = parent?.getBoundingClientRect()
      w = Math.max(1, Math.floor(rect?.width || parent?.clientWidth || window.innerWidth))
      h = Math.max(1, Math.floor(rect?.height || parent?.clientHeight || window.innerHeight))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    /** Spawn far away; staggered Z keeps a continuous stream on screen. */
    const resetStar = (s: Star, randomZ = true) => {
      const spread = Math.max(w, h) * 1.1
      s.x = (Math.random() - 0.5) * spread
      s.y = (Math.random() - 0.5) * spread
      s.z = randomZ ? Math.random() * w * 0.9 + w * 0.1 : w * (0.92 + Math.random() * 0.08)
      s.pz = s.z
    }

    for (let i = 0; i < STAR_COUNT; i++) {
      const s: Star = { x: 0, y: 0, z: 0, pz: 0 }
      resetStar(s)
      stars.push(s)
    }

    resize()
    const onResize = () => resize()
    window.addEventListener('resize', onResize)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    if (canvas.parentElement) ro?.observe(canvas.parentElement)

    let earthY = h * 0.92
    const t0 = performance.now()
    const margin = 48

    const draw = (now: number) => {
      if (!alive) return
      if (pausedRef.current) {
        rafRef.current = 0
        return
      }

      const t = (now - t0) / 1000
      const dt = Math.min(0.05, (now - lastNowRef.current) / 1000)
      lastNowRef.current = now

      const warpAmt = Math.min(1, Math.max(0, warpRef.current))
      // Units/sec — smooth continuous fly-by, not frame-tied blinks
      const speed = (90 + warpAmt * 780) * dt

      ctx.fillStyle = '#05030c'
      ctx.fillRect(0, 0, w, h)

      const neb = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, w * 0.6)
      neb.addColorStop(0, 'rgba(40,80,160,0.2)')
      neb.addColorStop(1, 'transparent')
      ctx.fillStyle = neb
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2

      for (const s of stars) {
        s.pz = s.z
        s.z -= speed

        if (s.z <= 2) {
          resetStar(s, false)
          continue
        }

        const sx = cx + (s.x / s.z) * w * 0.5
        const sy = cy + (s.y / s.z) * h * 0.5
        const px = cx + (s.x / s.pz) * w * 0.5
        const py = cy + (s.y / s.pz) * h * 0.5

        // Recycle off-screen after drawing would be invisible — keep stream steady
        if (
          (sx < -margin && px < -margin) ||
          (sx > w + margin && px > w + margin) ||
          (sy < -margin && py < -margin) ||
          (sy > h + margin && py > h + margin)
        ) {
          resetStar(s, false)
          continue
        }

        // Fade in from far, fade out near camera — no hard pop
        const depth = 1 - s.z / w
        const fadeIn = Math.min(1, depth * 2.4)
        const fadeOut = Math.min(1, (s.z - 2) / (w * 0.12))
        const alpha = Math.min(0.95, fadeIn * fadeOut * (0.35 + warpAmt * 0.65))
        if (alpha < 0.02) continue

        const streak = Math.max(1.2, Math.min(28, Math.hypot(sx - px, sy - py)))
        ctx.strokeStyle = `rgba(200,220,255,${alpha})`
        ctx.lineWidth = Math.max(1, depth * (1.2 + warpAmt * 2.4))
        ctx.lineCap = 'round'
        ctx.beginPath()
        // Stretch trail slightly for continuous warp feel
        const ux = streak > 0.01 ? (sx - px) / streak : 0
        const uy = streak > 0.01 ? (sy - py) / streak : 0
        const extend = 1 + warpAmt * 1.8
        ctx.moveTo(px - ux * streak * 0.15, py - uy * streak * 0.15)
        ctx.lineTo(sx + ux * streak * (extend - 1), sy + uy * streak * (extend - 1))
        ctx.stroke()
      }

      // Huge globe below the frame: thin upper limb near the bottom edge.
      const earthR = w * (0.78 - warpAmt * 0.04)
      const ex = cx
      earthY = h + earthR * (0.82 - (1 - warpAmt) * 0.02)
      const ey = earthY

      // Soft atmosphere glow along the limb
      const atmoGlow = ctx.createRadialGradient(ex, ey, earthR * 0.92, ex, ey, earthR * 1.12)
      atmoGlow.addColorStop(0, 'rgba(94,231,255,0.2)')
      atmoGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = atmoGlow
      ctx.beginPath()
      ctx.arc(ex, ey, earthR * 1.12, 0, Math.PI * 2)
      ctx.fill()

      const earthGrad = ctx.createRadialGradient(
        ex - earthR * 0.2,
        ey - earthR * 0.85,
        earthR * 0.05,
        ex,
        ey,
        earthR,
      )
      earthGrad.addColorStop(0, '#5ab0e8')
      earthGrad.addColorStop(0.25, '#1a6bb5')
      earthGrad.addColorStop(0.55, '#0d3d6e')
      earthGrad.addColorStop(0.85, '#071e32')
      earthGrad.addColorStop(1, '#041018')
      ctx.fillStyle = earthGrad
      ctx.beginPath()
      ctx.arc(ex, ey, earthR, 0, Math.PI * 2)
      ctx.fill()

      // Continent blobs on the thin visible limb
      ctx.save()
      ctx.beginPath()
      ctx.arc(ex, ey, earthR, 0, Math.PI * 2)
      ctx.clip()
      ctx.fillStyle = 'rgba(52, 120, 72, 0.55)'
      ctx.beginPath()
      ctx.ellipse(ex - earthR * 0.32, ey - earthR * 0.92, earthR * 0.22, earthR * 0.06, -0.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(ex + earthR * 0.18, ey - earthR * 0.88, earthR * 0.26, earthR * 0.07, 0.15, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(40, 100, 58, 0.4)'
      ctx.beginPath()
      ctx.ellipse(ex - earthR * 0.02, ey - earthR * 0.84, earthR * 0.16, earthR * 0.045, 0.05, 0, Math.PI * 2)
      ctx.fill()
      const hi = ctx.createRadialGradient(ex - earthR * 0.2, ey - earthR * 0.95, 0, ex - earthR * 0.2, ey - earthR * 0.95, earthR * 0.35)
      hi.addColorStop(0, 'rgba(200,230,255,0.28)')
      hi.addColorStop(1, 'transparent')
      ctx.fillStyle = hi
      ctx.fillRect(ex - earthR, ey - earthR, earthR * 2, earthR * 2)
      ctx.restore()

      // Atmosphere rim on the visible limb
      ctx.strokeStyle = `rgba(94,231,255,${0.45 + Math.sin(t * 2) * 0.12})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(ex, ey, earthR * 1.015, Math.PI * 1.05, Math.PI * 1.95)
      ctx.stroke()

      rafRef.current = requestAnimationFrame(draw)
    }

    drawRef.current = draw
    if (!pausedRef.current) {
      rafRef.current = requestAnimationFrame(draw)
    }
    return () => {
      alive = false
      drawRef.current = null
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      ro?.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div
      className={`absolute inset-0 h-full w-full overflow-hidden ${paused ? '[&_*]:![animation-play-state:paused]' : ''} ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full transition-[filter] duration-300"
        style={paused ? { filter: 'grayscale(0.85) brightness(0.65)' } : undefined}
        aria-hidden
      />
      {cockpit ? <TechCockpit hologramActive={hologramActive} /> : null}
    </div>
  )
}
