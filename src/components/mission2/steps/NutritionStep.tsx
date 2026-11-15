import { useCallback, useMemo, useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import {
  NUTRITION_CARDS,
  NUTRITION_REQUIRED_COUNT,
  type NutritionCardId,
} from '../../../data/mission2Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { ActivityCard, ActivityCardGrid, StageCostBadge } from '../ActivityCard'
import { SciTermM2 } from '../SciTermM2'

function NutritionIcon({ id }: { id: NutritionCardId }) {
  if (id === 'hydrate') {
    return (
      <svg viewBox="0 0 40 40" className="size-10 sm:size-12" aria-hidden>
        <path d="M20 6c0 0-10 12-10 18a10 10 0 0020 0c0-6-10-18-10-18z" fill="#38bdf8" opacity="0.9" />
      </svg>
    )
  }
  if (id === 'protein') {
    return (
      <svg viewBox="0 0 40 40" className="size-10 sm:size-12" aria-hidden>
        <ellipse cx="20" cy="22" rx="12" ry="8" fill="#f0b429" />
        <ellipse cx="20" cy="18" rx="8" ry="5" fill="#fbbf24" />
      </svg>
    )
  }
  if (id === 'veggie') {
    return (
      <svg viewBox="0 0 40 40" className="size-10 sm:size-12" aria-hidden>
        <path d="M20 8c-6 8-10 14-10 20a10 10 0 0020 0c0-6-4-12-10-20z" fill="#5ecf9a" />
        <path d="M20 8v10" stroke="#166534" strokeWidth="2" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 40 40" className="size-10 sm:size-12" aria-hidden>
      <circle cx="20" cy="22" r="10" fill="#ff6b8a" />
      <path d="M20 10c2 4 4 6 6 7" stroke="#166534" strokeWidth="2" fill="none" />
    </svg>
  )
}

interface Props {
  energyPct: number
  waterL: number
  completedIds: NutritionCardId[]
  onCompleteOne: (
    id: NutritionCardId,
    energyCost: number,
    waterCostL: number,
    wellbeingGain: number,
    foodIds: string[],
    waterRationL?: number,
  ) => void
  onContinue: () => void
}

export function NutritionStep({
  energyPct,
  waterL,
  completedIds,
  onCompleteOne,
  onContinue,
}: Props) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const doneSet = useMemo(() => new Set(completedIds), [completedIds])

  const energySpent = useMemo(
    () => NUTRITION_CARDS.filter((c) => doneSet.has(c.id)).reduce((s, c) => s + c.energyCost, 0),
    [doneSet],
  )
  const waterSpent = useMemo(
    () => NUTRITION_CARDS.filter((c) => doneSet.has(c.id)).reduce((s, c) => s + c.waterCostL, 0),
    [doneSet],
  )

  const hasHydrate = doneSet.has('hydrate')
  const ready = completedIds.length >= NUTRITION_REQUIRED_COUNT && hasHydrate

  const handleActivate = useCallback(
    (id: string) => {
      setBusyId(null)
      const card = NUTRITION_CARDS.find((c) => c.id === id)
      if (!card || doneSet.has(card.id)) return
      if (card.energyCost > energyPct || card.waterCostL > waterL) return
      onCompleteOne(
        card.id,
        card.energyCost,
        card.waterCostL,
        card.wellbeingGain,
        card.foodIds ?? [],
        card.waterRationL,
      )
    },
    [doneSet, energyPct, onCompleteOne, waterL],
  )

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ touchAction: 'manipulation' }}>
      <div className="pointer-events-none h-[7.5rem] shrink-0 sm:h-32" />

      <div className="flex min-h-0 flex-1 flex-col justify-center pb-28">
        <ActivityCardGrid
          title="Etapa — Alimentação"
          subtitle={
            <span className="inline-flex items-center gap-2">
              <img src={MEDIA.mission2.tray} alt="" className="size-8 object-contain" draggable={false} />
              <span>
                Complete <strong>3 cards</strong> (inclua Hidratação). <SciTermM2 term="Metabolismo" /> e{' '}
                <SciTermM2 term="Hidratação" />. Feitos: {completedIds.length}/{NUTRITION_REQUIRED_COUNT}
              </span>
            </span>
          }
        >
          {NUTRITION_CARDS.map((card) => {
            const done = doneSet.has(card.id)
            const cannotAfford = card.energyCost > energyPct || card.waterCostL > waterL
            return (
              <ActivityCard
                key={card.id}
                card={{
                  id: card.id,
                  title: card.title,
                  detail: card.detail,
                  color: card.color,
                  energyCost: card.energyCost,
                  waterCostL: card.waterCostL,
                  wellbeingGain: card.wellbeingGain,
                  iconNode: <NutritionIcon id={card.id} />,
                }}
                done={done}
                disabled={cannotAfford}
                busy={busyId !== null && busyId !== card.id}
                onStart={setBusyId}
                onActivate={handleActivate}
              />
            )
          })}
        </ActivityCardGrid>
      </div>

      <StageCostBadge energySpent={energySpent} waterSpentL={waterSpent} label="Custo da refeição" />

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
    </div>
  )
}
