import {
  HYGIENE_ACTIONS,
  HYGIENE_BONUS_CARD,
  type HygieneId,
} from '../../../data/mission2Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { Mission2Stage } from '../Mission2Stage'
import { SciTermM2 } from '../SciTermM2'
import { HygieneBay } from './HygieneBay'

type HygieneCardId = HygieneId | typeof HYGIENE_BONUS_CARD.id

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

/** Desafio 2.3 — three hygiene actions. Contamination falls as each one is done. */
export function HygieneStep({
  energyPct,
  waterL,
  contaminationRisk,
  completedIds,
  cabinDone,
  onCompleteOne,
  onContinue,
}: Props) {
  const requiredDone = completedIds.length >= HYGIENE_ACTIONS.length

  const canAfford = (id: HygieneId) => {
    const action = HYGIENE_ACTIONS.find((item) => item.id === id)
    return Boolean(action && action.energyCost <= energyPct && action.waterCostL <= waterL)
  }

  const run = (
    id: HygieneCardId,
    energyCost: number,
    waterCostL: number,
    wellbeingGain: number,
    contaminationDrop: number,
    already: boolean,
  ) => {
    if (already) return
    if (energyCost > energyPct || waterCostL > waterL) return
    onCompleteOne(id, energyCost, waterCostL, wellbeingGain, contaminationDrop)
    soundEngine.success()
  }

  return (
    <Mission2Stage
      footer={
        <McButton
          className="min-h-12 min-w-[12rem] font-pixel text-lg font-bold disabled:opacity-40"
          disabled={!requiredDone}
          onClick={() => {
            soundEngine.harvest()
            onContinue()
          }}
        >
          Continuar
        </McButton>
      }
      title="Desafio 2.3 — Higiene pessoal"
      subtitle={
        <>
          Esfregue, lave e limpe a bancada para zerar a <SciTermM2 term="Contaminação" />. Risco agora:{' '}
          <strong className={contaminationRisk === 0 ? 'text-life' : 'text-danger'}>{contaminationRisk}%</strong>
        </>
      }
    >
      <div className="mx-auto h-3 w-full max-w-6xl overflow-hidden bg-void-950">
        <div
          className={`h-full ${contaminationRisk === 0 ? 'bg-life' : 'bg-danger'}`}
          style={{ width: `${contaminationRisk}%` }}
        />
      </div>

      <HygieneBay
        done={{
          teeth: completedIds.includes('teeth'),
          body: completedIds.includes('body'),
          sensors: completedIds.includes('sensors'),
        }}
        blocked={{
          teeth: !completedIds.includes('teeth') && !canAfford('teeth'),
          body: !completedIds.includes('body') && !canAfford('body'),
          sensors: !completedIds.includes('sensors') && !canAfford('sensors'),
        }}
        onDone={(id) => {
          const action = HYGIENE_ACTIONS.find((item) => item.id === id)
          if (!action) return
          run(action.id, action.energyCost, action.waterCostL, action.wellbeingGain, action.contaminationDrop, completedIds.includes(id))
        }}
      />

      {requiredDone ? (
        <div className="mx-auto w-full max-w-6xl border-2 border-cyan-hud/30 bg-[#0a1628]/92 p-3 md:max-w-md">
          <p className="font-pixel text-sm text-cyan-hud">{HYGIENE_BONUS_CARD.title}</p>
          <p className="mt-1 text-sm text-void-100">{HYGIENE_BONUS_CARD.detail}</p>
          <McButton
            className={`mt-3 min-h-12 w-full font-pixel text-base font-bold ${cabinDone ? 'mc-btn-green' : ''}`}
            disabled={cabinDone || HYGIENE_BONUS_CARD.waterCostL > waterL}
            onClick={() =>
              run(
                HYGIENE_BONUS_CARD.id,
                HYGIENE_BONUS_CARD.energyCost,
                HYGIENE_BONUS_CARD.waterCostL,
                HYGIENE_BONUS_CARD.wellbeingGain,
                0,
                cabinDone,
              )
            }
          >
            {cabinDone ? 'Cabine revisada' : 'Revisar cabine'}
          </McButton>
        </div>
      ) : null}

    </Mission2Stage>
  )
}
