import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import {
  POTABILITY_INDICATORS,
  RETREAT_ENERGY_COST,
  WATER_REWARD_L,
  type PotabilityId,
} from '../../../data/mission3Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { CapiBridgeM3 } from '../CapiBridgeM3'
import { SciTermM3 } from '../SciTermM3'

interface Props {
  energyPct: number
  onSpend: (energy: number) => void
  onAddWater: (liters: number) => void
  onContinue: () => void
}

type PassMap = Record<PotabilityId, boolean>

function initialPass(): PassMap {
  const map = {} as PassMap
  for (const ind of POTABILITY_INDICATORS) {
    map[ind.id] = !ind.failsInitially
  }
  return map
}

/** Challenge 3.6 — potability panel with one initial fail + re-treatment. */
export function PotabilityStep({ energyPct, onSpend, onAddWater, onContinue }: Props) {
  const [pass, setPass] = useState<PassMap>(initialPass)
  const [rewarded, setRewarded] = useState(false)
  const [bridge, setBridge] = useState<string[] | null>(null)

  const allGreen = useMemo(
    () => POTABILITY_INDICATORS.every((ind) => pass[ind.id]),
    [pass],
  )

  const failCount = POTABILITY_INDICATORS.filter((ind) => !pass[ind.id]).length

  const retreat = () => {
    if (allGreen) return
    if (energyPct < RETREAT_ENERGY_COST) {
      soundEngine.fail()
      setBridge(['Energia insuficiente.', `O novo tratamento precisa de ${RETREAT_ENERGY_COST}%.`])
      return
    }
    soundEngine.step()
    onSpend(RETREAT_ENERGY_COST)
    setPass((prev) => {
      const next = { ...prev }
      for (const ind of POTABILITY_INDICATORS) {
        next[ind.id] = true
      }
      return next
    })
    soundEngine.success()
    setBridge([
      'Novo tratamento concluído!',
      'A condutividade e os sais voltaram ao nível seguro.',
    ])
  }

  const claimAndContinue = () => {
    if (!allGreen) return
    if (!rewarded) {
      onAddWater(WATER_REWARD_L)
      setRewarded(true)
      soundEngine.harvest()
    }
    onContinue()
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ touchAction: 'manipulation' }}>
      <div className="pointer-events-none h-14 shrink-0 sm:h-16" />

      <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col overflow-y-auto px-3 pb-28 sm:px-4">
        <h2 className="font-pixel text-sm text-cyan-hud sm:text-base">
          Teste de <SciTermM3 term="Potabilidade">potabilidade</SciTermM3>
        </h2>
        <p className="mt-1 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
          Seis indicadores. Se algum falhar, rode um novo tratamento (−{RETREAT_ENERGY_COST}% energia).
          Ao aprovar: +{WATER_REWARD_L}L de água na base.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {POTABILITY_INDICATORS.map((ind) => {
            const ok = pass[ind.id]
            return (
              <div
                key={ind.id}
                className={`flex min-h-14 flex-col justify-center rounded-lg border-2 px-3 py-2 ${
                  ok ? 'border-[#1f8a52]/80 bg-[#0a1628]/9' : 'border-danger/70 bg-[#0a1628]/95'
                }`}
              >
                <span className="font-pixel text-[10px] text-void-300 sm:text-xs">{ind.label}</span>
                <span
                  className={`mt-1 font-pixel text-sm ${ok ? 'text-[#5ecf9a]' : 'text-danger'}`}
                >
                  {ok ? '● OK' : '● FALHA'}
                </span>
                {ind.id === 'conductivity' ? (
                  <span className="mt-0.5 font-pixel text-[9px] text-void-400">
                    <SciTermM3 term="Condutividade Elétrica">Condutividade</SciTermM3>
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>

        {!allGreen ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={retreat}
            className="mt-4 min-h-14 w-full rounded-lg border-2 border-[#f0b429] bg-[#f0b429]/15 font-pixel text-sm text-[#f0b429]"
            style={{ touchAction: 'manipulation' }}
          >
            Novo tratamento (−{RETREAT_ENERGY_COST}% energia) · {failCount} falha(s)
          </motion.button>
        ) : (
          <p className="mt-4 font-pixel text-xs text-[#5ecf9a]">
            Água aprovada! +{WATER_REWARD_L}L serão adicionados ao tanque da base.
          </p>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex justify-end px-3 sm:px-4">
        <McButton
          className="min-h-12 min-w-[10rem] font-pixel text-lg font-bold disabled:opacity-40"
          disabled={!allGreen}
          onClick={claimAndContinue}
        >
          Registrar no diário
        </McButton>
      </div>

      {bridge ? <CapiBridgeM3 lines={bridge} onDone={() => setBridge(null)} /> : null}
    </div>
  )
}
