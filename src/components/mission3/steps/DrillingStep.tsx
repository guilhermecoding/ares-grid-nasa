import { motion } from 'framer-motion'
import { useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import { DRILL_DEPTHS_M, DRILL_ENERGY_COST } from '../../../data/mission3Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { SciTermM3 } from '../SciTermM3'

interface Props {
  energyPct: number
  onDepthChange: (progress: number) => void
  onSpend: (energy: number) => void
  onContinue: () => void
}

/** Challenge 3.3 — exploratory drills at fixed depths. */
export function DrillingStep({ energyPct, onDepthChange, onSpend, onContinue }: Props) {
  const [logged, setLogged] = useState<number[]>([])
  const [busy, setBusy] = useState(false)

  const nextIndex = logged.length
  const ready = logged.length >= DRILL_DEPTHS_M.length
  const nextDepth = DRILL_DEPTHS_M[nextIndex]
  const canDrill = !ready && !busy && nextDepth != null && energyPct >= DRILL_ENERGY_COST

  const drillNext = () => {
    if (!canDrill || nextDepth == null) return
    setBusy(true)
    soundEngine.step()
    onSpend(DRILL_ENERGY_COST)
    const targetProgress = (nextIndex + 1) / DRILL_DEPTHS_M.length
    onDepthChange(targetProgress)

    window.setTimeout(() => {
      setLogged((prev) => [...prev, nextDepth])
      soundEngine.success()
      setBusy(false)
    }, 900)
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ touchAction: 'manipulation' }}>
      <div className="pointer-events-none h-14 shrink-0 sm:h-16" />

      <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col overflow-y-auto px-3 pb-28 sm:px-4">
        <h2 className="font-pixel text-sm text-cyan-hud sm:text-base">Perfurações exploratórias</h2>
        <p className="mt-1 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
          Registre {DRILL_DEPTHS_M.length} profundidades no{' '}
          <SciTermM3 term="Subsolo">subsolo</SciTermM3>. Cada furo gasta {DRILL_ENERGY_COST}% de energia.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <img src={MEDIA.mission3.drill} alt="" className="size-14 object-contain" draggable={false} />
          <div className="min-w-0 flex-1 space-y-2">
            {DRILL_DEPTHS_M.map((d, i) => {
              const done = logged.includes(d)
              return (
                <div
                  key={d}
                  className={`flex min-h-12 items-center justify-between rounded border-2 px-3 font-pixel text-xs ${
                    done
                      ? 'border-[#1f8a52]/70 bg-[#0a1628]/9 text-[#5ecf9a]'
                      : i === nextIndex
                        ? 'border-cyan-hud/60 bg-[#0a1628]/95 text-cyan-hud'
                        : 'border-void-600/40 bg-[#0a1628]/5 text-void-400'
                  }`}
                >
                  <span>Ponto {i + 1}</span>
                  <span>{d.toFixed(1)} m {done ? '✓' : ''}</span>
                </div>
              )
            })}
          </div>
        </div>

        {!ready ? (
          <motion.button
            type="button"
            whileTap={canDrill ? { scale: 0.97 } : undefined}
            disabled={!canDrill}
            onClick={drillNext}
            className="mt-4 min-h-14 w-full rounded-lg border-2 border-cyan-hud bg-cyan-hud/20 font-pixel text-sm text-cyan-hud disabled:opacity-40"
            style={{ touchAction: 'manipulation' }}
          >
            {busy
              ? 'Perfurando…'
              : energyPct < DRILL_ENERGY_COST
                ? 'Energia insuficiente'
                : `Perfurar ${nextDepth?.toFixed(1)} m (−${DRILL_ENERGY_COST}% energia)`}
          </motion.button>
        ) : (
          <p className="mt-4 font-pixel text-xs text-[#5ecf9a]">
            Gelo encontrado! Pronto para coletar a amostra.
          </p>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex justify-end px-3 sm:px-4">
        <McButton
          className="min-h-12 min-w-[10rem] font-pixel text-lg font-bold disabled:opacity-40"
          disabled={!ready}
          onClick={() => {
            soundEngine.harvest()
            onContinue()
          }}
        >
          Coletar amostra
        </McButton>
      </div>
    </div>
  )
}
