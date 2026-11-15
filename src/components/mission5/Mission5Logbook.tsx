import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import { LOGBOOK_EVENTS_M5, MISSION5_META, NASA_CITATIONS_M5 } from '../../data/mission5Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'
import { ScrollHintArea } from '../ScrollHintArea'

interface Props {
  onDone: () => void
}

const CHIPS = [
  { id: 'alert', label: 'Alerta: tempestade regional de poeira' },
  { id: 'shield', label: 'Blindagem: abrigo com água e regolito' },
]

export function Mission5Logbook({ onDone }: Props) {
  const [eventId, setEventId] = useState<string | null>(null)
  const [wrongEvent, setWrongEvent] = useState<string | null>(null)
  const [chips, setChips] = useState<Set<string>>(() => new Set())
  const [photo, setPhoto] = useState(false)
  const ready = eventId === 'right' && chips.size === CHIPS.length && photo

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-void-950/70 p-3">
      <ScrollHintArea
        variant="light"
        frameClassName="w-full max-w-xl border-4 border-[#1a1c3a] bg-[#f4fff4] text-[#1a1c3a] shadow-[0_0_0_3px_#30346d]"
        className="max-h-[min(92dvh,46rem)] p-4"
      >
        <p className="font-pixel text-sm uppercase">Diário de Bordo — Missão 5</p>
        <p className="mt-1 text-sm">
          {MISSION5_META.solLabel} · {MISSION5_META.title}
        </p>
        <div className="mt-3 grid gap-2">
          {LOGBOOK_EVENTS_M5.map((ev) => {
            const chosen = eventId === ev.id
            const wrong = wrongEvent === ev.id
            return (
              <motion.button
                key={ev.id}
                type="button"
                disabled={eventId === 'right'}
                animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                onClick={() => {
                  if (ev.correct) {
                    setEventId(ev.id)
                    setWrongEvent(null)
                    soundEngine.success()
                  } else {
                    setWrongEvent(ev.id)
                    soundEngine.fail()
                  }
                }}
                className={`min-h-12 border-2 px-3 py-2 text-left text-sm ${
                  chosen ? 'border-[#1f8a52] bg-[#e5f8ec]' : wrong ? 'border-[#c0304f] bg-[#ffe9ee]' : 'border-[#30346d]/35 bg-white'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {ev.label}
              </motion.button>
            )
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CHIPS.map((chip) => {
            const on = chips.has(chip.id)
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  setChips((prev) => new Set(prev).add(chip.id))
                  soundEngine.click()
                }}
                className={`min-h-12 border-2 px-3 text-sm ${on ? 'border-[#1f8a52] bg-[#e5f8ec]' : 'border-[#30346d]/35 bg-white'}`}
                style={{ touchAction: 'manipulation' }}
              >
                {on ? '✓ ' : ''}
                {chip.label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="mt-3 flex min-h-16 items-center gap-3 border-2 border-[#30346d]/35 bg-white px-3"
          onClick={() => {
            setPhoto(true)
            soundEngine.harvest()
          }}
        >
          <img src={MEDIA.mission3.camera} alt="" className="h-10 w-10" />
          <span>{photo ? 'Foto carimbada' : 'Capturar Foto Científica'}</span>
        </button>
        <p className="mt-3 text-xs text-[#1a1c3a]/70">{NASA_CITATIONS_M5.dust}</p>
        <AnimatePresence>
          {ready ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <McButton onClick={onDone}>Hora de dormir</McButton>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </ScrollHintArea>
    </div>
  )
}
