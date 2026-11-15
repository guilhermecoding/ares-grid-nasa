import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FullscreenButton } from '../FullscreenButton'
import { StatusIndicators } from '../StatusIndicators'
import {
  BRIDGE_TO_HYGIENE,
  BRIDGE_TO_NUTRITION,
  BRIDGE_TO_SLEEP,
  HYGIENE_BONUS_CARD,
  BALANCED_MEAL_BONUS,
  computeMission2Scores,
  isMission2EnergySoftLocked,
  lightingForStep,
  roomAccentForStep,
  type ExerciseId,
  type HygieneId,
  type Mission2Bridge,
  type Mission2Choices,
  type Mission2Step,
  type NutritionCardId,
} from '../../data/mission2Data'
import { MAX_WATER_RESERVE_L, type BaseStats } from '../../types/game'
import { CapiBridgeDialog } from './CapiBridgeDialog'
import { EnergyDepletedOverlay } from './EnergyDepletedOverlay'
import { HabitatInteriorBackground } from './HabitatInteriorBackground'
import { Mission2Logbook } from './Mission2Logbook'
import { Mission2Outro } from './Mission2Outro'
import { NightReportModal } from './NightReportModal'
import { ExerciseStep } from './steps/ExerciseStep'
import { HygieneStep } from './steps/HygieneStep'
import { IntroStep } from './steps/IntroStep'
import { MorningWakeupStep } from './steps/MorningWakeupStep'
import { NutritionStep } from './steps/NutritionStep'
import { SleepPrepStep } from './steps/SleepPrepStep'

const DEFAULT_STATS: BaseStats = { energy: 68, water: 85, wellbeing: 70 }

interface Props {
  /** Final meters after the day (energy/water spent stay saved for the base). */
  onComplete: (result: BaseStats) => void
  /** Leave without finishing — still pass current meters so progress is not rolled back. */
  onExit: (result: BaseStats) => void
  onReady?: () => void
  stats?: BaseStats
  playerName?: string
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function pctToLiters(waterPct: number) {
  return Math.round((waterPct / 100) * MAX_WATER_RESERVE_L * 10) / 10
}

function litersToPct(liters: number) {
  return clamp((liters / MAX_WATER_RESERVE_L) * 100)
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
  /** Floor so a weak Missão 01 storm still leaves a finishable day (max path ~16%). */
  const [baseEnergy, setBaseEnergy] = useState(() => clamp(Math.max(stats.energy, 28)))
  const [waterL, setWaterL] = useState(() => pctToLiters(stats.water))
  const [wellbeingBoost, setWellbeingBoost] = useState(0)
  const [contaminationRisk, setContaminationRisk] = useState(100)
  const [exercises, setExercises] = useState<ExerciseId[]>([])
  const [foods, setFoods] = useState<string[]>([])
  const [nutritionCards, setNutritionCards] = useState<NutritionCardId[]>([])
  const [waterRationL, setWaterRationL] = useState(0.35)
  const [hygieneDone, setHygieneDone] = useState<HygieneId[]>([])
  const [cabinDone, setCabinDone] = useState(false)
  const [nightOpen, setNightOpen] = useState(false)
  const [bridge, setBridge] = useState<Mission2Bridge | null>(null)

  const choices: Mission2Choices = useMemo(
    () => ({ exercises, foods, waterRationL, hygieneDone }),
    [exercises, foods, waterRationL, hygieneDone],
  )

  const scores = useMemo(
    () => computeMission2Scores(choices, stats.energy),
    [choices, stats.energy],
  )

  const wellbeingLive = useMemo(() => {
    const base = clamp(stats.wellbeing * 0.55 + wellbeingBoost)
    if (
      step === 'morning_wakeup' ||
      step === 'special_capi_night_report' ||
      step === 'logbook' ||
      step === 'mission_outro'
    ) {
      return clamp(Math.max(base, scores.wellbeing))
    }
    return clamp(base)
  }, [step, wellbeingBoost, scores.wellbeing, stats.wellbeing])

  const hudStats: BaseStats = useMemo(
    () => ({
      energy: baseEnergy,
      water: litersToPct(waterL),
      wellbeing: wellbeingLive,
    }),
    [baseEnergy, waterL, wellbeingLive],
  )

  const lighting = lightingForStep(step)
  const room = roomAccentForStep(step)

  const energySoftLocked =
    !bridge &&
    isMission2EnergySoftLocked(step, baseEnergy, exercises, nutritionCards, hygieneDone)

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

  const gainWellbeing = useCallback((n: number) => {
    setWellbeingBoost((b) => b + n)
  }, [])

  const onExerciseOne = useCallback(
    (id: ExerciseId, energyCost: number, waterCostL: number, wellbeingGain: number) => {
      spend(energyCost, waterCostL)
      gainWellbeing(wellbeingGain)
      setExercises((prev) => (prev.includes(id) ? prev : [...prev, id]))
    },
    [gainWellbeing, spend],
  )

  const onNutritionConfirm = useCallback((foodsPicked: string[], waterMl: number) => {
    setFoods(foodsPicked)
    setNutritionCards(['protein', 'veggie', 'carb', 'hydrate'])
    setWaterRationL(waterMl / 1000)
    setWaterL((w) => Math.max(0, Math.round((w - waterMl / 1000) * 10) / 10))
    setWellbeingBoost((b) => b + BALANCED_MEAL_BONUS.wellbeing)
    setBaseEnergy((e) => clamp(e + BALANCED_MEAL_BONUS.energy))
    setBridge('hygiene')
  }, [])

  const onHygieneOne = useCallback(
    (
      id: HygieneId | typeof HYGIENE_BONUS_CARD.id,
      energyCost: number,
      waterCostL: number,
      wellbeingGain: number,
      contaminationDrop: number,
    ) => {
      spend(energyCost, waterCostL)
      gainWellbeing(wellbeingGain)
      if (id === HYGIENE_BONUS_CARD.id) {
        setCabinDone(true)
      } else {
        setHygieneDone((prev) => (prev.includes(id) ? prev : [...prev, id]))
      }
      if (contaminationDrop > 0) {
        setContaminationRisk((r) => Math.max(0, r - contaminationDrop))
      }
    },
    [gainWellbeing, spend],
  )

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

      {(step === 'special_capi_night_report' ||
        step === 'morning_wakeup' ||
        step === 'logbook' ||
        step === 'mission_outro') && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[1] bg-void-950"
          initial={{ opacity: 0 }}
          animate={{
            opacity:
              step === 'morning_wakeup' || step === 'logbook' || step === 'mission_outro' ? 0.15 : 0.45,
          }}
          transition={{ duration: 1.2 }}
        />
      )}

      {step !== 'morning_wakeup' && step !== 'logbook' && step !== 'mission_outro' && (
        <StatusIndicators stats={hudStats} placement="mission" />
      )}

      <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
        <FullscreenButton className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100 shadow-[0_4px_14px_rgba(0,0,0,0.22)] backdrop-blur-[2px] hover:border-cyan-hud/50 hover:text-cyan-hud" />
        <button
          type="button"
          className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100 shadow-[0_4px_14px_rgba(0,0,0,0.22)] backdrop-blur-[2px] hover:border-cyan-hud/50 hover:text-cyan-hud"
          onClick={() => onExit(hudStats)}
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

      {step === 'step2_1_exercise' && !bridge && (
        <ExerciseStep
          energyPct={baseEnergy}
          waterL={waterL}
          completedIds={exercises}
          onCompleteOne={onExerciseOne}
          onContinue={() => setBridge('nutrition')}
        />
      )}

      {step === 'step2_2_nutrition' && !bridge && (
        <NutritionStep onConfirm={onNutritionConfirm} />
      )}

      {step === 'step2_3_hygiene' && !bridge && (
        <HygieneStep
          energyPct={baseEnergy}
          waterL={waterL}
          contaminationRisk={contaminationRisk}
          completedIds={hygieneDone}
          cabinDone={cabinDone}
          onCompleteOne={onHygieneOne}
          onContinue={() => {
            setContaminationRisk(0)
            setBridge('sleep')
          }}
        />
      )}

      {step === 'step2_4_sleep_prep' && (
        <SleepPrepStep
          exerciseDone={exercises.length >= 2}
          nutritionDone={foods.length > 0 && nutritionCards.includes('hydrate')}
          hygieneDone={hygieneDone.length >= 3}
          onSleep={onSleep}
        />
      )}

      {bridge === 'nutrition' && (
        <CapiBridgeDialog
          key="bridge-nutrition"
          open
          dialogId="m2-bridge-nutrition"
          lines={BRIDGE_TO_NUTRITION}
          highlightWords={['alimentar']}
          onDone={() => {
            setBridge(null)
            setStep('step2_2_nutrition')
          }}
        />
      )}
      {bridge === 'hygiene' && (
        <CapiBridgeDialog
          key="bridge-hygiene"
          open
          dialogId="m2-bridge-hygiene"
          lines={BRIDGE_TO_HYGIENE}
          highlightWords={['higiene']}
          onDone={() => {
            setBridge(null)
            setStep('step2_3_hygiene')
          }}
        />
      )}
      {bridge === 'sleep' && (
        <CapiBridgeDialog
          key="bridge-sleep"
          open
          dialogId="m2-bridge-sleep"
          lines={BRIDGE_TO_SLEEP}
          highlightWords={['descanse']}
          onDone={() => {
            setBridge(null)
            setStep('step2_4_sleep_prep')
          }}
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
        <MorningWakeupStep
          playerName={playerName}
          scores={scores}
          onAdvance={() => setStep('logbook')}
        />
      )}

      {step === 'logbook' && (
        <Mission2Logbook
          exercises={exercises}
          nutritionCards={nutritionCards}
          hygieneDone={hygieneDone}
          sleepScore={scores.sleepScore}
          onDone={() => setStep('mission_outro')}
        />
      )}

      {step === 'mission_outro' && (
        <Mission2Outro stats={hudStats} onDone={() => onComplete(hudStats)} />
      )}

      {energySoftLocked && <EnergyDepletedOverlay onExit={() => onExit(hudStats)} />}
    </div>
  )
}
