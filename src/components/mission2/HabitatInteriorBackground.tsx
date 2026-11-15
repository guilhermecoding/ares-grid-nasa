import { useEffect, useRef } from 'react'
import type { HabitatLighting } from '../../data/mission2Data'
import { createMarsStars, drawMarsZoom, MARS_ZOOM_LOOKS } from '../marsZoom'

type RoomAccent = 'exercise' | 'nutrition' | 'hygiene' | 'sleep' | 'idle'

interface Props {
  lighting: HabitatLighting
  /** Kept for call-site compatibility; cabin props no longer drawn. */
  room?: RoomAccent
  className?: string
}

/** Full-bleed habitat window: Mars globe in space — no cabin furniture. */
export function HabitatInteriorBackground({ lighting, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const look = MARS_ZOOM_LOOKS[lighting]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const t0 = performance.now()

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = parent.clientWidth
      const h = parent.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    const stars = createMarsStars()

    const draw = (now: number) => {
      const parent = canvas.parentElement
      if (!parent) return
      const w = parent.clientWidth
      const h = parent.clientHeight
      ctx.clearRect(0, 0, w, h)
      drawMarsZoom(ctx, w, h, now, t0, look, stars)
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [look, lighting])

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#04060e] ${className}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Window frame only — no cabin furniture */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Dark bevel around viewport */}
        <defs>
          <radialGradient id="m2-window-vignette" cx="50%" cy="48%" r="62%">
            <stop offset="55%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#m2-window-vignette)" />

        {/* Slim window frame — leaves HUD text clear of the bevel */}
        <rect
          x="1.5"
          y="1.5"
          width="97"
          height="97"
          rx="2.5"
          fill="none"
          stroke="#12182a"
          strokeWidth="3"
        />
        <rect
          x="2.8"
          y="2.8"
          width="94.4"
          height="94.4"
          rx="2"
          fill="none"
          stroke="#3d465c"
          strokeWidth="0.7"
        />
        <rect
          x="3.6"
          y="3.6"
          width="92.8"
          height="92.8"
          rx="1.6"
          fill="none"
          stroke="#5ee7ff"
          strokeWidth="0.4"
          opacity={0.55}
        />

        {/* Corner bolts */}
        {[
          [4.2, 4.2],
          [95.8, 4.2],
          [4.2, 95.8],
          [95.8, 95.8],
        ].map(([bx, by], i) => (
          <g key={i}>
            <circle cx={bx} cy={by} r="0.9" fill="#2a3144" stroke="#8a93a8" strokeWidth="0.2" />
            <circle cx={bx} cy={by} r="0.3" fill="#0a1018" />
          </g>
        ))}

        {/* Glass sheen */}
        <path d="M6 8 L36 6 L24 36 Z" fill="rgba(180,220,255,0.06)" />
      </svg>
    </div>
  )
}
