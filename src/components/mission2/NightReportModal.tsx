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
import { useI18n } from '../../i18n/locale'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  open: boolean
  playerName: string
  choices: Mission2Choices
  scores: Mission2Scores
  onDone: () => void
  /** Extra diary line for later missions. Mission 2 keeps its own sentence when this is omitted. */
  researchNote?: string
  /** Extra health lines. Mission 2 keeps its three indicators when this is omitted. */
  healthExtra?: readonly string[]
  doneLabel?: string
}

const STEP_COPY: Record<string, { label: string; title: string }> = {
  health: { label: 'Health', title: 'Body meters' },
  sleep: { label: 'Sleep', title: 'Hours and Sleep Score' },
  activities: { label: 'Activities', title: 'Day summary' },
  research: { label: 'Research', title: 'Science log' },
  storage: { label: 'Storage', title: 'Onboard server' },
  comms: { label: 'Communication', title: 'Mars–Earth link' },
  confirm: { label: 'Confirmation', title: 'Learning note' },
}

/** Reusable holographic night panel — 7 steps with kid-friendly progress. */
export function NightReportModal({
  open,
  playerName,
  choices,
  scores,
  onDone,
  researchNote,
  healthExtra,
  doneLabel = 'Amanhecer',
}: Props) {
  const { t } = useI18n()
  const buttonLabel = doneLabel === 'Amanhecer' ? t('Sunrise', 'Amanhecer') : doneLabel
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
    .map((id) => {
      const item = EXERCISES.find((e) => e.id === id) as { title: string; titleEn?: string } | undefined
      return item ? t(item.titleEn ?? item.title, item.title) : ''
    })
    .filter(Boolean)
    .join(', ')

  const foodLabels = choices.foods
    .map((id) => {
      const item = foodById(id) as { label: string; labelEn?: string } | undefined
      return item ? t(item.labelEn ?? item.label, item.label) : ''
    })
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
            <p className="font-pixel text-[10px] tracking-widest text-cyan-hud uppercase">{t('Night panel · Capi', 'Painel noturno · Capi')}</p>
            <p className="truncate font-pixel text-[9px] text-void-300">{t(`Watching ${playerName}`, `Monitorando ${playerName}`)}</p>
          </div>
        </div>

        <div className="px-3 pt-2">
          <div className="mb-1 flex justify-between font-pixel text-[9px] text-void-300">
            <span>
              {t(`Step ${step + 1}/${NIGHT_REPORT_STEPS.length}`, `Passo ${step + 1}/${NIGHT_REPORT_STEPS.length}`)}: {t(STEP_COPY[current.id]?.label ?? current.label, current.label)}
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
              <h3 className="font-pixel text-sm text-[#f4fff4]">{t(STEP_COPY[current.id]?.title ?? current.title, current.title)}</h3>
              {current.id === 'health' && (
                <ul className="mt-2 space-y-1 font-pixel text-[10px] text-void-200 sm:text-xs">
                  <li>{t('Physical health', 'Saúde física')}: {scores.physicalHealth}%</li>
                  <li>{t('Hydration', 'Hidratação')}: {scores.hydration}%</li>
                  <li>{t('Resting heart rate (simulated)', 'FC repouso (simulada)')}: {58 + Math.floor((100 - scores.physicalHealth) / 8)} bpm</li>
                  {healthExtra?.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
              {current.id === 'sleep' && (
                <ul className="mt-2 space-y-1 font-pixel text-[10px] text-void-200 sm:text-xs">
                  <li>{t('Duration', 'Duração')}: {scores.sleepHours} h</li>
                  <li>Sleep Score: {scores.sleepScore}/100</li>
                  <li>{t('Health', 'Saúde')}: {scores.wellbeing}%</li>
                </ul>
              )}
              {current.id === 'activities' && (
                <ul className="mt-2 space-y-1 font-pixel text-[10px] text-void-200 sm:text-xs">
                  <li>{t('Exercises', 'Exercícios')}: {exerciseLabels || '—'}</li>
                  <li>
                    {t('Meal', 'Refeição')}: {foodLabels || '—'} · {mealKcal(choices.foods)} kcal
                  </li>
                  <li>{t('Meal water', 'Água da refeição')}: {Math.round(choices.waterRationL * 1000)} ml</li>
                  <li>{t('Hygiene', 'Higiene')}: {hygieneOk ? t('complete', 'completa') : t('partial', 'parcial')}</li>
                </ul>
              )}
              {current.id === 'research' && (
                <p className="mt-2 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
                  {researchNote ??
                    t(
                      'Science log: solar panels (Mission 1) and the health routine (Mission 2), with photos and notes from Capi.',
                      'Diário científico: painéis solares (Missão 1) + rotina de saúde (Missão 2) organizados com fotos e observações da Capi.',
                    )}
                </p>
              )}
              {current.id === 'storage' && (
                <p className="mt-2 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
                  {t(
                    'Full package saved on the ship’s onboard server. Integrity: OK.',
                    'Pacote completo salvo no servidor de bordo da espaçonave. Integridade: OK.',
                  )}
                </p>
              )}
              {current.id === 'comms' && (
                <p className="mt-2 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
                  {t('Mars–Earth delay: about 4 to 24 min (one way). Status:', 'Atraso Marte–Terra: ~4 a 24 min (ida). Status:')}{' '}
                  <span className="text-energy">
                    {t('Saved on board — waiting for a signal window with Earth', 'Armazenado localmente — aguardando janela de sinal com a Terra')}
                  </span>.
                </p>
              )}
              {current.id === 'confirm' && (
                <div className="mt-2 space-y-2 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
                  <p className="rounded border border-energy/50 bg-energy/10 px-2 py-2 text-energy">
                    {t(
                      'Simulated data for learning. These are not real medical measurements.',
                      MISSION2_META.educationalDisclaimer,
                    )}
                  </p>
                  <p>
                    {t('Reference', 'Referência')}: <span className="text-cyan-hud">{MISSION2_META.nasaCitation}</span>
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
              {buttonLabel}
            </McButton>
          </div>
        )}
      </motion.div>
    </div>
  )
}
