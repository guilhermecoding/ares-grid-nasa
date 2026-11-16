import { motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { MISSION_BADGES } from '../data/missionBadges'
import { McButton } from '../opening/McButton'
import { loadProgress } from '../services/progressStore'
import { soundEngine } from '../services/soundEngine'
import type { BaseStats } from '../types/game'
import { ConfettiBurst } from './ConfettiBurst'
import { IndicatorIcon } from './IndicatorIcon'
import { INDICATOR_META, type IndicatorKind } from './indicatorIcons'
import { MissionMedal } from './MissionMedal'

interface Props {
  missionId: number
  /** Transmission lines typed one by one before the result shows. */
  lines: readonly string[]
  stats: BaseStats
  doneLabel?: string
  onDone: () => void
  /** Extra actions shown above the main button. */
  children?: ReactNode
}

const CARD_KEYS: readonly IndicatorKind[] = ['energy', 'water', 'wellbeing']

const pct = (value: number) => Math.round(Math.max(0, Math.min(100, value)))

/**
 * End screen shared by every mission: transmission lines, then confetti with
 * the base status (energy, water, health) and the five missions of the expedition.
 */
export function MissionOutro({ missionId, lines, stats, doneLabel = 'Voltar ao mapa', onDone, children }: Props) {
  const [idx, setIdx] = useState(0)
  const [level] = useState(() => loadProgress().level)
  const total = lines.length
  const done = idx >= total

  useEffect(() => {
    if (idx >= total) return
    soundEngine.telemetry()
    const id = window.setTimeout(() => setIdx((i) => i + 1), 1400)
    return () => clearTimeout(id)
  }, [idx, total])

  useEffect(() => {
    if (done) soundEngine.missionComplete()
  }, [done])

  const cleared = MISSION_BADGES.filter((badge) => level > badge.id || badge.id === missionId).length

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-void-950/80 p-3 sm:p-4">
      {done ? <ConfettiBurst /> : null}
      <div className="relative z-10 max-h-full w-full max-w-lg overflow-y-auto border-2 border-cyan-hud bg-[#0a1628] p-4 text-center sm:p-5">
        <p className="font-pixel text-xs tracking-widest text-cyan-hud uppercase">Transmissão</p>

        {done ? (
          <>
            <motion.p
              className="mt-2 font-pixel text-lg text-life sm:text-xl"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 16 }}
            >
              Missão {missionId} concluída!
            </motion.p>
            <p className="mt-2 font-pixel text-[10px] text-void-300 sm:text-xs">
              Status da base após a Missão {missionId}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
              {CARD_KEYS.map((kind, i) => {
                const meta = INDICATOR_META[kind]
                const shown = pct(stats[kind])
                return (
                  <motion.div
                    key={kind}
                    className="flex flex-col items-center justify-center rounded-md border-2 border-cyan-hud/45 bg-void-950/70 px-1.5 py-3 sm:min-h-28 sm:px-3 sm:py-4"
                    initial={{ opacity: 0, scale: 0.82, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.08 + i * 0.12 }}
                  >
                    <IndicatorIcon path={meta.path} color={meta.color} fill={shown / 100} className="size-10 sm:size-14" />
                    <p className="mt-2 font-pixel text-[10px] tracking-wide text-void-300 uppercase sm:text-xs">
                      {meta.label}
                    </p>
                    <p className="mt-1 font-pixel text-xl tabular-nums sm:text-3xl" style={{ color: meta.color }}>
                      {shown}
                      <span className="text-xs text-void-300 sm:text-base">%</span>
                    </p>
                  </motion.div>
                )
              })}
            </div>

            <p className="mt-4 font-pixel text-[10px] text-void-300 sm:text-xs">
              Missões da expedição · {cleared} de {MISSION_BADGES.length}
            </p>
            <ul className="mt-2 grid grid-cols-5 gap-1 sm:gap-2" aria-label="Missões da expedição">
              {MISSION_BADGES.map((badge, i) => {
                const earned = level > badge.id || badge.id === missionId
                const current = badge.id === missionId
                return (
                  <motion.li
                    key={badge.id}
                    className={`flex flex-col items-center gap-1 rounded-md border px-0.5 py-2 ${
                      current ? 'border-life/70 bg-life/10' : 'border-transparent'
                    }`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={current ? { opacity: 1, y: 0, scale: [1, 1.18, 1] } : { opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + i * 0.09, duration: current ? 0.6 : 0.3 }}
                    aria-label={`Missão ${badge.id}, ${badge.title}: ${earned ? 'concluída' : 'bloqueada'}`}
                  >
                    <MissionMedal badge={badge} earned={earned} sizeClass="size-10 sm:size-12" iconClass="size-5 sm:size-6" />
                    <span className={`font-pixel text-[10px] ${earned ? 'text-[#f4fff4]' : 'text-void-400'}`}>
                      M{badge.id}
                    </span>
                    <span
                      className={`hidden font-body text-[11px] leading-tight sm:block ${
                        earned ? 'text-void-200' : 'text-void-400'
                      }`}
                    >
                      {badge.title}
                    </span>
                  </motion.li>
                )
              })}
            </ul>

            {children}

            <McButton
              className="mt-5 min-h-12 w-full px-3 font-pixel text-lg font-bold"
              style={{ touchAction: 'manipulation' }}
              onClick={onDone}
            >
              {doneLabel}
            </McButton>
          </>
        ) : (
          <div className="mt-4 space-y-2 font-pixel text-sm text-[#f4fff4] sm:text-base" aria-live="polite">
            {lines.slice(0, idx + 1).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
