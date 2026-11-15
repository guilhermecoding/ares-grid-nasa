import { useCallback, useMemo, useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import {
  EXERCISES,
  EXERCISE_REQUIRED_COUNT,
  type ExerciseId,
} from '../../../data/mission2Data'
import { McButton } from '../../../opening/McButton'
import { PixelDialogBox } from '../../../opening/PixelDialogBox'
import { soundEngine } from '../../../services/soundEngine'
import { ActivityCard, ActivityCardGrid, StageCostBadge } from '../ActivityCard'
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
  const [busyId, setBusyId] = useState<string | null>(null)
  const [capiOpen, setCapiOpen] = useState(false)

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

  const handleActivate = useCallback(
    (id: string) => {
      setBusyId(null)
      const ex = EXERCISES.find((e) => e.id === id)
      if (!ex || doneSet.has(ex.id)) return
      if (completedIds.length >= EXERCISE_REQUIRED_COUNT) return
      if (ex.energyCost > energyPct || ex.waterCostL > waterL) return
      onCompleteOne(ex.id, ex.energyCost, ex.waterCostL, ex.wellbeingGain)
      if (completedIds.length + 1 >= EXERCISE_REQUIRED_COUNT) {
        window.setTimeout(() => setCapiOpen(true), 180)
      }
    },
    [completedIds.length, doneSet, energyPct, onCompleteOne, waterL],
  )

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ touchAction: 'manipulation' }}>
      <div className="pointer-events-none h-[7.5rem] shrink-0 sm:h-32" />

      <div className="flex min-h-0 flex-1 flex-col justify-center pb-28">
        <ActivityCardGrid
          title="Etapa — Exercícios"
          subtitle={
            <>
              Recarregue a saúde com <strong>2 exercícios</strong>. Termo:{' '}
              <SciTermM2 term="Microgravidade" />. Feitos: {completedIds.length}/{EXERCISE_REQUIRED_COUNT}
            </>
          }
        >
          {EXERCISES.map((ex) => {
            const done = doneSet.has(ex.id)
            const cannotAfford = ex.energyCost > energyPct || ex.waterCostL > waterL
            const maxed = !done && completedIds.length >= EXERCISE_REQUIRED_COUNT
            return (
              <ActivityCard
                key={ex.id}
                card={{
                  id: ex.id,
                  title: ex.title,
                  detail: ex.focus,
                  color: ex.color,
                  energyCost: ex.energyCost,
                  waterCostL: ex.waterCostL,
                  wellbeingGain: ex.wellbeingGain,
                  iconSrc: ICONS[ex.id],
                }}
                done={done}
                disabled={cannotAfford || maxed}
                busy={busyId !== null && busyId !== ex.id}
                onStart={setBusyId}
                onActivate={handleActivate}
              />
            )
          })}
        </ActivityCardGrid>
      </div>

      <StageCostBadge energySpent={energySpent} waterSpentL={waterSpent} label="Custo dos exercícios" />

      <div className="absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex justify-end px-3 sm:px-4">
        <McButton
          className="min-h-12 min-w-[10rem] font-pixel text-lg font-bold disabled:opacity-40"
          disabled={!ready || busyId !== null}
          onClick={() => {
            soundEngine.harvest()
            onContinue()
          }}
        >
          Continuar
        </McButton>
      </div>

      <PixelDialogBox
        open={capiOpen}
        lines={['Muito bem! Vou registrar os 2 exercícios no diário.']}
        title="Capi"
        characterSrc={MEDIA.capi.excited2}
        characterAlt="Capi"
        onClosed={() => setCapiOpen(false)}
        footer={
          <McButton className="min-h-12 px-6 font-pixel font-bold" onClick={() => setCapiOpen(false)}>
            Ok
          </McButton>
        }
      />
    </div>
  )
}
