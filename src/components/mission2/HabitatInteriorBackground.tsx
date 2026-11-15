import { useEffect, useRef } from 'react'
import type { HabitatLighting } from '../../data/mission2Data'

type RoomAccent = 'exercise' | 'nutrition' | 'hygiene' | 'sleep' | 'idle'

interface Props {
  lighting: HabitatLighting
  room?: RoomAccent
  className?: string
}

const SKY: Record<HabitatLighting, { top: string; mid: string; bottom: string; starAlpha: number }> = {
  morning: { top: '#6eb6ff', mid: '#c4a07a', bottom: '#d4784a', starAlpha: 0 },
  afternoon: { top: '#3d7ec9', mid: '#b8734a', bottom: '#8a4a2e', starAlpha: 0 },
  dusk: { top: '#2a1a4a', mid: '#8a3d4a', bottom: '#5a2818', starAlpha: 0.25 },
  night: { top: '#050816', mid: '#0c1230', bottom: '#1a0e18', starAlpha: 0.95 },
  dawn: { top: '#4a6aaa', mid: '#c47848', bottom: '#e8a060', starAlpha: 0.15 },
}

const CABIN: Record<HabitatLighting, string> = {
  morning: '#1a2840',
  afternoon: '#162038',
  dusk: '#121828',
  night: '#0a0e18',
  dawn: '#182438',
}

/** Habitat module interior — SVG structure + canvas stars/dust in the window. */
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

    const stars = Array.from({ length: 48 }, (_, i) => ({
      x: (i * 73 + 17) % 100,
      y: (i * 41 + 9) % 55,
      r: 0.6 + (i % 4) * 0.35,
      tw: (i % 7) * 0.4,
    }))

    const draw = (now: number) => {
      const parent = canvas.parentElement
      if (!parent) return
      const w = parent.clientWidth
      const h = parent.clientHeight
      ctx.clearRect(0, 0, w, h)

      // Window viewport approx (matches SVG window)
      const wx = w * 0.18
      const wy = h * 0.08
      const ww = w * 0.64
      const wh = h * 0.42

      ctx.save()
      ctx.beginPath()
      ctx.rect(wx, wy, ww, wh)
      ctx.clip()

      const g = ctx.createLinearGradient(0, wy, 0, wy + wh)
      g.addColorStop(0, sky.top)
      g.addColorStop(0.55, sky.mid)
      g.addColorStop(1, sky.bottom)
      ctx.fillStyle = g
      ctx.fillRect(wx, wy, ww, wh)

      // Distant dunes
      ctx.fillStyle = 'rgba(80,40,24,0.55)'
      ctx.beginPath()
      ctx.moveTo(wx, wy + wh)
      ctx.lineTo(wx, wy + wh * 0.72)
      ctx.quadraticCurveTo(wx + ww * 0.25, wy + wh * 0.55, wx + ww * 0.5, wy + wh * 0.7)
      ctx.quadraticCurveTo(wx + ww * 0.75, wy + wh * 0.82, wx + ww, wy + wh * 0.65)
      ctx.lineTo(wx + ww, wy + wh)
      ctx.fill()

      if (sky.starAlpha > 0) {
        const pulse = (Math.sin((now - t0) / 700) + 1) * 0.5
        for (const s of stars) {
          ctx.globalAlpha = sky.starAlpha * (0.45 + 0.55 * Math.sin(now / 500 + s.tw) * 0.5 + 0.25 * pulse)
          ctx.fillStyle = '#f4fff4'
          ctx.beginPath()
          ctx.arc(wx + (s.x / 100) * ww, wy + (s.y / 100) * wh, s.r, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      // Soft dust motes
      ctx.fillStyle = 'rgba(255,200,150,0.12)'
      for (let i = 0; i < 12; i++) {
        const dx = wx + ((i * 53 + now / 40) % ww)
        const dy = wy + wh * 0.55 + ((i * 19) % (wh * 0.35))
        ctx.beginPath()
        ctx.arc(dx, dy, 1.2, 0, Math.PI * 2)
        ctx.fill()
      }

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

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden
      style={{ background: CABIN[lighting] }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Window frame */}
        <rect x="16" y="6" width="68" height="44" rx="1.5" fill="none" stroke="#5ee7ff" strokeWidth="0.8" opacity={0.7} />
        <rect x="17" y="7" width="66" height="42" fill="rgba(10,20,40,0.15)" />

        {/* Floor */}
        <path d="M0 72 L100 72 L100 100 L0 100 Z" fill="#0c1424" opacity={0.9} />
        <path d="M0 72 L50 62 L100 72" fill="none" stroke="#30346d" strokeWidth="0.4" />

        {/* Side panels */}
        <rect x="2" y="52" width="14" height="28" rx="0.5" fill="#121a30" stroke="#30346d" strokeWidth="0.35" opacity={dim} />
        <rect x="84" y="52" width="14" height="28" rx="0.5" fill="#121a30" stroke="#30346d" strokeWidth="0.35" opacity={dim} />

        {/* Ceiling lights */}
        <rect x="28" y="2" width="10" height="2" rx="0.5" fill={lamp} opacity={lighting === 'night' ? 0.35 : 0.75} />
        <rect x="46" y="2" width="10" height="2" rx="0.5" fill={lamp} opacity={lighting === 'night' ? 0.2 : 0.85} />
        <rect x="64" y="2" width="10" height="2" rx="0.5" fill={lamp} opacity={lighting === 'night' ? 0.35 : 0.75} />

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

        {/* Warm night wash */}
        {lighting === 'night' && (
          <rect x="0" y="0" width="100" height="100" fill="rgba(40,20,10,0.35)" />
        )}
      </svg>
    </div>
  )
}
