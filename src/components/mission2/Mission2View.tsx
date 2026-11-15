import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MISSION2_META,
  computeMission2Scores,
  exerciseCosts,
  foodCosts,
  hygieneCosts,
  lightingForStep,
  roomAccentForStep,
  type ExerciseId,
  type HygieneId,
  type Mission2Choices,
  type Mission2Step,
} from '../../data/mission2Data'
import type { BaseStats } from '../../types/game'
import { HabitatInteriorBackground } from './HabitatInteriorBackground'
import { Mission2Hud } from './Mission2Hud'
import { NightReportModal } from './NightReportModal'
import { ExerciseStep } from './steps/ExerciseStep'
import { HygieneStep } from './steps/HygieneStep'
import { IntroStep } from './steps/IntroStep'
import { MorningWakeupStep } from './steps/MorningWakeupStep'
import { NutritionStep } from './steps/NutritionStep'
import { SleepPrepStep } from './steps/SleepPrepStep'

const DEFAULT_STATS: BaseStats = { energy: 68, lifeSupport: 85, shield: 70 }

interface Props {
  onComplete: () => void
  onExit: () => void
  onReady?: () => void
  stats?: BaseStats
  playerName?: string
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

/** Mission 02 orchestrator — daily astronaut care routine. */
export default function Mission2View({
  onComplete,
  onExit,
  onReady,
  stats = DEFAULT_STATS,
  playerName = 'Comandante',
}: Props) {
  const [step, setStep] = useState<Mission2Step>('intro')
  const [baseEnergy, setBaseEnergy] = useState(() => clamp(stats.energy))
  const [waterL, setWaterL] = useState<number>(MISSION2_META.initialWaterReserveL)
  const [contaminationRisk, setContaminationRisk] = useState(100)
  const [exercises, setExercises] = useState<ExerciseId[]>([])
  const [foods, setFoods] = useState<string[]>([])
  const [waterRationL, setWaterRationL] = useState(2.2)
  const [hygieneDone, setHygieneDone] = useState<HygieneId[]>([])
  const [nightOpen, setNightOpen] = useState(false)

  const choices: Mission2Choices = useMemo(
    () => ({ exercises, foods, waterRationL, hygieneDone }),
    [exercises, foods, waterRationL, hygieneDone],
  )

  const scores = useMemo(
    () => computeMission2Scores(choices, stats.energy),
    [choices, stats.energy],
  )

  const wellbeingLive = useMemo(() => {
    if (step === 'intro' || step === 'step2_1_exercise') return clamp(48 + baseEnergy * 0.15)
    if (step === 'step2_2_nutrition') return clamp(52 + exercises.length * 6)
    if (step === 'step2_3_hygiene') return clamp(58 + nutritionBalanceProxy(foods) * 0.2)
    return scores.wellbeing
  }, [step, baseEnergy, exercises.length, foods, scores.wellbeing])

  const lighting = lightingForStep(step)
  const room = roomAccentForStep(step)

  useEffect(() => {
    let cancelled = false
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!cancelled) onReady?.()
      })
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(id)
    }
  }, [onReady])

  const spend = useCallback((energy: number, water: number) => {
    setBaseEnergy((e) => clamp(e - energy))
    setWaterL((w) => Math.max(0, Math.round((w - water) * 10) / 10))
  }, [])

  const onExerciseConfirm = (ids: ExerciseId[]) => {
    const c = exerciseCosts(ids)
    spend(c.energy, c.waterL)
    setExercises(ids)
    setStep('step2_2_nutrition')
  }

  const onNutritionConfirm = (foodIds: string[], ration: number) => {
    const c = foodCosts(foodIds)
    spend(c.energy, c.waterL + ration)
    setFoods(foodIds)
    setWaterRationL(ration)
    setStep('step2_3_hygiene')
  }

  const onHygieneConfirm = (done: HygieneId[]) => {
    const c = hygieneCosts(done)
    spend(c.energy, c.waterL)
    setHygieneDone(done)
    setContaminationRisk(0)
    setStep('step2_4_sleep_prep')
  }

  const onSleep = () => {
    setNightOpen(true)
    setStep('special_capi_night_report')
  }

  return (
    <div
      className="relative h-full min-h-[100dvh] w-full overflow-hidden bg-void-950"
      style={{ touchAction: 'manipulation' }}
    >
      <HabitatInteriorBackground lighting={lighting} room={room} />

      {(step === 'special_capi_night_report' || step === 'morning_wakeup') && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[1] bg-void-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: step === 'morning_wakeup' ? 0.15 : 0.45 }}
          transition={{ duration: 1.2 }}
        />
      )}

      {step !== 'morning_wakeup' && (
        <Mission2Hud energyPct={baseEnergy} waterL={waterL} wellbeingPct={wellbeingLive} />
      )}

      <div className="absolute top-3 right-3 z-50">
        <button
          type="button"
          className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100 shadow-[0_4px_14px_rgba(0,0,0,0.22)] backdrop-blur-[2px] hover:border-cyan-hud/50 hover:text-cyan-hud"
          onClick={onExit}
          aria-label="Sair da missão"
          title="Sair"
          style={{ touchAction: 'manipulation' }}
        >
          <svg viewBox="0 0 24 24" className="size-7" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M4 3h10v18H4z" />
            <path d="M7 12h1.5" />
            <path d="M15 12h6" />
            <path d="M18 9l3 3-3 3" />
          </svg>
        </button>
      </div>

      {step === 'intro' && <IntroStep onContinue={() => setStep('step2_1_exercise')} />}

      {step === 'step2_1_exercise' && (
        <ExerciseStep energyPct={baseEnergy} waterL={waterL} onConfirm={onExerciseConfirm} />
      )}

      {step === 'step2_2_nutrition' && (
        <NutritionStep energyPct={baseEnergy} waterL={waterL} onConfirm={onNutritionConfirm} />
      )}

      {step === 'step2_3_hygiene' && (
        <HygieneStep
          energyPct={baseEnergy}
          waterL={waterL}
          contaminationRisk={contaminationRisk}
          onConfirm={onHygieneConfirm}
        />
      )}

      {step === 'step2_4_sleep_prep' && (
        <SleepPrepStep
          exerciseDone={exercises.length > 0}
          nutritionDone={foods.length > 0}
          hygieneDone={hygieneDone.length >= 3}
          onSleep={onSleep}
        />
      )}

      <NightReportModal
        open={nightOpen && step === 'special_capi_night_report'}
        playerName={playerName}
        choices={choices}
        scores={scores}
        onDone={() => {
          setNightOpen(false)
          setStep('morning_wakeup')
        }}
      />

      {step === 'morning_wakeup' && (
        <MorningWakeupStep playerName={playerName} scores={scores} onAdvance={onComplete} />
      )}
    </div>
  )
}

function nutritionBalanceProxy(foodIds: string[]): number {
  const groups = new Set(
    foodIds.map((id) => {
      if (['beans', 'tofu', 'grain'].includes(id)) return 'p'
      if (['lettuce', 'carrot', 'pepper'].includes(id)) return 'v'
      return 'f'
    }),
  )
  return groups.size * 33
}
