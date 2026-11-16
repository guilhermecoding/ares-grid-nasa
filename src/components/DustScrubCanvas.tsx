import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  /** Content revealed under the dust layer. */
  children: ReactNode
  /** Fraction of cleared pixels (0–1) that counts as clean. */
  goal?: number
  brushRadius?: number
  /** Base dust colour; speckles are derived from it. */
  dustColor?: string
  disabled?: boolean
  onProgress?: (fraction: number) => void
  onClean?: () => void
  className?: string
  ariaLabel?: string
}

const SPECKLES = ['rgba(60,28,14,0.55)', 'rgba(214,150,102,0.5)', 'rgba(120,64,36,0.6)', 'rgba(250,200,160,0.25)']
const SAMPLE_STEP = 6

function paintDust(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.globalCompositeOperation = 'source-over'
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const count = Math.round((w * h) / 90)
  for (let i = 0; i < count; i += 1) {
    ctx.fillStyle = SPECKLES[i % SPECKLES.length]!
    const s = 1 + Math.floor(rand() * 4)
    ctx.fillRect(Math.floor(rand() * w), Math.floor(rand() * h), s, s)
  }
  for (let i = 0; i < 14; i += 1) {
    ctx.fillStyle = 'rgba(70,34,18,0.35)'
    ctx.beginPath()
    ctx.ellipse(rand() * w, rand() * h, 6 + rand() * 18, 4 + rand() * 10, rand() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
}

function clearedFraction(ctx: CanvasRenderingContext2D, w: number, h: number) {
  if (w === 0 || h === 0) return 0
  const { data } = ctx.getImageData(0, 0, w, h)
  let total = 0
  let clear = 0
  for (let y = 0; y < h; y += SAMPLE_STEP) {
    for (let x = 0; x < w; x += SAMPLE_STEP) {
      total += 1
      if (data[(y * w + x) * 4 + 3]! < 40) clear += 1
    }
  }
  return total ? clear / total : 0
}

/**
 * Reusable “rub the dust away” surface (Missão 03 ice core, Missão 04 panels).
 * Progress is the real share of transparent pixels on the dust canvas.
 */
export function DustScrubCanvas({
  children,
  goal = 0.9,
  brushRadius = 24,
  dustColor = '#9a5a34',
  disabled = false,
  onProgress,
  onClean,
  className = '',
  ariaLabel = 'Superfície com poeira para esfregar',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastRef = useRef<{ x: number; y: number } | null>(null)
  const movesRef = useRef(0)
  const cleanRef = useRef(false)
  const callbacksRef = useRef({ onProgress, onClean })
  const [clean, setClean] = useState(false)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    callbacksRef.current = { onProgress, onClean }
  }, [onProgress, onClean])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const repaint = () => {
      if (cleanRef.current) return
      const rect = wrap.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(rect.width))
      canvas.height = Math.max(1, Math.round(rect.height))
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      paintDust(ctx, canvas.width, canvas.height, dustColor)
      callbacksRef.current.onProgress?.(0)
    }
    repaint()
    const ro = new ResizeObserver(repaint)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [dustColor])

  const measure = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { willReadFrequently: true })
    if (!canvas || !ctx || cleanRef.current) return
    const fraction = clearedFraction(ctx, canvas.width, canvas.height)
    callbacksRef.current.onProgress?.(Math.min(1, fraction / goal))
    if (fraction >= goal) {
      cleanRef.current = true
      setClean(true)
      callbacksRef.current.onClean?.()
    }
  }, [goal])

  const scrub = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { willReadFrequently: true })
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * canvas.width
    const y = ((clientY - rect.top) / rect.height) * canvas.height
    const from = lastRef.current ?? { x, y }
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = 'rgba(0,0,0,1)'
    ctx.lineWidth = brushRadius * 2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(x, y)
    ctx.stroke()
    lastRef.current = { x, y }
    movesRef.current += 1
    if (movesRef.current % 6 === 0) measure()
  }

  const active = !disabled && !clean

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden select-none ${className}`}
      style={{ touchAction: 'none', cursor: active ? 'none' : 'default' }}
      aria-label={ariaLabel}
      onPointerDown={(e) => {
        if (!active) return
        e.currentTarget.setPointerCapture(e.pointerId)
        lastRef.current = null
        scrub(e.clientX, e.clientY)
      }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        if (!active) return
        if (!e.currentTarget.hasPointerCapture(e.pointerId) && (e.buttons & 1) === 0) {
          lastRef.current = null
          return
        }
        scrub(e.clientX, e.clientY)
      }}
      onPointerUp={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
        lastRef.current = null
        measure()
      }}
      onPointerLeave={() => {
        setCursor(null)
        lastRef.current = null
        measure()
      }}
    >
      {children}
      <canvas
        ref={canvasRef}
        className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-700 ${clean ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden
      />
      {active && cursor ? (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-cyan-hud/80 shadow-[0_0_12px_rgba(94,231,255,0.6)]"
          style={{
            width: brushRadius * 2,
            height: brushRadius * 2,
            left: cursor.x - brushRadius,
            top: cursor.y - brushRadius,
          }}
          aria-hidden
        />
      ) : null}
    </div>
  )
}
