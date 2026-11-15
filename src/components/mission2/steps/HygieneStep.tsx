import { useCallback, useMemo, useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import {
  HYGIENE_ACTIONS,
  HYGIENE_BONUS_CARD,
  type HygieneId,
} from '../../../data/mission2Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { ActivityCard, ActivityCardGrid, StageCostBadge } from '../ActivityCard'
import { SciTermM2 } from '../SciTermM2'

type HygieneCardId = HygieneId | typeof HYGIENE_BONUS_CARD.id

const HYGIENE_CARDS = [
  ...HYGIENE_ACTIONS.map((a) => ({
    id: a.id as HygieneCardId,
    title: a.title,
    detail: a.detail,
    energyCost: a.energyCost,
    waterCostL: a.waterCostL,
    wellbeingGain: a.wellbeingGain,
    color: a.color,
    contaminationDrop: a.contaminationDrop,
    isBonus: false as const,
  })),
  {
    id: HYGIENE_BONUS_CARD.id as HygieneCardId,
    title: HYGIENE_BONUS_CARD.title,
    detail: HYGIENE_BONUS_CARD.detail,
    energyCost: HYGIENE_BONUS_CARD.energyCost,
    waterCostL: HYGIENE_BONUS_CARD.waterCostL,
    wellbeingGain: HYGIENE_BONUS_CARD.wellbeingGain,
    color: HYGIENE_BONUS_CARD.color,
    contaminationDrop: 0,
    isBonus: true as const,
  },
]

interface Props {
  energyPct: number
  waterL: number
  contaminationRisk: number
  completedIds: HygieneId[]
  cabinDone: boolean
  onCompleteOne: (
    id: HygieneCardId,
    energyCost: number,
    waterCostL: number,
    wellbeingGain: number,
    contaminationDrop: number,
  ) => void
  onContinue: () => void
}

export function HygieneStep({
  energyPct,
  waterL,
  contaminationRisk,
  completedIds,
  cabinDone,
  onCompleteOne,
  onContinue,
}: Props) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const doneSet = useMemo(() => {
    const s = new Set<string>(completedIds)
    if (cabinDone) s.add(HYGIENE_BONUS_CARD.id)
    return s
  }, [cabinDone, completedIds])

  const energySpent = useMemo(() => {
    let s = HYGIENE_ACTIONS.filter((a) => completedIds.includes(a.id)).reduce((acc, a) => acc + a.energyCost, 0)
    if (cabinDone) s += HYGIENE_BONUS_CARD.energyCost
    return s
  }, [cabinDone, completedIds])

  const waterSpent = useMemo(() => {
    let s = HYGIENE_ACTIONS.filter((a) => completedIds.includes(a.id)).reduce((acc, a) => acc + a.waterCostL, 0)
    if (cabinDone) s += HYGIENE_BONUS_CARD.waterCostL
    return s
  }, [cabinDone, completedIds])

  const requiredDone = completedIds.length >= HYGIENE_ACTIONS.length
  const ready = requiredDone

  const handleActivate = useCallback(
    (id: string) => {
      setBusyId(null)
      const card = HYGIENE_CARDS.find((c) => c.id === id)
      if (!card) return
      if (card.isBonus ? cabinDone : completedIds.includes(card.id as HygieneId)) return
      if (card.energyCost > energyPct || card.waterCostL > waterL) return
      onCompleteOne(card.id, card.energyCost, card.waterCostL, card.wellbeingGain, card.contaminationDrop)
    },
    [cabinDone, completedIds, energyPct, onCompleteOne, waterL],
  )

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ touchAction: 'manipulation' }}>
      <div className="pointer-events-none h-[7.5rem] shrink-0 sm:h-32" />

      <div className="flex min-h-0 flex-1 flex-col justify-center pb-28">
        <ActivityCardGrid
          title="Etapa — Higiene"
          subtitle={
            <span className="inline-flex items-center gap-2">
              <img src={MEDIA.mission2.hygiene} alt="" className="size-8 object-contain" draggable={false} />
              <span>
                Reduza <SciTermM2 term="Contaminação" />. Complete as 3 ações (4º card é bônus). Risco:{' '}
                <strong className={contaminationRisk === 0 ? 'text-[#4ade80]' : 'text-danger'}>
                  {contaminationRisk}%
                </strong>
              </span>
            </span>
          }
        >
          {HYGIENE_CARDS.map((card) => {
            const done = doneSet.has(card.id)
            const cannotAfford = card.energyCost > energyPct || card.waterCostL > waterL
            const bonusLocked = card.isBonus && !requiredDone && !done
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
                  iconNode: (
                    <span className="font-pixel text-2xl" style={{ color: card.color }}>
                      {card.isBonus ? '✓' : '◆'}
                    </span>
                  ),
                }}
                done={done}
                disabled={cannotAfford || bonusLocked}
                busy={busyId !== null && busyId !== card.id}
                onStart={setBusyId}
                onActivate={handleActivate}
              />
            )
          })}
        </ActivityCardGrid>
      </div>

      <StageCostBadge energySpent={energySpent} waterSpentL={waterSpent} label="Custo da higiene" />

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
