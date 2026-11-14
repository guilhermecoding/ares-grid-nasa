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
  className?: string
}

export function LaunchSpaceCanvas({
  warp = 0.55,
  hologramActive = false,
  cockpit = true,
  className = '',
}: LaunchSpaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const warpRef = useRef(warp)
  const rafRef = useRef(0)

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
    const STAR_COUNT = 180

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

    const resetStar = (s: Star, randomZ = true) => {
      s.x = (Math.random() - 0.5) * w * 2
      s.y = (Math.random() - 0.5) * h * 2
      s.z = randomZ ? Math.random() * w : w
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

    let earthY = h * 0.92
    const t0 = performance.now()

    const draw = (now: number) => {
      const t = (now - t0) / 1000
      const speed = 4 + warpRef.current * 28
      ctx.fillStyle = '#05030c'
      ctx.fillRect(0, 0, w, h)

      // Nebula wash
      const neb = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, w * 0.6)
      neb.addColorStop(0, 'rgba(109,40,217,0.22)')
      neb.addColorStop(1, 'transparent')
      ctx.fillStyle = neb
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2

      for (const s of stars) {
        s.pz = s.z
        s.z -= speed
        if (s.z <= 1) {
          resetStar(s, false)
          continue
        }
        const sx = cx + (s.x / s.z) * w * 0.5
        const sy = cy + (s.y / s.z) * h * 0.5
        const px = cx + (s.x / s.pz) * w * 0.5
        const py = cy + (s.y / s.pz) * h * 0.5
        const alpha = Math.min(1, (1 - s.z / w) * 1.4)
        ctx.strokeStyle = `rgba(200,220,255,${alpha})`
        ctx.lineWidth = Math.max(1, (1 - s.z / w) * 2.2)
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(sx, sy)
        ctx.stroke()
      }

      // Earth curvature receding
      earthY = h * (0.78 + 0.18 * (1 - Math.min(1, warpRef.current)))
      const earthR = w * 1.4
      const earthGrad = ctx.createRadialGradient(cx, earthY + earthR * 0.55, earthR * 0.4, cx, earthY + earthR * 0.55, earthR)
      earthGrad.addColorStop(0, '#1a6bb5')
      earthGrad.addColorStop(0.45, '#0d3d6e')
      earthGrad.addColorStop(0.7, 'rgba(40,120,200,0.35)')
      earthGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = earthGrad
      ctx.beginPath()
      ctx.arc(cx, earthY + earthR * 0.55, earthR, 0, Math.PI * 2)
      ctx.fill()

      // Atmosphere glow
      ctx.strokeStyle = `rgba(94,231,255,${0.35 + Math.sin(t * 2) * 0.1})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(cx, earthY + earthR * 0.55, earthR * 0.72, Math.PI * 1.05, Math.PI * 1.95)
      ctx.stroke()

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className={`absolute inset-0 h-full w-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      {cockpit ? (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="cockpitMetal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1738" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#07040f" stopOpacity="0.98" />
            </linearGradient>
          </defs>
          <path d="M0 0 H100 V14 Q50 22 0 14 Z" fill="url(#cockpitMetal)" />
          <path d="M0 100 H100 V78 Q50 70 0 78 Z" fill="url(#cockpitMetal)" />
          <path d="M0 0 V100 L10 86 V14 Z" fill="url(#cockpitMetal)" opacity="0.9" />
          <path d="M100 0 V100 L90 86 V14 Z" fill="url(#cockpitMetal)" opacity="0.9" />
          <rect x="8" y="12" width="84" height="68" rx="2" fill="none" stroke="#5b4fcf" strokeWidth="0.6" opacity="0.7" />
          <circle cx="18" cy="88" r="1.2" fill="#5ee7ff">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="26" cy="90" r="1" fill="#4ea1ff">
            <animate attributeName="opacity" values="1;0.3;1" dur="2.1s" repeatCount="indefinite" />
          </circle>
          <circle cx="74" cy="90" r="1" fill="#f0b429">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="82" cy="88" r="1.2" fill="#8b5cf6">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="86" r={hologramActive ? 2.8 : 1.6} fill={hologramActive ? '#5ee7ff' : '#2a6fc4'} opacity={hologramActive ? 0.95 : 0.5}>
            {hologramActive && <animate attributeName="r" values="2.2;3.4;2.2" dur="1.2s" repeatCount="indefinite" />}
            {hologramActive && <animate attributeName="opacity" values="0.55;1;0.55" dur="1.2s" repeatCount="indefinite" />}
          </circle>
        </svg>
      ) : null}
    </div>
  )
}
