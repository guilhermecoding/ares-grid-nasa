import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { ScrollHintArea } from '../ScrollHintArea'
import { MEDIA } from '../../constants/mediaAssets'
import { LOGBOOK_EVENTS_M3, MISSION3_META, NASA_CITATIONS } from '../../data/mission3Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  siteName: string
  depthLabel: string
  onDone: () => void
}

/** Diário de Bordo — event, situation chips, stamped photo. */
export function Mission3Logbook({ siteName, depthLabel, onDone }: Props) {
  const [eventId, setEventId] = useState<string | null>(null)
  const [wrongEvent, setWrongEvent] = useState<string | null>(null)
  const [chips, setChips] = useState<Set<string>>(() => new Set())
  const [photo, setPhoto] = useState(false)

  const aspects = [
    { id: 'terrain', label: `Terreno: ${siteName}, plano e estável` },
    { id: 'depth', label: `Profundidade da amostra: ${depthLabel}` },
    { id: 'water', label: 'Potabilidade: aprovada após novo tratamento' },
  ]
  const eventOk = eventId === 'right'
  const chipsOk = chips.size === aspects.length
  const ready = eventOk && chipsOk && photo

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-void-950/70 p-3">
      <ScrollHintArea
        variant="light"
        frameClassName="w-full max-w-xl border-4 border-[#1a1c3a] bg-[#f4fff4] text-[#1a1c3a] shadow-[0_0_0_3px_#30346d]"
        className="max-h-[min(92dvh,46rem)] p-4"
      >
        <p className="font-pixel text-sm tracking-wide uppercase">Diário de Bordo — Missão 3</p>
        <p className="mt-1 text-sm text-[#1a1c3a]/80">
          {MISSION3_META.solLabel} · {MISSION3_META.location} · O Mistério do Gelo de Marte
        </p>

        <p className="mt-4 font-pixel text-xs text-[#30346d]">1 · Evento de hoje</p>
        <div className="mt-2 grid gap-2">
          {LOGBOOK_EVENTS_M3.map((ev) => {
            const chosen = eventId === ev.id
            const wrong = wrongEvent === ev.id
            return (
              <motion.button
                key={ev.id}
                type="button"
                disabled={eventOk}
                animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.3 }}
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
                  chosen
                    ? 'border-[#1f8a52] bg-[#e5f8ec] font-semibold text-[#145c35]'
                    : wrong
                      ? 'border-[#c0304f] bg-[#ffe9ee] text-[#7a1c30]'
                      : 'border-[#30346d]/35 bg-white'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {chosen ? '✓ ' : ''}
                {ev.label}
              </motion.button>
            )
          })}
        </div>
        {wrongEvent && !eventOk ? (
          <p className="mt-1 text-xs text-[#7a1c30]">Esse não foi o trabalho de hoje. Tente de novo!</p>
        ) : null}

        <p className="mt-4 font-pixel text-xs text-[#30346d]">2 · Aspectos da situação</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {aspects.map((a) => {
            const on = chips.has(a.id)
            return (
              <button
                key={a.id}
                type="button"
                disabled={!eventOk}
                aria-pressed={on}
                onClick={() => {
                  soundEngine.click()
                  setChips((prev) => {
                    const next = new Set(prev)
                    if (next.has(a.id)) next.delete(a.id)
                    else next.add(a.id)
                    return next
                  })
                }}
                className={`min-h-12 rounded-full border-2 px-3 py-2 text-sm ${
                  on ? 'border-[#1f8a52] bg-[#1f8a52] text-white' : 'border-[#30346d]/40 bg-white'
                } ${eventOk ? '' : 'opacity-50'}`}
                style={{ touchAction: 'manipulation' }}
              >
                {on ? '✓ ' : '+ '}
                {a.label}
              </button>
            )
          })}
        </div>

        <p className="mt-4 font-pixel text-xs text-[#30346d]">3 · Fotografia científica</p>
        <div className="relative mt-2 overflow-hidden border-2 border-[#30346d] bg-gradient-to-b from-[#0b2a3a] to-[#050b14] p-3">
          <div className="flex items-center justify-center gap-4">
            <img src={MEDIA.mission3.sample} alt="" className="size-20 object-contain" draggable={false} />
            <img src={MEDIA.mission3.lab} alt="" className="size-20 object-contain" draggable={false} />
          </div>
          <AnimatePresence>
            {photo ? (
              <>
                <motion.div
                  key="flash"
                  className="pointer-events-none absolute inset-0 bg-white"
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  aria-hidden
                />
                <motion.div
                  key="stamp"
                  className="absolute top-2 right-2 rotate-[-12deg] border-4 border-[#c0304f] px-2 py-0.5 font-pixel text-xs text-[#ff8aa0]"
                  initial={{ scale: 2.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.2 }}
                >
                  NASA
                </motion.div>
                <motion.p
                  key="caption"
                  className="mt-2 text-center font-mono text-[10px] text-[#f4fff4]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {MISSION3_META.location} · {MISSION3_META.lat} · {MISSION3_META.lon} · ice core {depthLabel}
                </motion.p>
              </>
            ) : null}
          </AnimatePresence>
        </div>
        {!photo ? (
          <McButton
            className={`mt-2 min-h-12 w-full font-pixel ${eventOk && chipsOk ? '' : 'opacity-50'}`}
            disabled={!eventOk || !chipsOk}
            onClick={() => setPhoto(true)}
          >
            📷 Capturar Foto Científica
          </McButton>
        ) : null}

        <p className="mt-4 font-pixel text-xs text-[#30346d]">Fontes NASA</p>
        <p className="mt-1 text-xs leading-snug text-[#1a1c3a]/75">{NASA_CITATIONS.iceCores}</p>
        <p className="mt-1 text-xs leading-snug text-[#1a1c3a]/75">{NASA_CITATIONS.sharad}</p>

        <McButton
          className={`mt-4 min-h-12 w-full font-pixel ${ready ? 'mc-btn-green' : 'opacity-50'}`}
          disabled={!ready}
          onClick={onDone}
        >
          Salvar e voltar à nave
        </McButton>
      </ScrollHintArea>
    </div>
  )
}
