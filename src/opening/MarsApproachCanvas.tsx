import { useEffect, useRef } from 'react'
import { createMarsStars, drawMarsNameCallout, drawMarsZoom, marsApproachFrame, MARS_ZOOM_LOOKS } from '../components/marsZoom'

interface MarsApproachCanvasProps {
  /** 0 = far approach, 1 = landed / surface */
  progress?: number
  /** Planet name in the active language. It rides the zoom. */
  label: string
  /** Freeze rAF while dialogs are open */
  paused?: boolean
  className?: string
}

export function MarsApproachCanvas({ progress = 0, paused = false, label, className = '' }: MarsApproachCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(progress)
  const pausedRef = useRef(paused)
  const labelRef = useRef(label)
  const rafRef = useRef(0)
  const drawRef = useRef<((now: number) => void) | null>(null)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    labelRef.current = label
    if (pausedRef.current) drawRef.current?.(performance.now())
  }, [label])

  useEffect(() => {
    pausedRef.current = paused
    if (paused) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      return
    }
    if (drawRef.current && rafRef.current === 0) {
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
    const stars = createMarsStars()

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
    }

    resize()
    const onResize = () => resize()
    window.addEventListener('resize', onResize)

    const t0 = performance.now()

    const draw = (now: number) => {
      if (!alive) return
      const p = Math.min(1, Math.max(0, progressRef.current))
      const frame = marsApproachFrame(w, h, p)
      drawMarsZoom(ctx, w, h, now, t0, MARS_ZOOM_LOOKS.morning, stars, frame)
      drawMarsNameCallout(ctx, frame, labelRef.current, { w, h })

      if (pausedRef.current) {
        rafRef.current = 0
        return
      }
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
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full transition-[filter] duration-300 ${className}`}
      style={paused ? { filter: 'grayscale(0.85) brightness(0.65)' } : undefined}
      aria-hidden
    />
  )
}
