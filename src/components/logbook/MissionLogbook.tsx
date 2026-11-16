import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { logbookCaption, missionBadge } from '../../data/missionBadges'
import { localizedNote, useI18n } from '../../i18n/locale'
import { McButton } from '../../opening/McButton'
import { saveLogbookEntry, type LogbookNote } from '../../services/progressStore'
import { soundEngine } from '../../services/soundEngine'
import { ScrollHintArea } from '../ScrollHintArea'
import { LogbookPhoto } from './LogbookPhoto'

interface Props {
  missionId: number
  /** One line under the title, e.g. "Checklist da missão cumprida". */
  subtitle: string
  /** What the player did in this mission, ticked one by one. */
  items: readonly LogbookNote[]
  onDone: () => void
}

function GreenCheck() {
  return (
    <motion.span
      className="relative flex size-8 shrink-0 items-center justify-center rounded-sm border-2 border-[#1a5c3a] bg-[#1f8a52] sm:size-9"
      initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5 text-[#e8ffe8] sm:size-6" fill="none" aria-hidden>
        <motion.path
          d="M5 12.5 L10 17.5 L19 6.5"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="square"
          strokeLinejoin="miter"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.12, ease: 'easeOut' }}
        />
      </svg>
    </motion.span>
  )
}

function EmptyBox() {
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-sm border-2 border-[#30346d]/45 bg-[#f4fff4] sm:size-9"
      aria-hidden
    />
  )
}

/**
 * Mission logbook shared by the five missions: animated checklist, then the
 * science photo. Taking the photo saves the page to the player's logbook.
 */
export function MissionLogbook({ missionId, subtitle, items, onDone }: Props) {
  const { locale, t } = useI18n()
  const badge = missionBadge(missionId)
  const caption = logbookCaption(missionId)
  const [revealed, setRevealed] = useState(0)
  const [photo, setPhoto] = useState(false)
  const [allDone, setAllDone] = useState(false)
  const total = items.length
  const photoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (revealed >= total) {
      const id = window.setTimeout(() => setAllDone(true), 280)
      return () => clearTimeout(id)
    }
    const id = window.setTimeout(
      () => {
        setRevealed((n) => n + 1)
        soundEngine.success()
      },
      revealed === 0 ? 450 : 520,
    )
    return () => clearTimeout(id)
  }, [revealed, total])

  // The photo and its button open below the checklist: bring them into view.
  useEffect(() => {
    if (allDone) photoRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [allDone, photo])

  const capture = () => {
    saveLogbookEntry(badge.key, {
      capturedAt: Date.now(),
      caption,
      notes: items.map((item) => {
        const note: LogbookNote = { label: item.labelPt ?? item.label }
        if (item.detail || item.detailPt) note.detail = item.detailPt ?? item.detail
        if (item.labelEn) note.labelEn = item.labelEn
        if (item.labelPt) note.labelPt = item.labelPt
        if (item.detailEn) note.detailEn = item.detailEn
        if (item.detailPt) note.detailPt = item.detailPt
        return note
      }),
    })
    setPhoto(true)
    soundEngine.success()
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-void-950/70 p-3">
      <ScrollHintArea
        variant="light"
        frameClassName="w-full max-w-lg border-4 border-[#1a1c3a] bg-[#f4fff4] text-[#1a1c3a] shadow-[0_0_0_3px_#30346d]"
        className="max-h-[min(92dvh,42rem)] p-4"
      >
        <p className="font-pixel text-sm tracking-wide uppercase">
          {t(`Logbook — Mission ${missionId}`, `Diário de Bordo — Missão ${missionId}`)}
        </p>
        <p className="mt-1 font-body text-sm text-[#1a1c3a]/80">{subtitle}</p>

        <ul className="mt-4 space-y-2.5" aria-label={t('Finished goals', 'Objetivos cumpridos')}>
          {items.map((item, index) => {
            const shown = localizedNote(item, locale)
            const checked = index < revealed
            return (
              <motion.li
                key={item.labelPt ?? item.label}
                layout
                className={`flex items-start gap-3 rounded-md border-2 px-2.5 py-2.5 sm:px-3 ${
                  checked ? 'border-[#1f8a52]/55 bg-[#e5f8ec]' : 'border-[#30346d]/25 bg-[#f4fff4]'
                }`}
                initial={false}
                animate={{
                  backgroundColor: checked ? '#e5f8ec' : '#f4fff4',
                  borderColor: checked ? 'rgba(31,138,82,0.55)' : 'rgba(48,52,109,0.25)',
                }}
                transition={{ duration: 0.25 }}
              >
                {checked ? <GreenCheck /> : <EmptyBox />}
                <div className="min-w-0 flex-1 pt-0.5">
                  <p
                    className={`font-pixel text-xs leading-snug sm:text-sm ${
                      checked ? 'text-[#145c35]' : 'text-[#30346d]/70'
                    }`}
                  >
                    {shown.label}
                  </p>
                  {shown.detail ? (
                    <p className="mt-0.5 font-body text-xs text-[#1a1c3a]/70 sm:text-sm">{shown.detail}</p>
                  ) : null}
                </div>
              </motion.li>
            )
          })}
        </ul>

        <AnimatePresence>
          {allDone ? (
            <motion.div
              ref={photoRef}
              className="mt-4 space-y-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <p className="font-pixel text-xs text-[#30346d] sm:text-sm">{t('Science photo', 'Foto científica')}</p>
              <LogbookPhoto badge={badge} caption={caption} captured={photo} className="mx-auto max-w-xs" />
              {photo ? (
                <>
                  <p className="text-center font-body text-sm font-bold text-[#145c35]" role="status">
                    {t('Photo saved in your logbook!', 'Foto salva no seu Diário de Bordo!')}
                  </p>
                  <McButton className="min-h-12 w-full px-3 py-2 font-pixel font-bold" onClick={onDone}>
                    {t('Send to the logbook', 'Enviar ao diário')}
                  </McButton>
                </>
              ) : (
                <McButton className="min-h-12 w-full px-3 py-2 font-pixel font-bold" onClick={capture}>
                  {t('Take science photo', 'Capturar Foto Científica')}
                </McButton>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </ScrollHintArea>
    </div>
  )
}
