import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { ScrollHintArea } from '../../ScrollHintArea'
import { MEDIA } from '../../../constants/mediaAssets'
import {
  FOOD_GROUPS,
  FOOD_ITEMS,
  WATER_RATION,
  foodCosts,
  nutritionBalance,
  type FoodGroupId,
} from '../../../data/mission2Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { SciTermM2 } from '../SciTermM2'

interface Props {
  energyPct: number
  waterL: number
  onConfirm: (foods: string[], waterRationL: number) => void
}

export function NutritionStep({ energyPct, waterL, onConfirm }: Props) {
  const [foods, setFoods] = useState<string[]>([])
  const [ration, setRation] = useState(2.2)

  const balance = nutritionBalance(foods)
  const costs = foodCosts(foods)
  const groupsPresent = useMemo(() => {
    const g = new Set<FoodGroupId>()
    for (const id of foods) {
      const item = FOOD_ITEMS.find((f) => f.id === id)
      if (item) g.add(item.group)
    }
    return g
  }, [foods])

  const waste = ration > WATER_RATION.wasteThresholdL
  const low = ration < WATER_RATION.idealMinL
  const canConfirm =
    foods.length >= 2 &&
    groupsPresent.size >= 2 &&
    costs.energy <= energyPct &&
    costs.waterL + ration <= waterL

  const toggleFood = (id: string) => {
    soundEngine.click()
    setFoods((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ touchAction: 'manipulation' }}>
      <div className="pointer-events-none h-[7.5rem] shrink-0 sm:h-32" />

      <ScrollHintArea className="min-h-0 flex-1 px-3 pb-2 sm:px-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start gap-3">
            <img src={MEDIA.mission2.tray} alt="" className="size-12 object-contain" draggable={false} />
            <div>
              <h2 className="font-pixel text-sm text-cyan-hud sm:text-base">Desafio 2.2 — Alimentação</h2>
              <p className="mt-1 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
                Monte uma refeição equilibrada e ajuste a água do dia. <SciTermM2 term="Metabolismo" /> e{' '}
                <SciTermM2 term="Hidratação" /> importam para o sono.
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1 flex justify-between font-pixel text-[9px] text-void-300">
              <span>Equilíbrio nutricional</span>
              <span className="text-[#f4fff4]">{balance}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-void-950">
              <motion.div
                className="h-full rounded-full bg-[#5ecf9a]"
                animate={{ width: `${balance}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              />
            </div>
            {groupsPresent.size < 3 && foods.length > 0 && (
              <p className="mt-1 font-pixel text-[9px] text-energy">
                Capi: falta variedade — inclua os 3 grupos (proteína, vegetais e frutas)!
              </p>
            )}
          </div>

          {(Object.keys(FOOD_GROUPS) as FoodGroupId[]).map((group) => (
            <div key={group} className="mt-3">
              <p className="font-pixel text-[10px] text-cyan-hud">{FOOD_GROUPS[group].label}</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {FOOD_ITEMS.filter((f) => f.group === group).map((f) => {
                  const on = foods.includes(f.id)
                  return (
                    <motion.button
                      key={f.id}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleFood(f.id)}
                      className={`min-h-12 min-w-[7.5rem] rounded-md border-2 px-3 py-2 font-pixel text-[10px] sm:text-xs ${
                        on
                          ? 'border-cyan-hud bg-cyan-hud/15 text-[#f4fff4]'
                          : 'border-void-500/50 bg-[#0a1628]/8 text-void-200'
                      }`}
                    >
                      {f.label}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="mt-4 rounded-md border border-cyan-hud/30 bg-[#0a1628]/8 p-3">
            <label className="flex items-center justify-between font-pixel text-[10px] text-void-200 sm:text-xs">
              <span>Cota de água do dia</span>
              <span className="text-cyan-hud tabular-nums">{ration.toFixed(1)}L</span>
            </label>
            <input
              type="range"
              min={WATER_RATION.minL}
              max={WATER_RATION.maxL}
              step={0.1}
              value={ration}
              onChange={(e) => setRation(Number(e.target.value))}
              className="mt-2 h-3 w-full accent-cyan-hud"
              aria-label="Cota de água"
            />
            <p className="mt-2 font-pixel text-[9px] leading-snug text-void-300 sm:text-[10px]">
              {low && 'Pouca água: hidratação e qualidade do sono caem.'}
              {waste && 'Água demais: desperdiça a reserva limitada da base.'}
              {!low && !waste && 'Faixa ideal para o corpo e para a base.'}
            </p>
          </div>
        </div>
      </ScrollHintArea>

      <div className="shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4">
        <McButton
          className="min-h-12 w-full font-pixel text-lg font-bold disabled:opacity-40"
          disabled={!canConfirm}
          onClick={() => {
            soundEngine.harvest()
            onConfirm(foods, ration)
          }}
        >
          Confirmar refeição
        </McButton>
      </div>
    </div>
  )
}
