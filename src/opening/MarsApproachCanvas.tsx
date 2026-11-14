import { useEffect, useRef } from 'react'

interface MarsApproachCanvasProps {
  /** 0 = far approach, 1 = landed / surface */
  progress?: number
  className?: string
}

export function MarsApproachCanvas({ progress = 0, className = '' }: MarsApproachCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(progress)
  const rafRef = useRef(0)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    const stars: { x: number; y: number; s: number }[] = []

    const resize = () => {
      const parent = canvas.parentElement
      w = parent?.clientWidth ?? window.innerWidth
      h = parent?.clientHeight ?? window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      stars.length = 0
      for (let i = 0; i < 90; i++) {
        stars.push({ x: Math.random() * w, y: Math.random() * h * 0.55, s: Math.random() * 1.8 + 0.4 })
      }
    }

    resize()
    const onResize = () => resize()
    window.addEventListener('resize', onResize)

    const t0 = performance.now()

    const draw = (now: number) => {
      const t = (now - t0) / 1000
      const p = Math.min(1, Math.max(0, progressRef.current))
      ctx.fillStyle = '#0a0614'
      ctx.fillRect(0, 0, w, h)

      for (const st of stars) {
        const a = 0.3 + Math.sin(t * 2 + st.x) * 0.2
        ctx.fillStyle = `rgba(220,230,255,${a * (1 - p * 0.7)})`
        ctx.fillRect(st.x, st.y, st.s, st.s)
      }

      const cx = w * 0.5
      const baseY = h * (0.55 - p * 0.12)
      const radius = w * (0.12 + p * 0.95)

      // Mars disk
      const mars = ctx.createRadialGradient(cx - radius * 0.2, baseY - radius * 0.25, radius * 0.1, cx, baseY, radius)
      mars.addColorStop(0, '#d4895a')
      mars.addColorStop(0.35, '#b85a32')
      mars.addColorStop(0.7, '#8a3d22')
      mars.addColorStop(1, '#4a2012')
      ctx.fillStyle = mars
      ctx.beginPath()
      ctx.arc(cx, baseY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Dark maria patches
      ctx.fillStyle = 'rgba(70,30,18,0.35)'
      ctx.beginPath()
      ctx.ellipse(cx - radius * 0.25, baseY - radius * 0.1, radius * 0.28, radius * 0.16, -0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(cx + radius * 0.2, baseY + radius * 0.15, radius * 0.22, radius * 0.12, 0.4, 0, Math.PI * 2)
      ctx.fill()

      // Atmosphere rim
      ctx.strokeStyle = `rgba(255,160,100,${0.25 + p * 0.2})`
      ctx.lineWidth = 2 + p * 3
      ctx.beginPath()
      ctx.arc(cx, baseY, radius * 1.02, 0, Math.PI * 2)
      ctx.stroke()

      // Surface reveal near end
      if (p > 0.55) {
        const surfaceAlpha = (p - 0.55) / 0.45
        const groundY = h * (0.55 + (1 - surfaceAlpha) * 0.35)
        const ground = ctx.createLinearGradient(0, groundY, 0, h)
        ground.addColorStop(0, `rgba(180,100,55,${0.85 * surfaceAlpha})`)
        ground.addColorStop(0.4, `rgba(140,70,40,${0.95 * surfaceAlpha})`)
        ground.addColorStop(1, `rgba(60,30,18,${surfaceAlpha})`)
        ctx.fillStyle = ground
        ctx.fillRect(0, groundY, w, h - groundY)

        // Rock silhouettes
        ctx.fillStyle = `rgba(40,20,12,${0.7 * surfaceAlpha})`
        const rocks = [
          [0.1, 0.08, 0.06],
          [0.35, 0.12, 0.09],
          [0.62, 0.07, 0.05],
          [0.82, 0.14, 0.1],
        ] as const
        for (const [rx, rw, rh] of rocks) {
          ctx.beginPath()
          ctx.moveTo(w * rx, h)
          ctx.lineTo(w * (rx + rw * 0.3), h - h * rh)
          ctx.lineTo(w * (rx + rw * 0.7), h - h * rh * 0.7)
          ctx.lineTo(w * (rx + rw), h)
          ctx.closePath()
          ctx.fill()
        }

        // Dust haze
        ctx.fillStyle = `rgba(200,120,70,${0.12 * surfaceAlpha})`
        ctx.fillRect(0, groundY - 20, w, 40)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${className}`} aria-hidden />
}
