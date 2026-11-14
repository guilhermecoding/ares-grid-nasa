import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BedDouble, Hand, Volume2, VolumeX } from 'lucide-react'
import type { WorldState } from '../types/game'

interface Props {
  state: WorldState
  muted: boolean
  canSleep: boolean
  /** lateral = landscape tablet rail; bottom = portrait dock */
  variant?: 'bottom' | 'lateral'
  onMove: (dx: number, dy: number) => void
  onInteract: () => void
  onSleep: () => void
  onToggleMute: () => void
  onNasa: () => void
  onHome: () => void
}

export function StardewHud({
  muted,
  canSleep,
  variant = 'bottom',
  onMove,
  onInteract,
  onSleep,
  onToggleMute,
  onNasa,
  onHome,
}: Props) {
  const isLateral = variant === 'lateral'
  const dpadBtn =
    'pixel-btn flex size-11 items-center justify-center rounded-lg bg-void-600 text-void-100 sm:size-12'

  return (
    <footer
      className={`space-panel flex shrink-0 text-void-100 ${
        isLateral
          ? 'h-full max-h-full w-full flex-col gap-2 overflow-y-auto rounded-xl p-2'
          : 'flex-row flex-wrap items-center justify-between gap-2 rounded-xl p-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] sm:p-2'
      }`}
    >
      <div className={`flex gap-1 ${isLateral ? 'justify-center' : ''}`}>
        <button type="button" onClick={onNasa} className="pixel-btn rounded-lg bg-void-600 px-2 py-1 text-[10px] font-bold">
          NASA
        </button>
        <button type="button" onClick={onHome} className="pixel-btn rounded-lg bg-void-600 px-2 py-1 text-[10px] font-bold">
          Menu
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Som' : 'Mudo'}
          className="pixel-btn flex size-9 items-center justify-center rounded-lg bg-void-600"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>

      <div className={`grid grid-cols-3 gap-1 ${isLateral ? 'mx-auto' : ''}`}>
        <span />
        <button type="button" className={dpadBtn} onClick={() => onMove(0, -1)} aria-label="Norte">
          <ArrowUp className="size-5" />
        </button>
        <span />
        <button type="button" className={dpadBtn} onClick={() => onMove(-1, 0)} aria-label="Oeste">
          <ArrowLeft className="size-5" />
        </button>
        <button type="button" className={dpadBtn} onClick={() => onMove(0, 1)} aria-label="Sul">
          <ArrowDown className="size-5" />
        </button>
        <button type="button" className={dpadBtn} onClick={() => onMove(1, 0)} aria-label="Leste">
          <ArrowRight className="size-5" />
        </button>
      </div>

      <div className={`flex gap-1.5 ${isLateral ? 'flex-col' : ''}`}>
        <button
          type="button"
          onClick={onInteract}
          className="pixel-btn inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-life px-3 font-pixel text-sm font-bold text-void-950"
        >
          <Hand className="size-4" /> Interagir
        </button>
        <button
          type="button"
          onClick={onSleep}
          disabled={!canSleep}
          className="pixel-btn inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-shield px-3 font-pixel text-sm font-bold text-void-950 disabled:opacity-40"
        >
          <BedDouble className="size-4" /> Dormir
        </button>
      </div>
    </footer>
  )
}
