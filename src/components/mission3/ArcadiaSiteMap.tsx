import { useEffect, useRef } from 'react'

/** Top-down Arcadia map: dunes, a rocky slope and a crater. */
export function ArcadiaSiteMap() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
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

      const ground = ctx.createLinearGradient(0, 0, w, h)
      ground.addColorStop(0, '#d4895a')
      ground.addColorStop(0.45, '#b5653a')
      ground.addColorStop(1, '#7a3b22')
      ctx.fillStyle = ground
      ctx.fillRect(0, 0, w, h)

      let seed = 11
      const rand = () => {
        seed = (seed * 16807) % 2147483647
        return seed / 2147483647
      }
      for (let i = 0; i < 28; i += 1) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(90,40,18,0.28)' : 'rgba(232,170,120,0.22)'
        ctx.beginPath()
        ctx.ellipse(rand() * w, rand() * h, 30 + rand() * 90, 14 + rand() * 28, rand() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }

      const slopeX = w * 0.22
      const slopeY = h * 0.58
      ctx.save()
      ctx.translate(slopeX, slopeY)
      ctx.rotate(-0.4)
      for (let i = 0; i < 7; i += 1) {
        ctx.fillStyle = i % 2 === 0 ? '#6a341c' : '#3d1c10'
        ctx.beginPath()
        ctx.moveTo(-70 + i * 16, 30)
        ctx.lineTo(-40 + i * 16, -36)
        ctx.lineTo(-16 + i * 16, 30)
        ctx.fill()
      }
      ctx.restore()

      const plain = ctx.createRadialGradient(w * 0.52, h * 0.38, 8, w * 0.52, h * 0.38, w * 0.16)
      plain.addColorStop(0, 'rgba(232,196,160,0.55)')
      plain.addColorStop(1, 'rgba(232,196,160,0)')
      ctx.fillStyle = plain
      ctx.beginPath()
      ctx.ellipse(w * 0.52, h * 0.38, w * 0.16, h * 0.18, 0, 0, Math.PI * 2)
      ctx.fill()

      const cx = w * 0.76
      const cy = h * 0.64
      const r = Math.min(w, h) * 0.16
      ctx.beginPath()
      ctx.ellipse(cx + r * 0.18, cy + r * 0.22, r * 1.05, r * 0.72, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(40,16,8,0.4)'
      ctx.fill()
      const bowl = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.2, r * 0.15, cx, cy, r)
      bowl.addColorStop(0, '#f0c09a')
      bowl.addColorStop(0.45, '#c47848')
      bowl.addColorStop(0.72, '#6d3018')
      bowl.addColorStop(1, '#2c140c')
      ctx.beginPath()
      ctx.ellipse(cx, cy, r, r * 0.7, 0, 0, Math.PI * 2)
      ctx.fillStyle = bowl
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(cx, cy, r * 0.48, r * 0.32, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#3a1c12'
      ctx.fill()
    }

    draw()
    const ro = new ResizeObserver(draw)
    if (canvas.parentElement) ro.observe(canvas.parentElement)
    return () => ro.disconnect()
  }, [])

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />
}
