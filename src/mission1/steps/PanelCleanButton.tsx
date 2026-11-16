import { Brush } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PANEL_CLEAN_COOLDOWN_MS, PANEL_CLEAN_EMERGENCY_MAX } from '../../data/mission1Data'
import { loadProgress } from '../../services/progressStore'

interface Props {
  firstInstalledAt: number
  lastCleanedAt: number | null
  onClean: () => void
  className?: string
}

const RING = 2 * Math.PI * 22 // r=22 in viewBox 0 0 52 52

function cooldownAnchor(firstInstalledAt: number, lastCleanedAt: number | null): number {
  return lastCleanedAt ?? firstInstalledAt
}

function unlockProgress(anchor: number, now: number): number {
  return Math.min(1, Math.max(0, (now - anchor) / PANEL_CLEAN_COOLDOWN_MS))
}

/** Round broom button with red progress ring until clean unlocks. */
export function PanelCleanButton({ firstInstalledAt, lastCleanedAt, onClean, className = '' }: Props) {
  const [now, setNow] = useState(() => Date.now())
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [])

  const anchor = cooldownAnchor(firstInstalledAt, lastCleanedAt)
  const progress = unlockProgress(anchor, now)
  const emergency = loadProgress().baseStats.energy <= PANEL_CLEAN_EMERGENCY_MAX
  const unlocked = emergency || progress >= 1
  const label = unlocked
    ? 'Limpar painel'
    : 'O painel não está muito sujo ainda. Volte mais tarde.'

  const dashOffset = RING * (1 - progress)

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(id)
  }, [toast])

  return (
    <div className={className}>
      <div className="relative">
        <button
          type="button"
          title={label}
          aria-label={label}
          aria-disabled={!unlocked}
          className={`relative flex size-14 items-center justify-center rounded-full border-2 bg-[#0a1628]/95 shadow-[0_4px_14px_rgba(0,0,0,0.4)] transition ${
            unlocked
              ? 'border-danger text-danger hover:bg-danger/15'
              : 'border-danger/50 text-danger/55'
          }`}
          style={{ touchAction: 'manipulation' }}
          onClick={() => {
            if (!unlocked) {
              setToast(label)
              return
            }
            onClean()
          }}
        >
          <svg className="pointer-events-none absolute inset-0 size-full -rotate-90" viewBox="0 0 52 52" aria-hidden>
            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,107,138,0.2)" strokeWidth="3" />
            <circle
              cx="26"
              cy="26"
              r="22"
              fill="none"
              stroke="var(--color-danger, #ff6b8a)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={RING}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <Brush className="relative size-6" strokeWidth={2.25} />
        </button>

        {toast ? (
          <div className="absolute bottom-[calc(100%+0.5rem)] left-1/2 z-30 w-max max-w-[14rem] -translate-x-1/2 rounded border border-danger/50 bg-[#0a1628] px-2 py-1.5 font-pixel text-[9px] leading-snug text-[#ffd0d8] shadow-lg sm:text-[10px]">
            {toast}
          </div>
        ) : null}
      </div>
    </div>
  )
}
