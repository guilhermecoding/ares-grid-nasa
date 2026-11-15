import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { ScrollHintArea } from '../../ScrollHintArea'
import { MEDIA } from '../../../constants/mediaAssets'
import {
  EXERCISES,
  exerciseCosts,
  type ExerciseId,
} from '../../../data/mission2Data'
import { McButton } from '../../../opening/McButton'
import { PixelDialogBox } from '../../../opening/PixelDialogBox'
import { soundEngine } from '../../../services/soundEngine'
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
  onConfirm: (ids: ExerciseId[]) => void
}

export function ExerciseStep({ energyPct, waterL, onConfirm }: Props) {
  const [selected, setSelected] = useState<ExerciseId[]>([])
  const [animating, setAnimating] = useState(false)
  const [capiOpen, setCapiOpen] = useState(false)

  const costs = exerciseCosts(selected)
  const canAfford =
    selected.length > 0 &&
    costs.energy <= energyPct &&
    costs.waterL <= waterL &&
    selected.length <= 2

  const toggle = (id: ExerciseId) => {
    soundEngine.click()
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return prev
      const next = [...prev, id]
      const c = exerciseCosts(next)
      if (c.energy > energyPct || c.waterL > waterL) return prev
      return next
    })
  }

  const confirm = () => {
    if (!canAfford) return
    soundEngine.step()
    setAnimating(true)
    window.setTimeout(() => {
      setAnimating(false)
      setCapiOpen(true)
    }, 1100)
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ touchAction: 'manipulation' }}>
      <div className="pointer-events-none h-[7.5rem] shrink-0 sm:h-32" />

      <ScrollHintArea className="min-h-0 flex-1 px-3 pb-2 sm:px-4">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-pixel text-sm text-cyan-hud sm:text-base">Desafio 2.1 — Exercícios</h2>
          <p className="mt-1 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
            Preserve músculos e ossos em baixa gravidade. Escolha 1 atividade ou combine até 2 (se couber energia/água).
            Termo: <SciTermM2 term="Microgravidade" />.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            {EXERCISES.map((ex) => {
              const on = selected.includes(ex.id)
              return (
                <motion.button
                  key={ex.id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggle(ex.id)}
                  className={`flex min-h-12 items-center gap-3 rounded-md border-2 px-3 py-3 text-left transition ${
                    on
                      ? 'border-cyan-hud bg-cyan-hud/15 shadow-[0_0_16px_rgba(94,231,255,0.25)]'
                      : 'border-cyan-hud/30 bg-[#0a1628]/85 hover:border-cyan-hud/60'
                  }`}
                >
                  <img
                    src={ICONS[ex.id]}
                    alt=""
                    className="size-12 shrink-0 object-contain"
                    draggable={false}
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.visibility = 'hidden'
                    }}
                  />
                  <span className="min-w-0">
                    <span className="block font-pixel text-xs text-[#f4fff4] sm:text-sm">{ex.title}</span>
                    <span className="mt-0.5 block font-pixel text-[9px] text-void-300 sm:text-[10px]">{ex.focus}</span>
                    <span className="mt-1 block font-pixel text-[9px] text-energy sm:text-[10px]">
                      −{ex.energyCost}% energia · −{ex.waterCostL}L água
                    </span>
                  </span>
                </motion.button>
              )
            })}
          </div>

          <p className="mt-3 font-pixel text-[10px] text-void-200">
            Selecionado: {selected.length}/2 · Custo: −{costs.energy}% energia, −{costs.waterL.toFixed(1)}L água
          </p>
        </div>
      </ScrollHintArea>

      <div className="shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4">
        <McButton
          className="min-h-12 w-full font-pixel text-lg font-bold disabled:opacity-40"
          disabled={!canAfford}
          onClick={confirm}
        >
          Confirmar exercício
        </McButton>
      </div>

      <AnimatePresence>
        {animating && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center bg-void-950/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="font-pixel text-sm text-cyan-hud sm:text-base"
              animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 0.9, repeat: 1 }}
            >
              Astronauta treinando…
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PixelDialogBox
        open={capiOpen}
        lines={['Muito bem! Vou registrar a atividade realizada.']}
        title="Capi"
        characterSrc={MEDIA.capi.excited2}
        characterAlt="Capi"
        onClosed={() => onConfirm(selected)}
        footer={
          <McButton className="min-h-12 px-6 font-pixel font-bold" onClick={() => setCapiOpen(false)}>
            Continuar
          </McButton>
        }
      />
    </div>
  )
}
