import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo,
} from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { soundEngine } from '../../services/soundEngine'

export interface ActivityCardModel {
  id: string
  title: string
  detail?: string
  color: string
  energyCost: number
  waterCostL: number
  wellbeingGain: number
  iconSrc?: string
  iconNode?: ReactNode
}

const SWIPE_OFFSET = 110
const SWIPE_VELOCITY = 550
const FLY_MS = 280

type ExitDir = 'left' | 'right' | null

function CardFace({ card, selected = false }: { card: ActivityCardModel; selected?: boolean }) {
  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-xl p-3 shadow-[0_10px_22px_rgba(0,0,0,0.35)] sm:p-3.5"
      style={{
        border: `3px solid ${selected ? '#1f8a52' : card.color}`,
        background: '#f7f4ee',
      }}
    >
      {selected ? (
        <span
          className="absolute top-2 left-2 z-10 flex size-6 items-center justify-center rounded-full bg-[#1f8a52] shadow-sm"
          aria-label="Selecionado"
        >
          <Check className="size-3.5 text-[#e8ffe8]" strokeWidth={3} />
        </span>
      ) : null}

      <div
        className="mx-auto flex size-16 items-center justify-center rounded-lg sm:size-[4.5rem]"
        style={{ background: `${card.color}40`, border: `2px solid ${card.color}` }}
      >
        {card.iconSrc ? (
          <img src={card.iconSrc} alt="" className="size-11 object-contain sm:size-12" draggable={false} />
        ) : (
          <span className="scale-110 sm:scale-125">{card.iconNode}</span>
        )}
      </div>

      <h3 className="mt-2.5 text-center font-pixel text-sm leading-tight text-[#1a1c3a] sm:text-base">{card.title}</h3>
      {card.detail ? (
        <p className="mt-1 line-clamp-2 text-center font-pixel text-[9px] leading-snug text-[#3d4454] sm:text-[10px]">
          {card.detail}
        </p>
      ) : null}

      <div className="mt-auto space-y-1 pt-2 text-center font-pixel text-[10px] sm:text-xs">
        <p className="font-bold" style={{ color: card.color }}>
          +{card.wellbeingGain} saúde
        </p>
        {(card.energyCost > 0 || card.waterCostL > 0) && (
          <p className="text-[#8a4b12]">
            {card.energyCost > 0 ? `−${card.energyCost}% energia` : null}
            {card.energyCost > 0 && card.waterCostL > 0 ? ' · ' : null}
            {card.waterCostL > 0 ? `−${card.waterCostL}L` : null}
          </p>
        )}
      </div>
    </div>
  )
}

interface SwipeCardProps {
  card: ActivityCardModel
  active: boolean
  selected?: boolean
  stackIndex: number
  exitDir: ExitDir
  onDragDecision: (dir: 'left' | 'right') => void
  dragX: MotionValue<number>
}

function SwipeCard({
  card,
  active,
  selected = false,
  stackIndex,
  exitDir,
  onDragDecision,
  dragX,
}: SwipeCardProps) {
  const rotate = useTransform(dragX, [-200, 0, 200], [-14, 0, 14])
  const yesOpacity = useTransform(dragX, [20, 100], [0, 1])
  const noOpacity = useTransform(dragX, [-100, -20], [1, 0])

  const behind = !active
  const scale = 1 - stackIndex * 0.04
  const yOffset = stackIndex * 10
  const showSelected = selected || exitDir === 'right'
  const canDrag = active && !exitDir && !selected

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        zIndex: 20 - stackIndex,
        ...(canDrag ? { x: dragX, rotate } : {}),
      }}
      animate={
        exitDir === 'right'
          ? { x: 480, rotate: 22, opacity: 0, scale: 1, y: 0 }
          : exitDir === 'left'
            ? { x: -480, rotate: -22, opacity: 0, scale: 1, y: 0 }
            : { scale, y: behind ? yOffset : 0, opacity: 1, x: 0, rotate: 0 }
      }
      transition={exitDir ? { duration: FLY_MS / 1000, ease: 'easeIn' } : { type: 'spring', stiffness: 320, damping: 26 }}
      drag={canDrag ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.92}
      onDragEnd={(_, info: PanInfo) => {
        if (!canDrag) return
        const { offset, velocity } = info
        if (offset.x > SWIPE_OFFSET || velocity.x > SWIPE_VELOCITY) {
          onDragDecision('right')
          return
        }
        if (offset.x < -SWIPE_OFFSET || velocity.x < -SWIPE_VELOCITY) {
          onDragDecision('left')
        }
      }}
    >
      <CardFace card={card} selected={showSelected} />

      {canDrag ? (
        <>
          <motion.div
            className="pointer-events-none absolute top-3 left-3 rounded border-[3px] border-[#1f8a52] px-2 py-0.5 font-pixel text-sm font-bold text-[#1f8a52] sm:text-base"
            style={{ opacity: yesOpacity, rotate: -12 }}
          >
            SIM
          </motion.div>
          <motion.div
            className="pointer-events-none absolute top-3 right-3 rounded border-[3px] border-[#e11d48] px-2 py-0.5 font-pixel text-sm font-bold text-[#e11d48] sm:text-base"
            style={{ opacity: noOpacity, rotate: 12 }}
          >
            NÃO
          </motion.div>
        </>
      ) : null}
    </motion.div>
  )
}

/** Compact stage title beside the status indicators (content-sized, not full-bleed). */
export function StageHeader({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="pointer-events-none absolute top-3 right-16 left-[7.5rem] z-30 sm:left-[9.5rem] sm:right-[4.5rem]">
      <div className="pointer-events-auto w-fit max-w-full rounded-md border border-cyan-hud/40 bg-[#0a1628] px-2.5 py-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.45)] sm:px-3 sm:py-2">
        <h2 className="font-pixel text-xs leading-snug whitespace-normal text-cyan-hud sm:text-sm">
          {title}
        </h2>
        {subtitle ? (
          <div className="mt-0.5 font-pixel text-[10px] leading-snug whitespace-normal text-void-100 sm:text-[11px]">
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  )
}

interface SwipeDeckProps {
  cards: ActivityCardModel[]
  /** Ids already accepted — stay visible with a green check, not swipeable. */
  selectedIds?: string[]
  canAccept?: (id: string) => boolean
  onAccept: (id: string) => void
  emptyMessage?: string
}

/** Tinder-style vertical card stack: right/check accepts, left/X sends to back. */
export function SwipeDeck({
  cards,
  selectedIds = [],
  canAccept,
  onAccept,
  emptyMessage = 'Etapa completa — continue quando quiser.',
}: SwipeDeckProps) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const [order, setOrder] = useState(() => cards.map((c) => c.id).filter((id) => !selectedSet.has(id)))
  const [exitDir, setExitDir] = useState<ExitDir>(null)
  const pendingAction = useRef<'accept' | 'skip' | null>(null)
  const dragX = useMotionValue(0)

  const cardIdsKey = cards.map((c) => c.id).join('|')
  const selectedKey = selectedIds.join('|')

  useEffect(() => {
    const availableIds = new Set(cards.map((c) => c.id).filter((id) => !selectedSet.has(id)))
    setOrder((prev) => {
      const kept = prev.filter((id) => availableIds.has(id))
      const missing = [...availableIds].filter((id) => !kept.includes(id))
      return [...kept, ...missing]
    })
    setExitDir(null)
    pendingAction.current = null
    dragX.set(0)
  }, [cardIdsKey, selectedKey, cards, selectedSet, dragX])

  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])
  const queue = order.flatMap((id) => {
    if (selectedSet.has(id)) return []
    const c = byId.get(id)
    return c ? [c] : []
  })
  const selectedCards = selectedIds.flatMap((id) => {
    const c = byId.get(id)
    return c ? [c] : []
  })
  const top = queue[0] ?? null
  const stack = queue.slice(0, 3).map((card) => ({ card, selected: false as const }))

  const finishExitRef = useRef<() => void>(() => {})
  finishExitRef.current = () => {
    const action = pendingAction.current
    const id = top?.id
    pendingAction.current = null
    setExitDir(null)
    dragX.set(0)
    if (!id || !action) return

    if (action === 'accept') {
      onAccept(id)
      return
    }

    setOrder((prev) => {
      if (prev.length < 2) return prev
      const [first, ...rest] = prev
      return [...rest, first!]
    })
  }

  const startExit = (dir: 'left' | 'right', action: 'accept' | 'skip') => {
    if (exitDir || !top) return
    pendingAction.current = action
    setExitDir(dir)
    soundEngine.step()
    window.setTimeout(() => finishExitRef.current(), FLY_MS)
  }

  const tryAccept = () => {
    if (!top || exitDir) return
    if (canAccept && !canAccept(top.id)) {
      dragX.set(0)
      return
    }
    startExit('right', 'accept')
  }

  const trySkip = () => {
    if (!top || exitDir) return
    if (queue.length < 2) {
      dragX.set(0)
      return
    }
    startExit('left', 'skip')
  }

  const handleDragDecision = (dir: 'left' | 'right') => {
    if (dir === 'right') tryAccept()
    else trySkip()
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-md flex-col items-center justify-center px-3 sm:px-4">
      <div className="flex w-full items-start justify-center gap-3 sm:gap-4">
        <div className="flex w-[min(58vw,11.5rem)] shrink-0 flex-col items-center sm:w-[min(48vw,12.5rem)]">
          <div className="relative h-[min(34dvh,14.5rem)] w-full sm:h-[min(36dvh,15.5rem)]">
            {stack.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-cyan-hud/40 bg-[#0a1628]/60 px-4 text-center font-pixel text-xs text-void-200">
                {emptyMessage}
              </div>
            ) : (
              <AnimatePresence>
                {stack.map(({ card, selected }, i) => (
                  <SwipeCard
                    key={card.id}
                    card={card}
                    active={i === 0}
                    selected={selected}
                    stackIndex={i}
                    exitDir={i === 0 ? exitDir : null}
                    onDragDecision={handleDragDecision}
                    dragX={dragX}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="relative z-50 mt-6 flex shrink-0 items-center justify-center gap-8 sm:mt-8">
            <button
              type="button"
              aria-label="Descartar card"
              disabled={!top || !!exitDir}
              onClick={trySkip}
              className="flex size-12 items-center justify-center rounded-full border-2 border-[#e11d48] bg-[#fff1f2] text-[#e11d48] shadow-md transition hover:bg-[#ffe4e6] disabled:opacity-40"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="size-6 sm:size-7" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              aria-label="Aceitar card"
              disabled={!top || !!exitDir}
              onClick={tryAccept}
              className="flex size-12 items-center justify-center rounded-full border-2 border-[#1f8a52] bg-[#ecfdf5] text-[#1f8a52] shadow-md transition hover:bg-[#d1fae5] disabled:opacity-40"
              style={{ touchAction: 'manipulation' }}
            >
              <Check className="size-6 sm:size-7" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Selected queue on the empty right side */}
        <div
          className="flex h-[min(34dvh,14.5rem)] w-12 shrink-0 flex-col items-center justify-start gap-2 overflow-y-auto sm:h-[min(36dvh,15.5rem)] sm:w-14"
          aria-label="Cards selecionados"
        >
          {selectedCards.map((card, i) => (
            <div
              key={card.id}
              className="relative flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#f7f4ee] shadow-md sm:size-12"
              style={{
                border: '2px solid #1f8a52',
                zIndex: selectedCards.length - i,
              }}
              title={card.title}
            >
              <span className="absolute -top-1 -left-1 z-10 flex size-4 items-center justify-center rounded-full bg-[#1f8a52]">
                <Check className="size-2.5 text-[#e8ffe8]" strokeWidth={3} />
              </span>
              {card.iconSrc ? (
                <img src={card.iconSrc} alt="" className="size-7 object-contain" draggable={false} />
              ) : (
                <span className="scale-75">{card.iconNode}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Bottom-left stage cost badge. */
export function StageCostBadge({
  energySpent,
  waterSpentL,
  label = 'Custo da etapa',
}: {
  energySpent: number
  waterSpentL: number
  label?: string
}) {
  return (
    <div className="pointer-events-none absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 z-40 sm:left-4">
      <div className="pointer-events-auto min-w-[9.5rem] rounded-md border-2 border-energy bg-[#0a1628]/95 px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.45)]">
        <p className="font-pixel text-[9px] tracking-wide text-energy uppercase sm:text-[10px]">{label}</p>
        <p className="mt-1 font-pixel text-sm tabular-nums text-[#f4fff4]">
          −{Math.round(energySpent)}% <span className="text-void-300">energia</span>
        </p>
        <p className="font-pixel text-sm tabular-nums text-[#f4fff4]">
          −{waterSpentL.toFixed(1)}L <span className="text-void-300">água</span>
        </p>
      </div>
    </div>
  )
}
