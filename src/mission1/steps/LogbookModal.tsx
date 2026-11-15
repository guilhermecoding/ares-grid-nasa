import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { ScrollHintArea } from '../../components/ScrollHintArea'
import { MISSION1_META } from '../../data/mission1Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  siteLabel: string
  tilt: number
  stormChoice: 'save' | 'max' | null
  onDone: () => void
}

interface ChecklistItem {
  id: string
  label: string
  detail?: string
}

function GreenCheck({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      className="relative flex size-8 shrink-0 items-center justify-center rounded-sm border-2 border-[#1a5c3a] bg-[#1f8a52] sm:size-9"
      initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18, delay }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5 text-[#e8ffe8] sm:size-6"
        fill="none"
        aria-hidden
      >
        <motion.path
          d="M5 12.5 L10 17.5 L19 6.5"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="square"
          strokeLinejoin="miter"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: delay + 0.12, ease: 'easeOut' }}
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

export function LogbookModal({ siteLabel, tilt, stormChoice, onDone }: Props) {
  const [revealed, setRevealed] = useState(0)
  const [photo, setPhoto] = useState(false)
  const [allDone, setAllDone] = useState(false)

  const items = useMemo<ChecklistItem[]>(
    () => [
      {
        id: 'site',
        label: 'Local de instalação escolhido',
        detail: siteLabel,
      },
      {
        id: 'tilt',
        label: 'Painéis solares ajustados',
        detail: `Inclinação ${tilt}°`,
      },
      {
        id: 'storm',
        label: 'Tempestade de poeira enfrentada',
        detail: stormChoice === 'save' ? 'Economizou energia' : 'Manteve potência máxima',
      },
      {
        id: 'power',
        label: 'Energia externa ativada',
        detail: 'Base pronta para explorar',
      },
      {
        id: 'record',
        label: 'Registro científico no diário',
        detail: 'Evento da Missão 1 documentado',
      },
    ],
    [siteLabel, tilt, stormChoice],
  )

  useEffect(() => {
    if (revealed >= items.length) {
      const id = window.setTimeout(() => setAllDone(true), 280)
      return () => clearTimeout(id)
    }
    const id = window.setTimeout(() => {
      setRevealed((n) => n + 1)
      soundEngine.success()
    }, revealed === 0 ? 450 : 520)
    return () => clearTimeout(id)
  }, [revealed, items.length])

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-void-950/70 p-3">
      <ScrollHintArea
        variant="light"
        frameClassName="w-full max-w-lg border-4 border-[#1a1c3a] bg-[#f4fff4] text-[#1a1c3a] shadow-[0_0_0_3px_#30346d]"
        className="max-h-[min(92dvh,42rem)] p-4"
      >
        <p className="font-pixel text-sm tracking-wide uppercase">Diário de Bordo — Missão 1</p>
        <p className="mt-1 font-body text-sm text-[#1a1c3a]/80">Checklist da missão cumprida</p>

        <ul className="mt-4 space-y-2.5" aria-label="Objetivos cumpridos">
          {items.map((item, index) => {
            const checked = index < revealed
            return (
              <motion.li
                key={item.id}
                layout
                className={`flex items-start gap-3 rounded-md border-2 px-2.5 py-2.5 sm:px-3 ${
                  checked
                    ? 'border-[#1f8a52]/55 bg-[#e5f8ec]'
                    : 'border-[#30346d]/25 bg-[#f4fff4]'
                }`}
                initial={false}
                animate={{
                  backgroundColor: checked ? '#e5f8ec' : '#f4fff4',
                  borderColor: checked ? 'rgba(31,138,82,0.55)' : 'rgba(48,52,109,0.25)',
                }}
                transition={{ duration: 0.25 }}
              >
                {checked ? <GreenCheck delay={0} /> : <EmptyBox />}
                <div className="min-w-0 flex-1 pt-0.5">
                  <p
                    className={`font-pixel text-xs leading-snug sm:text-sm ${
                      checked ? 'text-[#145c35]' : 'text-[#30346d]/70'
                    }`}
                  >
                    {item.label}
                  </p>
                  {item.detail ? (
                    <p className="mt-0.5 font-body text-xs text-[#1a1c3a]/70 sm:text-sm">{item.detail}</p>
                  ) : null}
                </div>
              </motion.li>
            )
          })}
        </ul>

        <AnimatePresence>
          {allDone && (
            <motion.div
              className="mt-4 space-y-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <p className="font-pixel text-xs text-[#30346d] sm:text-sm">Foto científica</p>
              <div className="relative overflow-hidden border-2 border-[#30346d] bg-gradient-to-b from-[#c47848] to-[#8a3d22] p-4">
                <div className="mx-auto h-16 w-28 border-2 border-cyan-hud bg-[#1a3a6e]" />
                {photo && (
                  <motion.p
                    className="mt-2 font-mono text-[10px] text-[#f4fff4]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    NASA · {MISSION1_META.lat} {MISSION1_META.lon} · Sol {new Date().toISOString().slice(0, 10)}
                  </motion.p>
                )}
              </div>
              {!photo ? (
                <McButton
                  className="min-h-12 w-full font-pixel font-bold"
                  onClick={() => {
                    setPhoto(true)
                    soundEngine.success()
                  }}
                >
                  Capturar Foto Científica
                </McButton>
              ) : (
                <McButton className="min-h-12 w-full font-pixel font-bold" onClick={onDone}>
                  Enviar ao diário
                </McButton>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollHintArea>
    </div>
  )
}
