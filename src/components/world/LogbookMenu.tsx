import { Check, Lock, NotebookPen, X } from 'lucide-react'
import { completedMissions, logbookCaption, MISSION_BADGES, TOTAL_MISSIONS, type MissionBadge } from '../../data/missionBadges'
import type { LogbookEntries, LogbookEntry } from '../../services/progressStore'
import { soundEngine } from '../../services/soundEngine'
import { LogbookPhoto } from '../logbook/LogbookPhoto'
import { ScrollHintArea } from '../ScrollHintArea'
import { useEscapeKey } from './useEscapeKey'

interface Props {
  level: number
  entries: LogbookEntries
  onClose: () => void
}

const DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

function LogbookPage({ badge, entry, done }: { badge: MissionBadge; entry?: LogbookEntry; done: boolean }) {
  const Icon = badge.icon
  return (
    <li className="border-2 border-[#30346d]/40 bg-white/60 p-3">
      <div className="flex items-center gap-2">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-[#1a1c3a]"
          style={{ backgroundColor: done ? badge.color : '#d5dbd5' }}
          aria-hidden
        >
          {done ? <Icon className="size-5 text-[#1a1c3a]" strokeWidth={2.4} /> : <Lock className="size-4 text-[#30346d]/70" />}
        </span>
        <div className="min-w-0">
          <p className="font-pixel text-xs leading-snug uppercase sm:text-sm">
            Missão {badge.id} · {badge.title}
          </p>
          <p className="font-body text-xs text-[#1a1c3a]/70 sm:text-sm">
            {entry ? `Registrada em ${DATE_FORMAT.format(entry.capturedAt)}` : done ? 'Missão concluída' : badge.mission}
          </p>
        </div>
      </div>

      {done ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-[13rem_1fr]">
          <LogbookPhoto badge={badge} caption={entry?.caption ?? logbookCaption(badge.id)} captured className="self-start" />
          {entry && entry.notes.length > 0 ? (
            <ul className="grid content-start gap-1.5" aria-label={`Anotações da Missão ${badge.id}`}>
              {entry.notes.map((note) => (
                <li key={note.label} className="flex items-start gap-2">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center bg-[#1f8a52]" aria-hidden>
                    <Check className="size-3.5 text-white" strokeWidth={3.5} />
                  </span>
                  <span className="min-w-0 font-body text-sm leading-snug">
                    <strong className="text-[#145c35]">{note.label}</strong>
                    {note.detail ? <span className="block text-[#1a1c3a]/75">{note.detail}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="self-center font-body text-sm text-[#1a1c3a]/75">
              Jogue esta missão de novo para anotar os detalhes da visita nesta página.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-3 border-2 border-dashed border-[#30346d]/35 px-3 py-4">
          <Lock className="size-5 shrink-0 text-[#30346d]/60" aria-hidden />
          <p className="font-body text-sm text-[#1a1c3a]/75">
            Conclua a Missão {badge.id} para tirar a foto científica desta página.
          </p>
        </div>
      )}
    </li>
  )
}

/** Missions-screen menu with every photo and note the player saved. */
export function LogbookMenu({ level, entries, onClose }: Props) {
  useEscapeKey(onClose)
  const pages = completedMissions(level)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void-950/75 p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logbook-menu-title"
    >
      <ScrollHintArea
        variant="light"
        frameClassName="w-full max-w-2xl border-4 border-[#1a1c3a] bg-[#f4fff4] text-[#1a1c3a] shadow-[0_0_0_3px_#30346d]"
        className="max-h-[min(92dvh,46rem)] p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="logbook-menu-title" className="flex items-center gap-2 font-pixel text-sm tracking-wide uppercase sm:text-base">
              <NotebookPen className="size-5 shrink-0" aria-hidden />
              Diário de Bordo
            </h2>
            <p className="mt-1 font-body text-sm text-[#1a1c3a]/80">
              {pages} de {TOTAL_MISSIONS} páginas registradas em Arcadia Planitia
            </p>
          </div>
          <button
            type="button"
            autoFocus
            aria-label="Fechar o diário"
            className="flex size-11 shrink-0 items-center justify-center border-2 border-[#1a1c3a] bg-[#30346d] text-[#f4fff4]"
            style={{ touchAction: 'manipulation' }}
            onClick={() => {
              soundEngine.click()
              onClose()
            }}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <ul className="mt-4 grid gap-3">
          {MISSION_BADGES.map((badge) => (
            <LogbookPage key={badge.id} badge={badge} entry={entries[badge.key]} done={level > badge.id} />
          ))}
        </ul>
      </ScrollHintArea>
    </div>
  )
}
