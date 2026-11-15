import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { ScrollHintArea } from '../ScrollHintArea'
import { MEDIA } from '../../constants/mediaAssets'
import {
  CULTIVATION_METHODS,
  LOGBOOK_EVENTS_M4,
  MISSION4_META,
  NASA_CITATIONS_M4,
  speciesLabel,
  type CultivationMethodId,
  type SpeciesId,
} from '../../data/mission4Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  method: CultivationMethodId
  species: readonly SpeciesId[]
  onDone: () => void
}

export function Mission4Logbook({ method, species, onDone }: Props) {
  const [eventId, setEventId] = useState<string | null>(null)
  const [wrongEvent, setWrongEvent] = useState<string | null>(null)
  const [chips, setChips] = useState<Set<string>>(() => new Set())
  const [photo, setPhoto] = useState(false)
  const methodLabel = CULTIVATION_METHODS.find((m) => m.id === method)?.title ?? method
  const aspects = [
    { id: 'method', label: `Método: ${methodLabel}` },
    { id: 'species', label: `Espécies: ${species.map(speciesLabel).join(', ')}` },
  ]
  const ready = eventId === 'right' && chips.size === aspects.length && photo

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-void-950/70 p-3">
      <ScrollHintArea
        variant="light"
        frameClassName="w-full max-w-xl border-4 border-[#1a1c3a] bg-[#f4fff4] text-[#1a1c3a] shadow-[0_0_0_3px_#30346d]"
        className="max-h-[min(92dvh,46rem)] p-4"
      >
        <p className="font-pixel text-sm tracking-wide uppercase">Diário de Bordo — Missão 4</p>
        <p className="mt-1 text-sm">
          {MISSION4_META.solLabel} · {MISSION4_META.location} · {MISSION4_META.title}
        </p>
        <p className="mt-4 font-pixel text-xs text-[#30346d]">1 · Evento de hoje</p>
        <div className="mt-2 grid gap-2">
          {LOGBOOK_EVENTS_M4.map((ev) => {
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
                className={`min-h-12 rounded border-2 px-3 py-2 text-left text-sm ${
                  chosen ? 'border-[#1f8a52] bg-[#e5f8ec]' : wrong ? 'border-[#c0304f] bg-[#ffe9ee]' : 'border-[#30346d]/35 bg-white'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {ev.label}
              </motion.button>
            )
          })}
        </div>
        <p className="mt-4 font-pixel text-xs text-[#30346d]">2 · O que aconteceu</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {aspects.map((chip) => {
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
        <p className="mt-4 font-pixel text-xs text-[#30346d]">3 · Foto da estufa</p>
        <button
          type="button"
          onClick={() => {
            setPhoto(true)
            soundEngine.harvest()
          }}
          className="mt-2 flex min-h-16 items-center gap-3 border-2 border-[#30346d]/35 bg-white px-3"
          style={{ touchAction: 'manipulation' }}
        >
          <img src={MEDIA.mission3.camera} alt="" className="h-10 w-10" />
          <span>{photo ? 'Foto carimbada' : 'Capturar Foto Científica'}</span>
        </button>
        <p className="mt-3 text-xs text-[#1a1c3a]/70">{NASA_CITATIONS_M4.veggie}</p>
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
