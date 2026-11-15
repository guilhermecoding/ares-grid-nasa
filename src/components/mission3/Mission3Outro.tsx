import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ConfettiBurst } from '../ConfettiBurst'
import { IndicatorIcon } from '../IndicatorIcon'
import { INDICATOR_META } from '../indicatorIcons'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'
import type { BaseStats } from '../../types/game'
import { MISSION3_META, WATER_REWARD_L } from '../../data/mission3Data'

interface Props {
  stats: BaseStats
  waterL: number
  onDone: () => void
}

const LINES = [
  'Retornando à espaçonave com a amostra selada…',
  'Dados da Missão 3 armazenados no servidor de bordo.',
  'Tentando transmissão para a central na Terra…',
  `Transmissão enviada! Gelo de Arcadia virou +${WATER_REWARD_L} L de água potável.`,
] as const

/** Ship return, onboard storage, Earth transmission, base status. */
export function Mission3Outro({ stats, waterL, onDone }: Props) {
  const [idx, setIdx] = useState(0)
  const done = idx >= LINES.length - 1

  useEffect(() => {
    if (done) return
    soundEngine.telemetry()
    const id = window.setTimeout(() => setIdx((i) => i + 1), 1400)
    return () => clearTimeout(id)
  }, [idx, done])

  useEffect(() => {
    if (done) soundEngine.missionComplete()
  }, [done])

  const cards = [
    { kind: 'energy' as const, value: `${Math.round(stats.energy)}`, unit: '%', fill: stats.energy / 100 },
    { kind: 'water' as const, value: `${Math.round(waterL)}`, unit: 'L', fill: stats.water / 100 },
    { kind: 'wellbeing' as const, value: `${Math.round(stats.wellbeing)}`, unit: '%', fill: stats.wellbeing / 100 },
  ]

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-void-950/80 p-4">
      {done ? <ConfettiBurst /> : null}
      <div className="relative z-10 w-full max-w-lg border-2 border-cyan-hud bg-[#0a1628] p-5 text-center">
        <p className="font-pixel text-xs tracking-widest text-cyan-hud uppercase">Retorno à nave</p>

        <div className="relative mx-auto mt-3 h-24 w-full overflow-hidden border border-cyan-hud/25 bg-gradient-to-b from-[#c47848] to-[#6b4228]" aria-hidden>
          <motion.svg
            viewBox="0 0 60 40"
            className="absolute bottom-2 h-16 w-24"
            initial={{ left: '-30%' }}
            animate={{ left: '60%' }}
            transition={{ duration: 2.4, ease: 'easeOut' }}
          >
            <rect x="8" y="14" width="34" height="16" fill="#cbd5e1" stroke="#1a2030" strokeWidth="2" />
            <rect x="42" y="18" width="12" height="12" fill="#94a3b8" stroke="#1a2030" strokeWidth="2" />
            <rect x="46" y="20" width="5" height="4" fill="#5ee7ff" />
            <circle cx="16" cy="33" r="5" fill="#1a2030" />
            <circle cx="36" cy="33" r="5" fill="#1a2030" />
            <rect x="14" y="8" width="8" height="6" fill="#5ee7ff" stroke="#1a2030" strokeWidth="1.5" />
          </motion.svg>
          <svg viewBox="0 0 40 60" className="absolute right-3 bottom-0 h-20 w-14">
            <polygon points="20,2 34,40 6,40" fill="#e2e8f0" stroke="#1a2030" strokeWidth="2" />
            <rect x="10" y="40" width="20" height="14" fill="#94a3b8" stroke="#1a2030" strokeWidth="2" />
            <circle cx="20" cy="24" r="5" fill="#5ee7ff" stroke="#1a2030" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="mt-4 space-y-2 text-left font-pixel text-xs text-[#f4fff4] sm:text-sm" aria-live="polite">
          {LINES.slice(0, idx + 1).map((line, i) => (
            <motion.p key={line} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
              <span className={i < idx || done ? 'text-life' : 'text-energy'}>{i < idx || done ? '✓ ' : '› '}</span>
              {line}
            </motion.p>
          ))}
        </div>

        {done ? (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {cards.map((c, i) => {
                const meta = INDICATOR_META[c.kind]
                return (
                  <motion.div
                    key={c.kind}
                    className="flex flex-col items-center rounded-md border-2 border-cyan-hud/45 bg-void-950/70 px-2 py-3"
                    initial={{ opacity: 0, scale: 0.82, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.08 + i * 0.12 }}
                  >
                    <IndicatorIcon path={meta.path} color={meta.color} fill={Math.max(0, Math.min(1, c.fill))} className="size-10" />
                    <p className="mt-1 font-pixel text-[9px] text-void-300 uppercase">{meta.label}</p>
                    <p className="font-pixel text-xl tabular-nums" style={{ color: meta.color }}>
                      {c.value}
                      <span className="text-xs text-void-300">{c.unit}</span>
                    </p>
                  </motion.div>
                )
              })}
            </div>
            <McButton className="mc-btn-green mt-5 min-h-14 w-full px-3 font-pixel text-sm sm:text-base" onClick={onDone}>
              {MISSION3_META.nextMission}
            </McButton>
          </>
        ) : null}
      </div>
    </div>
  )
}
