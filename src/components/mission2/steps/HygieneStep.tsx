import { MEDIA } from '../../../constants/mediaAssets'
import {
  HYGIENE_ACTIONS,
  HYGIENE_BONUS_CARD,
  type HygieneId,
} from '../../../data/mission2Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { Mission2Stage } from '../Mission2Stage'
import { SciTermM2 } from '../SciTermM2'

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
          Toque em cada ação para reduzir a <SciTermM2 term="Contaminação" />. Risco agora:{' '}
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

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-3 md:grid-cols-3">
        {HYGIENE_ACTIONS.map((action) => {
          const done = completedIds.includes(action.id)
          const blocked = !done && (action.energyCost > energyPct || action.waterCostL > waterL)
          return (
            <div
              key={action.id}
              className={`flex flex-col border-2 bg-[#0a1628]/92 p-3 shadow-[0_8px_20px_rgba(0,0,0,0.35)] md:p-4 ${
                done ? 'border-life' : 'border-cyan-hud/30'
              } ${blocked ? 'opacity-50' : ''}`}
            >
              <img src={MEDIA.mission2.hygiene} alt="" className="size-14 object-contain" draggable={false} />
              <p className="mt-2 font-pixel text-sm text-cyan-hud md:text-base">{action.title}</p>
              <p className="mt-1 flex-1 text-sm leading-snug text-void-100">{action.detail}</p>
              <p className="mt-2 text-sm text-energy">
                −{action.waterCostL} L água
                {action.energyCost > 0 ? ` · −${action.energyCost}% energia` : ''}
              </p>
              <McButton
                className={`mt-3 min-h-12 w-full font-pixel text-base font-bold ${done ? 'mc-btn-green' : ''}`}
                disabled={done || blocked}
                aria-label={done ? `${action.title} feito` : action.title}
                onClick={() =>
                  run(action.id, action.energyCost, action.waterCostL, action.wellbeingGain, action.contaminationDrop, done)
                }
              >
                {done ? 'Feito' : 'Fazer'}
              </McButton>
            </div>
          )
        })}
      </div>

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
