import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import {
  EXERCISES,
  foodById,
  mealKcal,
  HYGIENE_ACTIONS,
  MISSION2_META,
  NIGHT_REPORT_STEPS,
  type Mission2Choices,
  type Mission2Scores,
} from '../../data/mission2Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  open: boolean
  playerName: string
  choices: Mission2Choices
  scores: Mission2Scores
  onDone: () => void
}

/** Reusable holographic night panel — 7 steps with kid-friendly progress. */
export function NightReportModal({ open, playerName, choices, scores, onDone }: Props) {
  const [step, setStep] = useState(0)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (!open) setStep(0)
  }

  useEffect(() => {
    if (open) soundEngine.telemetry()
  }, [open])

  useEffect(() => {
    if (!open) return
    if (step >= NIGHT_REPORT_STEPS.length - 1) return
    const id = window.setTimeout(() => {
      soundEngine.telemetry()
      setStep((s) => s + 1)
    }, 1600)
    return () => clearTimeout(id)
  }, [open, step])

  if (!open) return null

  const current = NIGHT_REPORT_STEPS[step]!
  const progress = ((step + 1) / NIGHT_REPORT_STEPS.length) * 100
  const last = step >= NIGHT_REPORT_STEPS.length - 1

  const exerciseLabels = choices.exercises
    .map((id) => EXERCISES.find((e) => e.id === id)?.title)
    .filter(Boolean)
    .join(', ')

  const foodLabels = choices.foods
    .map((id) => foodById(id)?.label)
    .filter(Boolean)
    .join(', ')

  const hygieneOk = choices.hygieneDone.length >= HYGIENE_ACTIONS.length

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-void-950/55 p-3 sm:items-center sm:p-4">
      <motion.div
        className="relative w-full max-w-md overflow-hidden rounded-md border-2 border-cyan-hud/70 bg-[#061018]/95 shadow-[0_0_28px_rgba(94,231,255,0.22)]"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        style={{ touchAction: 'manipulation' }}
      >
        <div className="flex items-center gap-2 border-b border-cyan-hud/30 px-3 py-2">
          <img src={MEDIA.capi.neutral} alt="" className="size-10 rounded object-cover" draggable={false} />
          <div className="min-w-0">
            <p className="font-pixel text-[10px] tracking-widest text-cyan-hud uppercase">Painel noturno · Capi</p>
            <p className="truncate font-pixel text-[9px] text-void-300">Monitorando {playerName}</p>
          </div>
        </div>

        <div className="px-3 pt-2">
          <div className="mb-1 flex justify-between font-pixel text-[9px] text-void-300">
            <span>
              Passo {step + 1}/{NIGHT_REPORT_STEPS.length}: {current.label}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-void-950">
            <motion.div className="h-full rounded-full bg-cyan-hud" animate={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="min-h-[9.5rem] px-3 py-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="font-pixel text-sm text-[#f4fff4]">{current.title}</h3>
              {current.id === 'health' && (
                <ul className="mt-2 space-y-1 font-pixel text-[10px] text-void-200 sm:text-xs">
                  <li>Saúde física: {scores.physicalHealth}%</li>
                  <li>Hidratação: {scores.hydration}%</li>
                  <li>FC repouso (simulada): {58 + Math.floor((100 - scores.physicalHealth) / 8)} bpm</li>
                </ul>
              )}
              {current.id === 'sleep' && (
                <ul className="mt-2 space-y-1 font-pixel text-[10px] text-void-200 sm:text-xs">
                  <li>Duração: {scores.sleepHours} h</li>
                  <li>Sleep Score: {scores.sleepScore}/100</li>
                  <li>Saúde: {scores.wellbeing}%</li>
                </ul>
              )}
              {current.id === 'activities' && (
                <ul className="mt-2 space-y-1 font-pixel text-[10px] text-void-200 sm:text-xs">
                  <li>Exercícios: {exerciseLabels || '—'}</li>
                  <li>
                    Refeição: {foodLabels || '—'} · {mealKcal(choices.foods)} kcal
                  </li>
                  <li>Água da refeição: {Math.round(choices.waterRationL * 1000)} ml</li>
                  <li>Higiene: {hygieneOk ? 'completa' : 'parcial'}</li>
                </ul>
              )}
              {current.id === 'research' && (
                <p className="mt-2 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
                  Diário científico: painéis solares (Missão 1) + rotina de saúde (Missão 2) organizados com fotos e
                  observações da Capi.
                </p>
              )}
              {current.id === 'storage' && (
                <p className="mt-2 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
                  Pacote completo salvo no servidor de bordo da espaçonave. Integridade: OK.
                </p>
              )}
              {current.id === 'comms' && (
                <p className="mt-2 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
                  Atraso Marte–Terra: ~4 a 24 min (ida). Status: <span className="text-energy">Armazenado localmente — aguardando janela de sinal com a Terra</span>.
                </p>
              )}
              {current.id === 'confirm' && (
                <div className="mt-2 space-y-2 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
                  <p className="rounded border border-energy/50 bg-energy/10 px-2 py-2 text-energy">
                    {MISSION2_META.educationalDisclaimer}
                  </p>
                  <p>
                    Referência: <span className="text-cyan-hud">{MISSION2_META.nasaCitation}</span>
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {last && (
          <div className="border-t border-cyan-hud/25 px-3 py-3">
            <McButton
              className="min-h-12 w-full font-pixel text-lg font-bold"
              onClick={() => {
                soundEngine.success()
                onDone()
              }}
            >
              Amanhecer
            </McButton>
          </div>
        )}
      </motion.div>
    </div>
  )
}
