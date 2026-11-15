import { useEffect, useRef } from 'react'
import type { HabitatLighting } from '../../data/mission2Data'

type RoomAccent = 'exercise' | 'nutrition' | 'hygiene' | 'sleep' | 'idle'

interface Props {
  lighting: HabitatLighting
  room?: RoomAccent
  className?: string
}

const SKY: Record<HabitatLighting, { top: string; mid: string; bottom: string; starAlpha: number; haze: string }> = {
  morning: { top: '#7ec4ff', mid: '#d4b08a', bottom: '#e08858', starAlpha: 0, haze: 'rgba(255,210,160,0.18)' },
  afternoon: { top: '#3d7ec9', mid: '#b8734a', bottom: '#8a4a2e', starAlpha: 0.05, haze: 'rgba(255,160,100,0.12)' },
  dusk: { top: '#2a1a4a', mid: '#8a3d4a', bottom: '#5a2818', starAlpha: 0.35, haze: 'rgba(180,80,60,0.2)' },
  night: { top: '#04070f', mid: '#0a1028', bottom: '#1a0e18', starAlpha: 0.95, haze: 'rgba(40,30,60,0.15)' },
  dawn: { top: '#4a6aaa', mid: '#c47848', bottom: '#e8a060', starAlpha: 0.2, haze: 'rgba(255,180,120,0.2)' },
}

const CABIN: Record<HabitatLighting, string> = {
  morning: '#1a2840',
  afternoon: '#162038',
  dusk: '#121828',
  night: '#0a0e18',
  dawn: '#182438',
}

const WINDOW = { x: 17, y: 7, w: 66, h: 40 }

/** Habitat module interior — metallic window, Arcadia exterior, HUD cabin. */
export function HabitatInteriorBackground({ lighting, room = 'idle', className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sky = SKY[lighting]

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

    const stars = Array.from({ length: 64 }, (_, i) => ({
      x: (i * 73 + 17) % 100,
      y: (i * 41 + 9) % 52,
      r: 0.5 + (i % 5) * 0.28,
      tw: (i % 7) * 0.4,
    }))

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      const rr = Math.min(r, w / 2, h / 2)
      ctx.beginPath()
      ctx.moveTo(x + rr, y)
      ctx.arcTo(x + w, y, x + w, y + h, rr)
      ctx.arcTo(x + w, y + h, x, y + h, rr)
      ctx.arcTo(x, y + h, x, y, rr)
      ctx.arcTo(x, y, x + w, y, rr)
      ctx.closePath()
    }

    const draw = (now: number) => {
      const parent = canvas.parentElement
      if (!parent) return
      const w = parent.clientWidth
      const h = parent.clientHeight
      ctx.clearRect(0, 0, w, h)

      const wx = (WINDOW.x / 100) * w
      const wy = (WINDOW.y / 100) * h
      const ww = (WINDOW.w / 100) * w
      const wh = (WINDOW.h / 100) * h
      const radius = Math.min(ww, wh) * 0.04

      ctx.save()
      roundRect(wx, wy, ww, wh, radius)
      ctx.clip()

      const g = ctx.createLinearGradient(0, wy, 0, wy + wh)
      g.addColorStop(0, sky.top)
      g.addColorStop(0.42, sky.mid)
      g.addColorStop(1, sky.bottom)
      ctx.fillStyle = g
      ctx.fillRect(wx, wy, ww, wh)

      // Far ridge
      ctx.fillStyle = 'rgba(60,28,18,0.4)'
      ctx.beginPath()
      ctx.moveTo(wx, wy + wh)
      ctx.lineTo(wx, wy + wh * 0.58)
      ctx.quadraticCurveTo(wx + ww * 0.2, wy + wh * 0.42, wx + ww * 0.42, wy + wh * 0.55)
      ctx.quadraticCurveTo(wx + ww * 0.62, wy + wh * 0.68, wx + ww, wy + wh * 0.48)
      ctx.lineTo(wx + ww, wy + wh)
      ctx.fill()

      // Mid dunes
      ctx.fillStyle = 'rgba(100,48,28,0.55)'
      ctx.beginPath()
      ctx.moveTo(wx, wy + wh)
      ctx.lineTo(wx, wy + wh * 0.72)
      ctx.quadraticCurveTo(wx + ww * 0.22, wy + wh * 0.58, wx + ww * 0.48, wy + wh * 0.7)
      ctx.quadraticCurveTo(wx + ww * 0.72, wy + wh * 0.84, wx + ww, wy + wh * 0.66)
      ctx.lineTo(wx + ww, wy + wh)
      ctx.fill()

      // Near sand
      ctx.fillStyle = 'rgba(140,70,40,0.45)'
      ctx.beginPath()
      ctx.moveTo(wx, wy + wh)
      ctx.lineTo(wx, wy + wh * 0.88)
      ctx.quadraticCurveTo(wx + ww * 0.35, wy + wh * 0.78, wx + ww * 0.7, wy + wh * 0.9)
      ctx.lineTo(wx + ww, wy + wh * 0.85)
      ctx.lineTo(wx + ww, wy + wh)
      ctx.fill()

      if (sky.starAlpha > 0) {
        const pulse = (Math.sin((now - t0) / 700) + 1) * 0.5
        for (const s of stars) {
          ctx.globalAlpha = sky.starAlpha * (0.4 + 0.5 * Math.sin(now / 500 + s.tw) * 0.5 + 0.25 * pulse)
          ctx.fillStyle = '#f4fff4'
          ctx.beginPath()
          ctx.arc(wx + (s.x / 100) * ww, wy + (s.y / 100) * wh, s.r, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      // Dust motes
      ctx.fillStyle = 'rgba(255,200,150,0.14)'
      for (let i = 0; i < 16; i++) {
        const dx = wx + ((i * 53 + now / 45) % ww)
        const dy = wy + wh * 0.5 + ((i * 19 + now / 90) % (wh * 0.4))
        ctx.beginPath()
        ctx.arc(dx, dy, 1.1 + (i % 3) * 0.3, 0, Math.PI * 2)
        ctx.fill()
      }

      // Atmospheric haze
      const haze = ctx.createLinearGradient(0, wy, 0, wy + wh)
      haze.addColorStop(0, 'transparent')
      haze.addColorStop(0.7, sky.haze)
      haze.addColorStop(1, sky.haze)
      ctx.fillStyle = haze
      ctx.fillRect(wx, wy, ww, wh)

      // Glass reflection / vignette
      const glass = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh)
      glass.addColorStop(0, 'rgba(180,220,255,0.18)')
      glass.addColorStop(0.35, 'rgba(180,220,255,0.04)')
      glass.addColorStop(0.7, 'transparent')
      glass.addColorStop(1, 'rgba(10,20,40,0.28)')
      ctx.fillStyle = glass
      ctx.fillRect(wx, wy, ww, wh)

      const vig = ctx.createRadialGradient(
        wx + ww * 0.5,
        wy + wh * 0.45,
        wh * 0.15,
        wx + ww * 0.5,
        wy + wh * 0.5,
        wh * 0.75,
      )
      vig.addColorStop(0, 'transparent')
      vig.addColorStop(1, 'rgba(5,10,20,0.35)')
      ctx.fillStyle = vig
      ctx.fillRect(wx, wy, ww, wh)

      ctx.restore()
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [sky])

  const lamp = lighting === 'night' ? '#c47848' : lighting === 'dusk' ? '#e8a060' : '#5ee7ff'
  const dim = lighting === 'night' ? 0.35 : 1
  const bolt = lighting === 'night' ? '#6a7088' : '#8a93a8'

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden
      style={{ background: CABIN[lighting] }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Outer metallic bevel */}
        <rect x="14.5" y="4.5" width="71" height="45" rx="2.2" fill="#1c2438" stroke="#3d465c" strokeWidth="0.6" />
        <rect x="15.2" y="5.2" width="69.6" height="43.6" rx="1.8" fill="none" stroke="#6a7388" strokeWidth="0.35" />
        {/* Inner cyan HUD trim */}
        <rect
          x="16.2"
          y="6.2"
          width="67.6"
          height="41.6"
          rx="1.4"
          fill="none"
          stroke="#5ee7ff"
          strokeWidth="0.55"
          opacity={0.75}
        />
        {/* Glass inset shadow */}
        <rect x="17" y="7" width="66" height="40" rx="1.1" fill="rgba(8,14,28,0.12)" stroke="#2a3348" strokeWidth="0.25" />

        {/* Corner bolts */}
        {[
          [16.8, 6.8],
          [81.2, 6.8],
          [16.8, 45.2],
          [81.2, 45.2],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.05" fill="#2a3144" stroke={bolt} strokeWidth="0.25" />
            <circle cx={cx} cy={cy} r="0.35" fill="#0a1018" />
          </g>
        ))}

        {/* Mid-edge fasteners */}
        <circle cx="50" cy="5.8" r="0.7" fill="#2a3144" stroke={bolt} strokeWidth="0.2" />
        <circle cx="50" cy="46.2" r="0.7" fill="#2a3144" stroke={bolt} strokeWidth="0.2" />

        {/* Floor */}
        <path d="M0 72 L100 72 L100 100 L0 100 Z" fill="#0c1424" opacity={0.9} />
        <path d="M0 72 L50 62 L100 72" fill="none" stroke="#30346d" strokeWidth="0.4" />

        {/* Side panels */}
        <rect x="2" y="52" width="14" height="28" rx="0.5" fill="#121a30" stroke="#30346d" strokeWidth="0.35" opacity={dim} />
        <rect x="84" y="52" width="14" height="28" rx="0.5" fill="#121a30" stroke="#30346d" strokeWidth="0.35" opacity={dim} />

        {/* Ceiling lights — warmer at night */}
        <rect x="28" y="2" width="10" height="2" rx="0.5" fill={lamp} opacity={lighting === 'night' ? 0.35 : 0.75} />
        <rect x="46" y="2" width="10" height="2" rx="0.5" fill={lamp} opacity={lighting === 'night' ? 0.2 : 0.85} />
        <rect x="64" y="2" width="10" height="2" rx="0.5" fill={lamp} opacity={lighting === 'night' ? 0.35 : 0.75} />

        {/* Soft cabin light wash matching lighting */}
        {lighting === 'morning' && (
          <rect x="17" y="7" width="66" height="40" rx="1.1" fill="rgba(255,220,170,0.06)" />
        )}
        {lighting === 'dusk' && (
          <rect x="17" y="7" width="66" height="40" rx="1.1" fill="rgba(200,80,60,0.08)" />
        )}

        {/* Room accents */}
        {room === 'exercise' && (
          <g opacity={0.85}>
            <rect x="22" y="78" width="22" height="4" rx="0.5" fill="#5ee7ff" />
            <path d="M70 70 Q78 78 70 86" fill="none" stroke="#f0b429" strokeWidth="1.2" />
            <path d="M74 70 Q82 78 74 86" fill="none" stroke="#f0b429" strokeWidth="1.2" />
          </g>
        )}
        {room === 'nutrition' && (
          <g opacity={0.9}>
            <rect x="30" y="74" width="40" height="12" rx="1" fill="#1a2840" stroke="#5ecf9a" strokeWidth="0.5" />
            <circle cx="38" cy="80" r="2.5" fill="#5ecf9a" />
            <circle cx="48" cy="80" r="2.5" fill="#f0b429" />
            <circle cx="58" cy="80" r="2.5" fill="#ff6b8a" />
            <rect x="72" y="58" width="10" height="16" fill="#143028" stroke="#5ecf9a" strokeWidth="0.4" />
          </g>
        )}
        {room === 'hygiene' && (
          <g opacity={0.9}>
            <rect x="40" y="70" width="20" height="16" rx="1" fill="#1a2038" stroke="#7b8cff" strokeWidth="0.5" />
            <circle cx="50" cy="78" r="3" fill="#5ee7ff" opacity={0.5} />
          </g>
        )}
        {(room === 'sleep' || lighting === 'night' || lighting === 'dawn') && (
          <g opacity={lighting === 'night' ? 0.95 : 0.7}>
            <rect x="34" y="76" width="32" height="12" rx="1" fill="#1a1830" stroke="#c47848" strokeWidth="0.45" />
            <rect x="36" y="74" width="12" height="6" rx="0.8" fill="#f4fff4" opacity={0.35} />
            <circle cx="78" cy="58" r="3" fill="#c47848" opacity={0.55} />
          </g>
        )}

        {lighting === 'night' && <rect x="0" y="0" width="100" height="100" fill="rgba(40,20,10,0.35)" />}
      </svg>
    </div>
  )
}
