import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { ScrollHintArea } from '../ScrollHintArea'
import {
  EXERCISES,
  MISSION2_META,
  type ExerciseId,
  type HygieneId,
  type NutritionCardId,
} from '../../data/mission2Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  exercises: ExerciseId[]
  nutritionCards: NutritionCardId[]
  hygieneDone: HygieneId[]
  sleepScore: number
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
      <svg viewBox="0 0 24 24" className="size-5 text-[#e8ffe8] sm:size-6" fill="none" aria-hidden>
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

/** Animated mission checklist — same pattern as Missão 01 logbook. */
export function Mission2Logbook({
  exercises,
  nutritionCards,
  hygieneDone,
  sleepScore,
  onDone,
}: Props) {
  const [revealed, setRevealed] = useState(0)
  const [photo, setPhoto] = useState(false)
  const [allDone, setAllDone] = useState(false)

  const exerciseDetail = exercises
    .map((id) => EXERCISES.find((e) => e.id === id)?.title)
    .filter(Boolean)
    .join(' · ')

  const items = useMemo<ChecklistItem[]>(
    () => [
      {
        id: 'exercise',
        label: 'Exercícios do dia concluídos',
        detail: exerciseDetail || `${exercises.length} atividades`,
      },
      {
        id: 'nutrition',
        label: 'Alimentação e hidratação',
        detail: nutritionCards.includes('hydrate')
          ? `${nutritionCards.length} cards · hidratação ok`
          : `${nutritionCards.length} cards`,
      },
      {
        id: 'hygiene',
        label: 'Higiene do módulo',
        detail: `${hygieneDone.length} ações registradas`,
      },
      {
        id: 'sleep',
        label: 'Descanso e Sleep Score',
        detail: `Score ${sleepScore}/100`,
      },
      {
        id: 'record',
        label: 'Registro científico no diário',
        detail: 'Rotina de saúde documentada',
      },
    ],
    [exerciseDetail, exercises.length, hygieneDone.length, nutritionCards, sleepScore],
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
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-void-950/70 p-3">
      <ScrollHintArea
        variant="light"
        frameClassName="w-full max-w-lg border-4 border-[#1a1c3a] bg-[#f4fff4] text-[#1a1c3a] shadow-[0_0_0_3px_#30346d]"
        className="max-h-[min(92dvh,42rem)] p-4"
      >
        <p className="font-pixel text-sm tracking-wide uppercase">Diário de Bordo — Missão 2</p>
        <p className="mt-1 font-body text-sm text-[#1a1c3a]/80">Checklist da rotina cumprida</p>

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
              <div className="relative overflow-hidden border-2 border-[#30346d] bg-gradient-to-b from-[#2a1a4a] to-[#0a1628] p-4">
                <div className="mx-auto flex h-16 w-28 items-center justify-center border-2 border-cyan-hud bg-[#1a2840]">
                  <span className="font-pixel text-[10px] text-cyan-hud">HABITAT</span>
                </div>
                {photo && (
                  <motion.p
                    className="mt-2 font-mono text-[10px] text-[#f4fff4]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    NASA · {MISSION2_META.location} · {MISSION2_META.solLabel}
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
