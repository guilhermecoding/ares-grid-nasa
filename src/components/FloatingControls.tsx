import type { CSSProperties, ReactNode } from 'react'
import { FullscreenButton } from './FullscreenButton'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  BedDouble,
  BookOpen,
  Hand,
  Home,
  NotebookPen,
  Volume2,
  VolumeX,
} from 'lucide-react'

interface Props {
  canSleep: boolean
  muted: boolean
  showLabels: boolean
  onLabelsDone: () => void
  onMove: (dx: number, dy: number) => void
  onInteract: () => void
  onSleep: () => void
  onToggleMute: () => void
  onNasa: () => void
  onHome: () => void
  /** Mission-map hub: hide walk / interact / sleep pads */
  mapMode?: boolean
  /** Mission-map hub: open the saved logbook pages. */
  onLogbook?: () => void
  /** Mission-map hub: open the player certificate. */
  onCertificate?: () => void
  /** All missions done: the certificate button turns gold. */
  certificateEarned?: boolean
}

/** Gold look of the certificate button once the expedition is complete. */
const CERTIFICATE_EARNED_STYLE: CSSProperties = {
  color: 'var(--color-energy)',
  boxShadow: '0 0 0 2px rgba(240, 180, 41, 0.85), 0 0 16px rgba(240, 180, 41, 0.55)',
}

function HintLabel({
  show,
  children,
  onDone,
}: {
  show: boolean
  children: ReactNode
  onDone?: () => void
}) {
  if (!show) return null
  return (
    <span
      className="hint-label-collapse overflow-hidden whitespace-nowrap font-pixel text-sm font-bold"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) onDone?.()
      }}
    >
      {children}
    </span>
  )
}

export function FloatingControls({
  canSleep,
  muted,
  showLabels,
  onLabelsDone,
  onMove,
  onInteract,
  onSleep,
  onToggleMute,
  onNasa,
  onHome,
  mapMode = false,
  onLogbook,
  onCertificate,
  certificateEarned = false,
}: Props) {
  const btn =
    'flex items-center justify-center gap-1.5 rounded-full bg-void-900/75 text-void-100 shadow-[0_4px_14px_rgba(0,0,0,0.45)] ring-1 ring-nebula/40 backdrop-blur-sm transition hover:bg-void-800/90 active:scale-95'
  const pad = 'size-12'
  const action = 'min-h-12 px-3'

  const utilityCluster = mapMode
    ? 'pointer-events-none absolute right-2 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex gap-1.5 sm:right-3'
    : 'pointer-events-none absolute left-2 top-2 z-30 flex gap-1.5 sm:left-3 sm:top-3'

  return (
    <>
      <div className={utilityCluster}>
        <button
          type="button"
          onClick={onNasa}
          aria-label="Ciência NASA"
          className={`pointer-events-auto ${btn} ${pad}`}
          title="Ciência NASA"
        >
          <BookOpen className="size-5" />
          <HintLabel show={showLabels} onDone={mapMode ? onLabelsDone : undefined}>
            NASA
          </HintLabel>
        </button>
        {mapMode ? <FullscreenButton className={`pointer-events-auto ${btn} ${pad}`} /> : null}
        <button
          type="button"
          onClick={onHome}
          aria-label="Menu"
          className={`pointer-events-auto ${btn} ${pad}`}
          title="Menu"
        >
          <Home className="size-5" />
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Ativar som' : 'Silenciar'}
          className={`pointer-events-auto ${btn} ${pad}`}
        >
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </button>
      </div>

      {mapMode && (onLogbook || onCertificate) ? (
        <div className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-2 z-30 flex gap-1.5 sm:left-3">
          {onLogbook ? (
            <button
              type="button"
              onClick={onLogbook}
              aria-label="Diário de bordo"
              title="Diário de bordo"
              className={`pointer-events-auto ${btn} ${action}`}
            >
              <NotebookPen className="size-5 shrink-0" />
              <span className="hidden font-pixel text-xs sm:inline">Diário</span>
            </button>
          ) : null}
          {onCertificate ? (
            <button
              type="button"
              onClick={onCertificate}
              aria-label="Certificado"
              title="Certificado"
              className={`pointer-events-auto ${btn} ${action}`}
              style={certificateEarned ? CERTIFICATE_EARNED_STYLE : undefined}
            >
              <Award className="size-5 shrink-0" />
              <span className="hidden font-pixel text-xs sm:inline">Certificado</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {!mapMode && (
        <>
          <div className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-2 z-20 flex flex-col gap-2 sm:left-3">
            <button
              type="button"
              onClick={onInteract}
              className={`pointer-events-auto ${btn} ${action}`}
              aria-label="Interagir"
            >
              <Hand className="size-5 shrink-0" />
              <HintLabel show={showLabels} onDone={onLabelsDone}>
                Interagir
              </HintLabel>
            </button>
            <button
              type="button"
              onClick={onSleep}
              disabled={!canSleep}
              className={`pointer-events-auto ${btn} ${action} disabled:opacity-40`}
              aria-label="Dormir"
            >
              <BedDouble className="size-5 shrink-0" />
              <HintLabel show={showLabels}>Dormir</HintLabel>
            </button>
          </div>

          <div className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-2 z-20 sm:right-3">
            <div className="pointer-events-auto grid grid-cols-3 gap-1.5">
              <span />
              <button type="button" className={`${btn} ${pad}`} onClick={() => onMove(0, -1)} aria-label="Norte">
                <ArrowUp className="size-5" />
              </button>
              <span />
              <button type="button" className={`${btn} ${pad}`} onClick={() => onMove(-1, 0)} aria-label="Oeste">
                <ArrowLeft className="size-5" />
              </button>
              <button type="button" className={`${btn} ${pad}`} onClick={() => onMove(0, 1)} aria-label="Sul">
                <ArrowDown className="size-5" />
              </button>
              <button type="button" className={`${btn} ${pad}`} onClick={() => onMove(1, 0)} aria-label="Leste">
                <ArrowRight className="size-5" />
              </button>
            </div>
            {showLabels && (
              <p className="hint-label-collapse mt-1 text-center text-[10px] font-bold text-void-100/80">Mover</p>
            )}
          </div>
        </>
      )}
    </>
  )
}
