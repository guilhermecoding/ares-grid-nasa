import { useCallback, useMemo } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import {
  EXERCISES,
  EXERCISE_REQUIRED_COUNT,
  type ExerciseId,
} from '../../../data/mission2Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { StageCostBadge, StageHeader, SwipeDeck, type ActivityCardModel } from '../ActivityCard'
import { SciTermM2 } from '../SciTermM2'

const ICONS: Record<ExerciseId, string> = {
  treadmill: MEDIA.mission2.treadmill,
  resistance: MEDIA.mission2.resistance,
  stretch: MEDIA.mission2.stretch,
  balance: MEDIA.mission2.balance,
}

interface Props {
  energyPct: number
  waterL: number
  completedIds: ExerciseId[]
  onCompleteOne: (id: ExerciseId, energyCost: number, waterCostL: number, wellbeingGain: number) => void
  onContinue: () => void
}

export function ExerciseStep({
  energyPct,
  waterL,
  completedIds,
  onCompleteOne,
  onContinue,
}: Props) {
  const doneSet = useMemo(() => new Set(completedIds), [completedIds])
  const energySpent = useMemo(
    () => EXERCISES.filter((e) => doneSet.has(e.id)).reduce((s, e) => s + e.energyCost, 0),
    [doneSet],
  )
  const waterSpent = useMemo(
    () => EXERCISES.filter((e) => doneSet.has(e.id)).reduce((s, e) => s + e.waterCostL, 0),
    [doneSet],
  )

  const ready = completedIds.length >= EXERCISE_REQUIRED_COUNT
  const quotaFull = completedIds.length >= EXERCISE_REQUIRED_COUNT

  const deckCards: ActivityCardModel[] = useMemo(
    () =>
      EXERCISES.filter((ex) => !doneSet.has(ex.id)).map((ex) => ({
        id: ex.id,
        title: ex.title,
        detail: ex.focus,
        color: ex.color,
        energyCost: ex.energyCost,
        waterCostL: ex.waterCostL,
        wellbeingGain: ex.wellbeingGain,
        iconSrc: ICONS[ex.id],
      })),
    [doneSet],
  )

  const canAccept = useCallback(
    (id: string) => {
      if (quotaFull) return false
      const ex = EXERCISES.find((e) => e.id === id)
      if (!ex) return false
      return ex.energyCost <= energyPct && ex.waterCostL <= waterL
    },
    [energyPct, quotaFull, waterL],
  )

  const handleAccept = useCallback(
    (id: string) => {
      const ex = EXERCISES.find((e) => e.id === id)
      if (!ex || doneSet.has(ex.id)) return
      if (completedIds.length >= EXERCISE_REQUIRED_COUNT) return
      if (ex.energyCost > energyPct || ex.waterCostL > waterL) return
      onCompleteOne(ex.id, ex.energyCost, ex.waterCostL, ex.wellbeingGain)
    },
    [completedIds.length, doneSet, energyPct, onCompleteOne, waterL],
  )

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ touchAction: 'manipulation' }}>
      <StageHeader
        title="Etapa — Exercícios"
        subtitle={
          <>
            Recarregue a saúde com <strong>2 exercícios</strong>. Termo:{' '}
            <SciTermM2 term="Microgravidade" />. Feitos: {completedIds.length}/{EXERCISE_REQUIRED_COUNT}
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col pt-16 pb-[4.75rem] sm:pt-[4.5rem]">
        <SwipeDeck
          cards={deckCards}
          canAccept={canAccept}
          onAccept={handleAccept}
          emptyMessage="2 exercícios feitos — continue."
        />
      </div>

      <StageCostBadge energySpent={energySpent} waterSpentL={waterSpent} label="Custo dos exercícios" />

      <div className="absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex justify-end px-3 sm:px-4">
        <McButton
          className="min-h-12 min-w-[10rem] font-pixel text-lg font-bold disabled:opacity-40"
          disabled={!ready}
          onClick={() => {
            soundEngine.harvest()
            onContinue()
          }}
        >
          Continuar
        </McButton>
      </div>
    </div>
  )
}
