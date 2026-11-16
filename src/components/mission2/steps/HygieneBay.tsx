import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import type { HygieneId } from '../../../data/mission2Data'
import { useI18n } from '../../../i18n/locale'
import { soundEngine } from '../../../services/soundEngine'

const SCRUB_GOAL = 560

interface BayProps {
  done: Record<HygieneId, boolean>
  blocked: Record<HygieneId, boolean>
  onDone: (id: HygieneId) => void
}

function paintSpecks(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  count: number,
  alpha: number,
) {
  for (let i = 0; i < count; i++) {
    const x = ((i * 97) % 100) / 100 * w
    const y = ((i * 53) % 100) / 100 * h
    const r = 3 + (i % 5)
    ctx.fillStyle = `rgba(${140 + (i % 40)}, ${48 + (i % 20)}, ${18 + (i % 12)}, ${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function useScrub(done: boolean, onDone: () => void, paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const last = useRef<{ x: number; y: number } | null>(null)
  const distance = useRef(done ? SCRUB_GOAL : 0)
  const [progress, setProgress] = useState(done ? 1 : 0)
  const sent = useRef(done)
  const soundAt = useRef(0)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    let painted = false
    const draw = () => {
      if (painted && distance.current > 0) return
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, rect.width, rect.height)
      if (!done) paint(ctx, rect.width, rect.height)
      painted = true
    }
    draw()
    const observer = new ResizeObserver(() => {
      if (distance.current === 0) {
        painted = false
        draw()
      }
    })
    observer.observe(parent)
    return () => observer.disconnect()
  }, [done, paint])

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    if (progress >= 1 && !sent.current) {
      sent.current = true
      onDoneRef.current()
    }
  }, [progress])

  const scrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (done || sent.current) return
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const rect = parent.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const prev = last.current ?? { x, y }
    const dist = Math.hypot(x - prev.x, y - prev.y)
    last.current = { x, y }
    if (dist < 2) return
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = '#000'
    const steps = Math.max(1, Math.ceil(dist / 8))
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      ctx.beginPath()
      ctx.arc(prev.x + (x - prev.x) * t, prev.y + (y - prev.y) * t, 22, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
    distance.current = Math.min(SCRUB_GOAL, distance.current + dist)
    const next = distance.current / SCRUB_GOAL
    if (next >= 1) ctx.clearRect(0, 0, rect.width, rect.height)
    setProgress(next)
    const now = performance.now()
    if (now - soundAt.current > 90) {
      soundAt.current = now
      soundEngine.click()
    }
  }

  const release = () => {
    last.current = null
  }

  return { canvasRef, progress, scrub, release }
}

function StationFrame({
  title,
  hint,
  progress,
  done,
  blocked,
  children,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  title: string
  hint: string
  progress: number
  done: boolean
  blocked: boolean
  children: ReactNode
  onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void
  onPointerMove?: (event: ReactPointerEvent<HTMLDivElement>) => void
  onPointerUp?: (event: ReactPointerEvent<HTMLDivElement>) => void
}) {
  const { t } = useI18n()
  return (
    <section
      className={`flex flex-col border-2 bg-[#0a1628]/92 shadow-[0_8px_20px_rgba(0,0,0,0.35)] ${
        done ? 'border-life' : 'border-cyan-hud/30'
      } ${blocked ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        <h3 className="font-pixel text-xs text-cyan-hud sm:text-sm">{title}</h3>
        <span className={`font-pixel text-[10px] ${done ? 'text-life' : 'text-void-200'}`}>
          {done ? t('Clean', 'Limpo') : `${Math.round(progress * 100)}%`}
        </span>
      </div>
      <div
        className="relative mx-3 mt-2 h-44 overflow-hidden bg-[#061018] sm:h-52"
        style={{ touchAction: 'none' }}
        onPointerDown={blocked ? undefined : onPointerDown}
        onPointerMove={blocked ? undefined : onPointerMove}
        onPointerUp={blocked ? undefined : onPointerUp}
        onPointerCancel={blocked ? undefined : onPointerUp}
      >
        {children}
        {done ? (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(94,207,154,0.28),transparent_62%)]" />
        ) : null}
      </div>
      <div className="mx-3 mt-2 h-2 overflow-hidden bg-void-950">
        <div
          className={`h-full ${done ? 'bg-life' : 'bg-cyan-hud'}`}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <p className="px-3 pt-2 pb-3 text-sm text-void-100">
        {blocked ? t('Not enough water or energy for this step.', 'Sem água ou energia para esta etapa.') : hint}
      </p>
    </section>
  )
}

function MouthArt() {
  return (
    <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full" aria-hidden>
      <ellipse cx="100" cy="62" rx="78" ry="46" fill="#e07a8a" />
      <ellipse cx="100" cy="64" rx="62" ry="34" fill="#6a2030" />
      <ellipse cx="100" cy="78" rx="40" ry="14" fill="#c45a6a" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={`u${i}`} x={58 + i * 15} y="46" width="12" height="18" rx="2" fill="#f4fff4" />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={`l${i}`} x={58 + i * 15} y="70" width="12" height="16" rx="2" fill="#f4fff4" />
      ))}
    </svg>
  )
}

function paintMouthDirt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = 'rgba(138, 61, 34, 0.45)'
  ctx.fillRect(w * 0.22, h * 0.28, w * 0.56, h * 0.48)
  paintSpecks(ctx, w, h, 36, 0.9)
}

function MouthStation({ done, blocked, onDone }: { done: boolean; blocked: boolean; onDone: () => void }) {
  const { t } = useI18n()
  const { canvasRef, progress, scrub, release } = useScrub(done, onDone, paintMouthDirt)
  const [brush, setBrush] = useState<{ x: number; y: number } | null>(null)

  const placeBrush = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setBrush({ x: event.clientX - rect.left, y: event.clientY - rect.top })
    scrub(event)
  }

  return (
    <StationFrame
      title={t('Brush your teeth', 'Escovar os dentes')}
      hint={t('Scrub the mouth with the cursor.', 'Esfregue a boca com o cursor.')}
      progress={progress}
      done={done}
      blocked={blocked}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        placeBrush(event)
      }}
      onPointerMove={(event) => {
        if (event.buttons === 0) return
        placeBrush(event)
      }}
      onPointerUp={() => {
        setBrush(null)
        release()
      }}
    >
      <MouthArt />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {brush && !done ? (
        <svg
          viewBox="0 0 32 32"
          className="pointer-events-none absolute size-10"
          style={{ left: brush.x - 8, top: brush.y - 28 }}
          aria-hidden
        >
          <rect x="14" y="2" width="4" height="16" fill="#8d97a6" />
          <rect x="8" y="16" width="16" height="8" rx="2" fill="#f4fff4" />
          <rect x="10" y="16" width="2" height="5" fill="#5ee7ff" />
          <rect x="15" y="16" width="2" height="5" fill="#5ee7ff" />
          <rect x="20" y="16" width="2" height="5" fill="#5ee7ff" />
        </svg>
      ) : null}
      {progress > 0.15 && !done ? (
        <span className="pointer-events-none absolute top-3 left-6 size-3 animate-ping rounded-full bg-cyan-hud/70" />
      ) : null}
    </StationFrame>
  )
}

function FaucetStation({ done, blocked, onDone }: { done: boolean; blocked: boolean; onDone: () => void }) {
  const { t } = useI18n()
  const bayRef = useRef<HTMLDivElement>(null)
  const gloveRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<HTMLDivElement>(null)
  const holding = useRef(false)
  const [pos, setPos] = useState(done ? { x: 58, y: 46 } : { x: 16, y: 64 })
  const [progress, setProgress] = useState(done ? 1 : 0)
  const [washing, setWashing] = useState(false)
  const sent = useRef(done)
  const onDoneRef = useRef(onDone)
  const washLoop = useRef(0)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    if (progress >= 1 && !sent.current) {
      sent.current = true
      onDoneRef.current()
    }
  }, [progress])

  const stopWash = () => {
    holding.current = false
    setWashing(false)
    cancelAnimationFrame(washLoop.current)
  }

  const trackWash = () => {
    if (!holding.current) return
    const glove = gloveRef.current?.getBoundingClientRect()
    const stream = streamRef.current?.getBoundingClientRect()
    const overlap = Boolean(
      holding.current &&
        glove &&
        stream &&
        glove.left < stream.right &&
        glove.right > stream.left &&
        glove.top < stream.bottom &&
        glove.bottom > stream.top,
    )
    setWashing((current) => (current === overlap ? current : overlap))
    if (overlap) setProgress((value) => (value >= 1 ? value : Math.min(1, value + 0.012)))
    if (!holding.current) return
    washLoop.current = requestAnimationFrame(trackWash)
  }

  useEffect(() => () => cancelAnimationFrame(washLoop.current), [])

  const drag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!holding.current || done) return
    const box = bayRef.current?.getBoundingClientRect()
    if (!box) return
    const x = ((event.clientX - box.left) / box.width) * 100
    const y = ((event.clientY - box.top) / box.height) * 100
    setPos({ x: Math.min(78, Math.max(8, x)), y: Math.min(74, Math.max(28, y)) })
  }

  return (
    <StationFrame
      title={t('Wash the glove', 'Lavar a luva')}
      hint={t('Drag the glove under the faucet.', 'Arraste a luva para debaixo da torneira.')}
      progress={progress}
      done={done}
      blocked={blocked}
    >
      <div ref={bayRef} className="absolute inset-0">
        <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full" aria-hidden>
          <rect x="78" y="8" width="44" height="10" rx="2" fill="#8d97a6" />
          <rect x="92" y="16" width="16" height="18" fill="#c5ced8" />
          <rect x="88" y="32" width="24" height="8" rx="2" fill="#5ee7ff" />
        </svg>
        <div
          ref={streamRef}
          className="absolute top-[28%] left-[46%] h-[70%] w-[12%] overflow-hidden"
          aria-hidden
        >
          <div
            className="h-[200%] w-full"
            style={{
              animation: 'wash-flow 0.45s linear infinite',
              backgroundImage:
                'repeating-linear-gradient(to bottom, transparent 0 8px, rgba(94,231,255,0.9) 8px 14px)',
            }}
          />
        </div>
        {washing ? (
          <>
            <span className="absolute top-[46%] left-[42%] size-3 animate-ping rounded-full bg-cyan-hud" />
            <span className="absolute top-[58%] left-[56%] size-2 animate-ping rounded-full bg-cyan-hud/80" />
          </>
        ) : null}
        <div
          ref={gloveRef}
          className="absolute size-16 cursor-grab active:cursor-grabbing sm:size-20"
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, touchAction: 'none' }}
          onPointerDown={(event) => {
            if (done || blocked) return
            holding.current = true
            event.currentTarget.setPointerCapture(event.pointerId)
            event.stopPropagation()
            cancelAnimationFrame(washLoop.current)
            washLoop.current = requestAnimationFrame(trackWash)
          }}
          onPointerMove={drag}
          onPointerUp={stopWash}
          onPointerCancel={stopWash}
        >
          <svg viewBox="0 0 64 64" className="h-full w-full" aria-label={t('Astronaut glove', 'Luva do astronauta')}>
            <path d="M14 30c0-8 6-14 14-14h12c6 0 10 4 10 10v16c0 10-8 16-18 16H24C16 58 14 48 14 40Z" fill="#f4fff4" stroke="#1a1c3a" strokeWidth="3" />
            <path d="M18 28c2-10 8-16 14-16" fill="none" stroke="#5ee7ff" strokeWidth="3" />
            <rect x="16" y="40" width="28" height="8" rx="2" fill="#f97316" />
            <circle cx="30" cy="30" r="4" fill="#a34a28" opacity={1 - progress} />
            <circle cx="40" cy="36" r="3" fill="#c45a30" opacity={1 - progress} />
            <circle cx="26" cy="40" r="2.5" fill="#8a3d22" opacity={1 - progress} />
          </svg>
        </div>
      </div>
    </StationFrame>
  )
}

function BenchArt() {
  return (
    <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full" aria-hidden>
      <rect x="16" y="28" width="168" height="70" fill="#12203a" stroke="#5ee7ff" strokeOpacity="0.45" strokeWidth="2" />
      <rect x="28" y="40" width="52" height="36" fill="#061018" stroke="#5ee7ff" strokeWidth="2" />
      <path d="M34 62 H74 M40 48 V70 M58 48 V70" stroke="#5ee7ff" strokeWidth="2" />
      <rect x="112" y="40" width="52" height="36" fill="#061018" stroke="#f97316" strokeWidth="2" />
      <path d="M118 64 C128 50 140 58 158 46" fill="none" stroke="#c45a30" strokeWidth="3" />
      <rect x="16" y="96" width="168" height="8" fill="#8d97a6" />
    </svg>
  )
}

function paintBenchDirt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = 'rgba(164, 74, 40, 0.38)'
  ctx.fillRect(0, h * 0.2, w, h * 0.7)
  paintSpecks(ctx, w, h, 70, 0.85)
}

function BenchStation({ done, blocked, onDone }: { done: boolean; blocked: boolean; onDone: () => void }) {
  const { t } = useI18n()
  const { canvasRef, progress, scrub, release } = useScrub(done, onDone, paintBenchDirt)

  return (
    <StationFrame
      title={t('Wipe the bench', 'Limpar a bancada')}
      hint={t('Scrub the dust until the bench shines.', 'Esfregue a poeira até a bancada brilhar.')}
      progress={progress}
      done={done}
      blocked={blocked}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        scrub(event)
      }}
      onPointerMove={(event) => {
        if (event.buttons === 0) return
        scrub(event)
      }}
      onPointerUp={release}
    >
      <BenchArt />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {progress > 0.4 && progress < 1 ? (
        <span className="pointer-events-none absolute right-4 bottom-4 size-2 animate-ping rounded-full bg-[#f4fff4]" />
      ) : null}
    </StationFrame>
  )
}

/** Three hands-on hygiene toys: scrub a mouth, wash a glove, wipe the bench. */
export function HygieneBay({ done, blocked, onDone }: BayProps) {
  return (
    <>
      <style>{'@keyframes wash-flow { from { transform: translateY(-50%); } to { transform: translateY(0); } }'}</style>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-3 lg:grid-cols-3">
      <MouthStation done={done.teeth} blocked={blocked.teeth} onDone={() => onDone('teeth')} />
      <FaucetStation done={done.body} blocked={blocked.body} onDone={() => onDone('body')} />
      <BenchStation done={done.sensors} blocked={blocked.sensors} onDone={() => onDone('sensors')} />
      </div>
    </>
  )
}
