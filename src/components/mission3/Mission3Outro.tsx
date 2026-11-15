import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ConfettiBurst } from '../ConfettiBurst'
import { IndicatorIcon } from '../IndicatorIcon'
import { INDICATOR_META, type IndicatorKind } from '../indicatorIcons'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'
import type { BaseStats } from '../../types/game'
import { WATER_REWARD_L } from '../../data/mission3Data'

interface Props {
  stats: BaseStats
  onDone: () => void
}

const TRANSMISSION_LINES_M3 = [
  'DADOS DA MISSÃO 3 ARMAZENADOS.',
  'TENTANDO CONEXÃO COM A CENTRAL TERRESTRE…',
  `Gelo processado · +${WATER_REWARD_L}L de água potável!`,
] as const

const CARD_KEYS: IndicatorKind[] = ['energy', 'water', 'wellbeing']

function valueFor(kind: IndicatorKind, stats: BaseStats): number {
  if (kind === 'energy') return stats.energy
  if (kind === 'water') return stats.water
  return stats.wellbeing
}

/** Transmission + animated base indicator cards. */
export function Mission3Outro({ stats, onDone }: Props) {
  const [idx, setIdx] = useState(0)
  const done = idx >= TRANSMISSION_LINES_M3.length - 1

  useEffect(() => {
    if (idx >= TRANSMISSION_LINES_M3.length - 1) return
    soundEngine.telemetry()
    const id = window.setTimeout(() => setIdx((i) => i + 1), 1400)
    return () => clearTimeout(id)
  }, [idx])

  useEffect(() => {
    if (!done) return
    soundEngine.missionComplete()
  }, [done])

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-void-950/80 p-4">
      {done ? <ConfettiBurst /> : null}
      <div className="relative z-10 w-full max-w-lg border-2 border-cyan-hud bg-[#0a1628] p-5 text-center">
        <p className="font-pixel text-xs tracking-widest text-cyan-hud uppercase">Transmissão</p>

        {!done && (
          <div className="mt-4 space-y-2 font-pixel text-sm text-[#f4fff4] sm:text-base">
            {TRANSMISSION_LINES_M3.slice(0, idx + 1).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}

        {done && (
          <>
            <p className="mt-3 font-pixel text-[10px] text-void-300 sm:text-xs">
              Status da base após a Missão 3
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {CARD_KEYS.map((kind, i) => {
                const meta = INDICATOR_META[kind]
                const shown = Math.round(Math.max(0, Math.min(100, valueFor(kind, stats))))
                return (
                  <motion.div
                    key={kind}
                    className="flex min-h-28 flex-col items-center justify-center rounded-md border-2 border-cyan-hud/45 bg-void-950/70 px-3 py-4"
                    initial={{ opacity: 0, scale: 0.82, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 20,
                      delay: 0.08 + i * 0.12,
                    }}
                  >
                    <IndicatorIcon
                      path={meta.path}
                      color={meta.color}
                      fill={shown / 100}
                      className="size-12 sm:size-14"
                    />
                    <p className="mt-2 font-pixel text-[10px] tracking-wide text-void-300 uppercase sm:text-xs">
                      {meta.label}
                    </p>
                    <p
                      className="mt-1 font-pixel text-2xl tabular-nums sm:text-3xl"
                      style={{ color: meta.color }}
                    >
                      {shown}
                      <span className="text-base text-void-300">%</span>
                    </p>
                  </motion.div>
                )
              })}
            </div>
            <McButton
              className="mt-6 min-h-12 w-full font-pixel text-lg font-bold"
              style={{ touchAction: 'manipulation' }}
              onClick={onDone}
            >
              Continuar
            </McButton>
          </>
        )}
      </div>
    </div>
  )
}
