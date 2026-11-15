import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
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

interface Props {
  card: ActivityCardModel
  done: boolean
  disabled?: boolean
  busy?: boolean
  onStart?: (id: string) => void
  onActivate: (id: string) => void
}

const PROGRESS_MS = 1400

/** Large touch card with yellow spiral progress overlay when activated. */
export function ActivityCard({ card, done, disabled, busy, onStart, onActivate }: Props) {
  const [playing, setPlaying] = useState(false)
  const onActivateRef = useRef(onActivate)
  const onStartRef = useRef(onStart)
  onActivateRef.current = onActivate
  onStartRef.current = onStart

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => {
      setPlaying(false)
      onActivateRef.current(card.id)
    }, PROGRESS_MS)
    return () => clearTimeout(id)
  }, [playing, card.id])

  const locked = done || disabled || busy || playing

  return (
    <motion.button
      type="button"
      whileTap={locked ? undefined : { scale: 0.97 }}
      disabled={locked}
      onClick={() => {
        if (locked) return
        soundEngine.step()
        onStartRef.current?.(card.id)
        setPlaying(true)
      }}
      className={`relative flex min-h-[9.5rem] flex-col overflow-hidden rounded-lg border-2 p-3 text-left transition sm:min-h-[10.5rem] sm:p-4 ${
        done
          ? 'border-[#1f8a52]/80 bg-[#0a1628]/75 opacity-80'
          : 'border-transparent bg-[#0a1628]/90 shadow-[0_6px_18px_rgba(0,0,0,0.35)]'
      } ${disabled && !done ? 'opacity-45' : ''}`}
      style={{
        touchAction: 'manipulation',
        boxShadow: done ? undefined : `inset 0 0 0 2px ${card.color}99, 0 6px 18px rgba(0,0,0,0.35)`,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-md sm:size-16"
          style={{ background: `${card.color}33`, border: `2px solid ${card.color}` }}
        >
          {card.iconSrc ? (
            <img src={card.iconSrc} alt="" className="size-10 object-contain sm:size-12" draggable={false} />
          ) : (
            card.iconNode
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-pixel text-xs leading-tight text-[#f4fff4] sm:text-sm">{card.title}</span>
          {card.detail ? (
            <span className="mt-1 block font-pixel text-[9px] text-void-300 sm:text-[10px]">{card.detail}</span>
          ) : null}
        </span>
        {done ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1f8a52] font-pixel text-sm text-[#e8ffe8]">
            ✓
          </span>
        ) : null}
      </div>

      <div className="mt-auto space-y-1 pt-3 font-pixel text-[10px] sm:text-xs">
        <p className="font-bold" style={{ color: card.color }}>
          +{card.wellbeingGain} bem-estar
        </p>
        <p className="text-energy">
          −{card.energyCost}% energia
          {card.waterCostL > 0 ? ` · −${card.waterCostL}L` : ''}
        </p>
      </div>

      {playing ? (
        <div className="activity-spiral-overlay absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[6px] border-2 border-[#f0b429] bg-[#f0b429] p-3">
          <div className="activity-spirals" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <p className="relative z-[1] mt-2 font-pixel text-sm font-bold text-[#1a1c3a]">
            +{card.wellbeingGain} bem-estar
          </p>
          <div className="relative z-[1] mt-3 h-2.5 w-[85%] overflow-hidden rounded-full bg-[#1a1c3a]/25">
            <motion.div
              className="h-full rounded-full bg-[#1a1c3a]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: PROGRESS_MS / 1000, ease: 'linear' }}
            />
          </div>
        </div>
      ) : null}
    </motion.button>
  )
}

interface GridProps {
  children: ReactNode
  title: string
  subtitle?: ReactNode
}

export function ActivityCardGrid({ children, title, subtitle }: GridProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-3 sm:px-4">
      <h2 className="font-pixel text-sm text-cyan-hud sm:text-base">{title}</h2>
      {subtitle ? <div className="mt-1 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">{subtitle}</div> : null}
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3">{children}</div>
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
