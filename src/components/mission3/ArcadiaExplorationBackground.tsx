import { useEffect, useRef } from 'react'
import { DRILL_LAYERS } from '../../data/mission3Data'

type BgMode = 'surface' | 'cross_section'

interface Props {
  mode?: BgMode
  /** 0–1 share of the full cross-section depth (cross_section only). */
  drillProgress?: number
  className?: string
}

/** Arcadia Planitia surface + optional geologic cross-section for drilling. */
export function ArcadiaExplorationBackground({
  mode = 'surface',
  drillProgress = 0,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drillProgressRef = useRef(drillProgress)

  useEffect(() => {
    drillProgressRef.current = drillProgress
  }, [drillProgress])

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

    const draw = (now: number) => {
      const parent = canvas.parentElement
      if (!parent) return
      const w = parent.clientWidth
      const h = parent.clientHeight
      ctx.clearRect(0, 0, w, h)

      const surfaceH = mode === 'cross_section' ? h * 0.48 : h

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, surfaceH)
      sky.addColorStop(0, '#c47848')
      sky.addColorStop(0.45, '#e8a878')
      sky.addColorStop(1, '#b86a3a')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, surfaceH)

      // Far hills
      ctx.fillStyle = 'rgba(90,40,22,0.45)'
      ctx.beginPath()
      ctx.moveTo(0, surfaceH * 0.72)
      ctx.quadraticCurveTo(w * 0.25, surfaceH * 0.55, w * 0.5, surfaceH * 0.68)
      ctx.quadraticCurveTo(w * 0.75, surfaceH * 0.8, w, surfaceH * 0.62)
      ctx.lineTo(w, surfaceH)
      ctx.lineTo(0, surfaceH)
      ctx.fill()

      // Near dunes
      ctx.fillStyle = 'rgba(140,70,40,0.55)'
      ctx.beginPath()
      ctx.moveTo(0, surfaceH)
      ctx.lineTo(0, surfaceH * 0.82)
      ctx.quadraticCurveTo(w * 0.35, surfaceH * 0.7, w * 0.7, surfaceH * 0.85)
      ctx.lineTo(w, surfaceH * 0.78)
      ctx.lineTo(w, surfaceH)
      ctx.fill()

      // Dust motes
      ctx.fillStyle = 'rgba(255,210,160,0.2)'
      for (let i = 0; i < 18; i++) {
        const dx = ((i * 47 + (now - t0) / 40) % w)
        const dy = surfaceH * 0.35 + ((i * 23) % (surfaceH * 0.45))
        ctx.beginPath()
        ctx.arc(dx, dy, 1 + (i % 3) * 0.4, 0, Math.PI * 2)
        ctx.fill()
      }

      // Survey gear silhouette
      const gx = w * 0.72
      const gy = surfaceH * 0.78
      ctx.fillStyle = '#1a2030'
      ctx.fillRect(gx, gy - 18, 28, 18)
      ctx.fillRect(gx + 8, gy - 36, 6, 18)
      ctx.strokeStyle = '#5ee7ff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(gx + 14, gy - 40, 8, 0, Math.PI * 2)
      ctx.stroke()

      if (mode === 'cross_section') {
        const y0 = surfaceH
        const maxDepth = DRILL_LAYERS[DRILL_LAYERS.length - 1]!.to
        const pxPerM = (h - y0) / maxDepth

        ctx.font = '10px monospace'
        for (const layer of DRILL_LAYERS) {
          const top = y0 + layer.from * pxPerM
          const height = (layer.to - layer.from) * pxPerM
          ctx.fillStyle = layer.color
          ctx.fillRect(0, top, w, height)
          ctx.fillStyle = 'rgba(244,255,244,0.75)'
          ctx.fillText(layer.label, 8, top + 13)
        }

        ctx.fillStyle = 'rgba(255,255,255,0.18)'
        const iceTop = y0 + 2.0 * pxPerM
        for (let i = 0; i < 8; i++) {
          ctx.fillRect(w * 0.1 + i * w * 0.1, iceTop + 6, 4, (h - iceTop) * 0.5)
        }

        // Drill bit
        const progress = Math.max(0, Math.min(1, drillProgressRef.current))
        const drillX = w * 0.5
        const drillTop = y0 - 8
        const drillY = drillTop + progress * (h - drillTop - 24)
        ctx.strokeStyle = '#94a3b8'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(drillX, drillTop - 20)
        ctx.lineTo(drillX, drillY)
        ctx.stroke()
        ctx.fillStyle = '#e2e8f0'
        ctx.beginPath()
        ctx.moveTo(drillX - 8, drillY)
        ctx.lineTo(drillX + 8, drillY)
        ctx.lineTo(drillX, drillY + 14)
        ctx.closePath()
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [mode])

  return (
    <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#8a3d22] ${className}`} aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
