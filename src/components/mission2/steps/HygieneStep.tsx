import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { ScrollHintArea } from '../../ScrollHintArea'
import { MEDIA } from '../../../constants/mediaAssets'
import { HYGIENE_ACTIONS, hygieneCosts, type HygieneId } from '../../../data/mission2Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { SciTermM2 } from '../SciTermM2'

interface Props {
  energyPct: number
  waterL: number
  contaminationRisk: number
  onConfirm: (done: HygieneId[]) => void
}

export function HygieneStep({ energyPct, waterL, contaminationRisk, onConfirm }: Props) {
  const [done, setDone] = useState<HygieneId[]>([])

  const costs = hygieneCosts(done)
  const risk = Math.max(0, contaminationRisk - costs.contaminationDrop)
  const allDone = done.length >= HYGIENE_ACTIONS.length
  const canAfford = costs.energy <= energyPct && costs.waterL <= waterL

  const toggle = (id: HygieneId) => {
    if (done.includes(id)) return
    soundEngine.telemetry()
    setDone((prev) => [...prev, id])
  }

  const waterUsed = useMemo(() => costs.waterL.toFixed(2), [costs.waterL])

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ touchAction: 'manipulation' }}>
      <div className="pointer-events-none h-[7.5rem] shrink-0 sm:h-32" />

      <ScrollHintArea className="min-h-0 flex-1 px-3 pb-2 sm:px-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start gap-3">
            <img src={MEDIA.mission2.hygiene} alt="" className="size-12 object-contain" draggable={false} />
            <div>
              <h2 className="font-pixel text-sm text-cyan-hud sm:text-base">Desafio 2.3 — Higiene</h2>
              <p className="mt-1 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
                Reduza o risco de <SciTermM2 term="Contaminação" /> no módulo fechado. Toque nas 3 ações.
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {HYGIENE_ACTIONS.map((action) => {
              const on = done.includes(action.id)
              return (
                <motion.button
                  key={action.id}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  disabled={on}
                  onClick={() => toggle(action.id)}
                  className={`flex min-h-14 w-full items-center gap-3 rounded-md border-2 px-3 py-3 text-left ${
                    on
                      ? 'border-[#1f8a52] bg-[#1f8a52]/20'
                      : 'border-cyan-hud/35 bg-[#0a1628]/85 hover:border-cyan-hud/70'
                  }`}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full border-2 font-pixel text-sm ${
                      on ? 'border-[#4ade80] bg-[#1f8a52] text-[#e8ffe8]' : 'border-cyan-hud/50 text-cyan-hud'
                    }`}
                    aria-hidden
                  >
                    {on ? '✓' : '○'}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-pixel text-xs text-[#f4fff4] sm:text-sm">{action.title}</span>
                    <span className="mt-0.5 block font-pixel text-[9px] text-void-300 sm:text-[10px]">{action.detail}</span>
                    <span className="mt-1 block font-pixel text-[9px] text-energy">
                      −{action.waterCostL}L · −{action.energyCost}% energia
                    </span>
                  </span>
                </motion.button>
              )
            })}
          </div>

          <div className="mt-4 rounded-md border border-cyan-hud/30 bg-[#0a1628]/8 p-3">
            <p className="font-pixel text-[10px] text-void-200">
              Água reciclável usada: <span className="text-cyan-hud">{waterUsed}L</span>
            </p>
            <p className="mt-2 font-pixel text-[10px] text-void-200">
              Risco de contaminação:{' '}
              <span className={risk === 0 ? 'text-[#4ade80]' : 'text-danger'}>{risk}%</span>
            </p>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-void-950">
              <motion.div
                className="h-full rounded-full bg-danger"
                animate={{ width: `${risk}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
          </div>
        </div>
      </ScrollHintArea>

      <div className="shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4">
        <McButton
          className="min-h-12 w-full font-pixel text-lg font-bold disabled:opacity-40"
          disabled={!allDone || !canAfford}
          onClick={() => onConfirm(done)}
        >
          Higiene concluída
        </McButton>
      </div>
    </div>
  )
}
