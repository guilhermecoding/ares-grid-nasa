import { useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import {
  EXERCISES,
  EXERCISE_REQUIRED_COUNT,
  type ExerciseId,
  type ExerciseOption,
} from '../../../data/mission2Data'
import { McButton } from '../../../opening/McButton'
import { PixelDialogBox } from '../../../opening/PixelDialogBox'
import { soundEngine } from '../../../services/soundEngine'
import { Mission2Stage } from '../Mission2Stage'
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

function selectionCost(ids: readonly ExerciseId[]) {
  return ids.reduce(
    (acc, id) => {
      const ex = EXERCISES.find((item) => item.id === id)
      if (!ex) return acc
      return { energy: acc.energy + ex.energyCost, waterL: acc.waterL + ex.waterCostL }
    },
    { energy: 0, waterL: 0 },
  )
}

function ExerciseCard({
  exercise,
  selected,
  blocked,
  onToggle,
}: {
  exercise: ExerciseOption
  selected: boolean
  blocked: boolean
  onToggle: (id: ExerciseId) => void
}) {
  return (
    <div
      className={`flex flex-col border-2 bg-[#0a1628]/92 text-left shadow-[0_8px_20px_rgba(0,0,0,0.35)] ${
        selected ? 'border-life' : 'border-cyan-hud/30'
      } ${blocked ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-center bg-[#061018] p-3">
        <img
          src={ICONS[exercise.id]}
          alt=""
          draggable={false}
          className="size-16 object-contain sm:size-20"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 md:p-4">
        <p className="font-pixel text-sm text-cyan-hud md:text-base">{exercise.title}</p>
        <p className="text-sm leading-snug text-void-100">{exercise.focus}</p>
        <p className="text-sm text-energy">
          −{exercise.energyCost}% energia · −{exercise.waterCostL} L água
        </p>
        <p className="text-sm text-life">+{exercise.wellbeingGain} saúde</p>
        <div className="mt-auto pt-3">
          <McButton
            className={`min-h-12 w-full font-pixel text-base font-bold ${selected ? 'mc-btn-green' : ''}`}
            disabled={blocked}
            aria-label={selected ? `Tirar ${exercise.title}` : `Escolher ${exercise.title}`}
            onClick={() => onToggle(exercise.id)}
          >
            {selected ? 'Escolhido' : 'Escolher'}
          </McButton>
        </div>
      </div>
    </div>
  )
}

/** Desafio 2.1 — pick two activities, then Capi logs them. */
export function ExerciseStep({ energyPct, waterL, completedIds, onCompleteOne, onContinue }: Props) {
  const [picked, setPicked] = useState<ExerciseId[]>(completedIds)
  const [praise, setPraise] = useState(false)
  const [praiseReady, setPraiseReady] = useState(false)
  const locked = praise || completedIds.length >= EXERCISE_REQUIRED_COUNT

  const toggle = (id: ExerciseId) => {
    if (locked) return
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id)
      if (prev.length >= EXERCISE_REQUIRED_COUNT) return prev
      const next = [...prev, id]
      const cost = selectionCost(next)
      if (cost.energy > energyPct || cost.waterL > waterL) return prev
      return next
    })
    soundEngine.click()
  }

  const confirm = () => {
    if (picked.length < EXERCISE_REQUIRED_COUNT || locked) return
    for (const id of picked) {
      const ex = EXERCISES.find((item) => item.id === id)
      if (!ex || completedIds.includes(id)) continue
      onCompleteOne(ex.id, ex.energyCost, ex.waterCostL, ex.wellbeingGain)
    }
    soundEngine.success()
    setPraise(true)
  }

  const ready = picked.length >= EXERCISE_REQUIRED_COUNT

  return (
    <Mission2Stage
      dialogOpen={praise}
      footer={
        <McButton
          className="min-h-12 min-w-[12rem] font-pixel text-lg font-bold disabled:opacity-40"
          disabled={!ready || locked}
          onClick={confirm}
        >
          Registrar treino
        </McButton>
      }
      title="Desafio 2.1 — Exercícios físicos"
      subtitle={
        <>
          Escolha {EXERCISE_REQUIRED_COUNT} atividades para cuidar dos músculos na{' '}
          <SciTermM2 term="Microgravidade" />. Feitas: {picked.length}/{EXERCISE_REQUIRED_COUNT}
        </>
      }
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {EXERCISES.map((exercise) => {
          const selected = picked.includes(exercise.id)
          const cost = selectionCost(selected ? picked : [...picked, exercise.id])
          const blocked =
            locked || (!selected && (picked.length >= EXERCISE_REQUIRED_COUNT || cost.energy > energyPct || cost.waterL > waterL))
          return (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              selected={selected}
              blocked={blocked}
              onToggle={toggle}
            />
          )
        })}
      </div>

      <PixelDialogBox
        open={praise}
        position="center"
        title="Capi"
        lines={['Muito bem! Vou registrar a atividade realizada.']}
        characterSrc={MEDIA.capi.excited2}
        characterAlt="Capi"
        onTypingComplete={() => setPraiseReady(true)}
        footer={
          praiseReady ? (
            <McButton className="mc-btn-green min-h-12 px-4 font-pixel" onClick={onContinue}>
              Hora da refeição
            </McButton>
          ) : null
        }
      />
    </Mission2Stage>
  )
}
