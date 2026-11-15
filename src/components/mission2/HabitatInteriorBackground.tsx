import { useEffect, useRef } from 'react'
import type { HabitatLighting } from '../../data/mission2Data'

type RoomAccent = 'exercise' | 'nutrition' | 'hygiene' | 'sleep' | 'idle'

interface Props {
  lighting: HabitatLighting
  /** Kept for call-site compatibility; cabin props no longer drawn. */
  room?: RoomAccent
  className?: string
}

/** Time-of-day look for the orbital Mars window. */
const SPACE: Record<
  HabitatLighting,
  {
    voidTop: string
    voidBot: string
    marsLit: string
    marsMid: string
    marsDark: string
    atmosphere: string
    sunGlow: string
    sunCore: string
    starAlpha: number
    sunAngle: number
  }
> = {
  morning: {
    voidTop: '#050814',
    voidBot: '#0c1228',
    marsLit: '#e8a878',
    marsMid: '#c4683a',
    marsDark: '#4a1e12',
    atmosphere: 'rgba(255,180,120,0.45)',
    sunGlow: 'rgba(255,220,160,0.55)',
    sunCore: '#ffe8b0',
    starAlpha: 0.55,
    sunAngle: -0.55,
  },
  afternoon: {
    voidTop: '#04060f',
    voidBot: '#0a1020',
    marsLit: '#d48850',
    marsMid: '#a84828',
    marsDark: '#3a160c',
    atmosphere: 'rgba(255,140,80,0.4)',
    sunGlow: 'rgba(255,200,120,0.5)',
    sunCore: '#ffd090',
    starAlpha: 0.65,
    sunAngle: -0.15,
  },
  dusk: {
    voidTop: '#06040e',
    voidBot: '#120818',
    marsLit: '#c85840',
    marsMid: '#7a2818',
    marsDark: '#1a0808',
    atmosphere: 'rgba(220,80,60,0.35)',
    sunGlow: 'rgba(255,120,70,0.4)',
    sunCore: '#ff9a60',
    starAlpha: 0.85,
    sunAngle: 0.75,
  },
  night: {
    voidTop: '#020308',
    voidBot: '#060810',
    marsLit: '#6a3a28',
    marsMid: '#2a1410',
    marsDark: '#080406',
    atmosphere: 'rgba(100,60,80,0.25)',
    sunGlow: 'rgba(180,160,220,0.15)',
    sunCore: '#c8c0e8',
    starAlpha: 1,
    sunAngle: 2.4,
  },
  dawn: {
    voidTop: '#060812',
    voidBot: '#101828',
    marsLit: '#e09868',
    marsMid: '#a85830',
    marsDark: '#3a180c',
    atmosphere: 'rgba(255,160,100,0.4)',
    sunGlow: 'rgba(255,190,140,0.5)',
    sunCore: '#ffd8a0',
    starAlpha: 0.7,
    sunAngle: -1.05,
  },
}

/** Full-bleed habitat window: Mars globe in space — no cabin furniture. */
export function HabitatInteriorBackground({ lighting, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const look = SPACE[lighting]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let t0 = performance.now()

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

    const stars = Array.from({ length: 120 }, (_, i) => ({
      x: (i * 97 + 13) % 1000,
      y: (i * 53 + 29) % 1000,
      r: 0.4 + (i % 4) * 0.35,
      tw: (i % 9) * 0.35,
    }))

    const draw = (now: number) => {
      const parent = canvas.parentElement
      if (!parent) return
      const w = parent.clientWidth
      const h = parent.clientHeight
      ctx.clearRect(0, 0, w, h)

      // Deep space fill (visible in window + as cabin void)
      const voidGrad = ctx.createLinearGradient(0, 0, 0, h)
      voidGrad.addColorStop(0, look.voidTop)
      voidGrad.addColorStop(1, look.voidBot)
      ctx.fillStyle = voidGrad
      ctx.fillRect(0, 0, w, h)

      // Stars
      const pulse = (Math.sin((now - t0) / 900) + 1) * 0.5
      for (const s of stars) {
        ctx.globalAlpha =
          look.starAlpha * (0.35 + 0.55 * (0.5 + 0.5 * Math.sin(now / 600 + s.tw)) + 0.15 * pulse)
        ctx.fillStyle = '#eef4ff'
        ctx.beginPath()
        ctx.arc((s.x / 1000) * w, (s.y / 1000) * h, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Mars disc — large, centered slightly low (window view of the planet)
      const cx = w * 0.5
      const cy = h * 0.58
      const R = Math.min(w, h) * 0.42

      // Soft sun behind / beside Mars
      const sunX = cx + Math.cos(look.sunAngle) * R * 1.55
      const sunY = cy + Math.sin(look.sunAngle) * R * 0.55 - R * 0.35
      const sunR = R * (lighting === 'night' ? 0.12 : 0.28)
      const halo = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 3.5)
      halo.addColorStop(0, look.sunGlow)
      halo.addColorStop(0.5, 'rgba(255,200,140,0.08)')
      halo.addColorStop(1, 'transparent')
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(sunX, sunY, sunR * 3.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = look.sunCore
      ctx.globalAlpha = lighting === 'night' ? 0.45 : 0.95
      ctx.beginPath()
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      // Planet body
      const litX = cx + Math.cos(look.sunAngle) * R * 0.35
      const litY = cy + Math.sin(look.sunAngle) * R * 0.25
      const body = ctx.createRadialGradient(litX, litY, R * 0.1, cx, cy, R)
      body.addColorStop(0, look.marsLit)
      body.addColorStop(0.45, look.marsMid)
      body.addColorStop(1, look.marsDark)
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = body
      ctx.fill()

      // Surface bands / dust storms (subtle)
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.clip()

      ctx.globalAlpha = 0.22
      ctx.strokeStyle = look.marsDark
      ctx.lineWidth = R * 0.04
      for (let i = 0; i < 5; i++) {
        const yy = cy - R * 0.55 + i * R * 0.28 + Math.sin(now / 4000 + i) * R * 0.02
        ctx.beginPath()
        ctx.moveTo(cx - R, yy)
        ctx.quadraticCurveTo(cx, yy + R * 0.08 * ((i % 2) * 2 - 1), cx + R, yy - R * 0.04)
        ctx.stroke()
      }

      // Polar cap hint
      ctx.globalAlpha = lighting === 'night' ? 0.15 : 0.35
      ctx.fillStyle = '#f0e8e0'
      ctx.beginPath()
      ctx.ellipse(cx, cy - R * 0.72, R * 0.35, R * 0.14, 0, 0, Math.PI * 2)
      ctx.fill()

      // Terminator shadow
      const shade = ctx.createLinearGradient(
        cx - Math.cos(look.sunAngle) * R,
        cy - Math.sin(look.sunAngle) * R,
        cx + Math.cos(look.sunAngle) * R,
        cy + Math.sin(look.sunAngle) * R,
      )
      shade.addColorStop(0, 'transparent')
      shade.addColorStop(0.55, 'transparent')
      shade.addColorStop(0.85, 'rgba(0,0,0,0.35)')
      shade.addColorStop(1, 'rgba(0,0,0,0.72)')
      ctx.globalAlpha = 1
      ctx.fillStyle = shade
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2)

      // Slow dust motes near limb
      ctx.fillStyle = 'rgba(255,200,150,0.2)'
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2 + now / 8000
        const rr = R * (0.82 + (i % 3) * 0.05)
        ctx.beginPath()
        ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.92, 1 + (i % 2), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // Atmosphere rim
      const atmo = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.08)
      atmo.addColorStop(0, 'transparent')
      atmo.addColorStop(0.7, look.atmosphere)
      atmo.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2)
      ctx.fillStyle = atmo
      ctx.fill()

      // Thin ring highlight on lit edge
      ctx.strokeStyle = look.marsLit
      ctx.globalAlpha = 0.35
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, cy, R, look.sunAngle - 1.1, look.sunAngle + 1.1)
      ctx.stroke()
      ctx.globalAlpha = 1

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
