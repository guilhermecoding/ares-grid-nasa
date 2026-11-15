import { memo, useEffect, useRef, useState } from 'react'
import { ARCADIA_MAP_SRC } from '../data/mapPois'
import { getMissionNode, MISSION_NODES, missionPathD } from '../data/missionNodes'
import { LOCK_SPRITE, ROVER_SPRITE } from '../data/tileSprites'
import type { WorldState } from '../types/game'

interface Props {
  state: WorldState
  onCellTap: (x: number, y: number) => void
}

function dayOverlay(hour: number): string {
  if (hour < 6 || hour >= 21) return 'rgba(7, 4, 15, 0.35)'
  if (hour < 8) return 'rgba(139, 92, 246, 0.06)'
  if (hour >= 18) return 'rgba(109, 40, 217, 0.1)'
  return 'transparent'
}

function MarsMapComponent({ state, onCellTap }: Props) {
  const storm = state.weather.intensity > 45
  const current = getMissionNode(state.level)
  const [hintId, setHintId] = useState<string | null>(null)
  const hintTimer = useRef(0)

  useEffect(() => {
    return () => window.clearTimeout(hintTimer.current)
  }, [])

  const showLockedHint = (id: string) => {
    setHintId(id)
    window.clearTimeout(hintTimer.current)
    hintTimer.current = window.setTimeout(() => setHintId(null), 2000)
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={ARCADIA_MAP_SRC}
        alt="Arcadia Planitia — mapa de missões"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-center select-none"
        style={{ imageRendering: 'pixelated' }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[1] transition-colors duration-700"
        style={{ background: dayOverlay(state.hour) }}
        aria-hidden
      />
      {storm && (
        <div
          className="pointer-events-none absolute inset-0 z-[1] animate-pulse"
          style={{ boxShadow: 'inset 0 0 48px rgba(255,107,138,0.35)' }}
          aria-hidden
        />
      )}

      {/* Soft guide along the painted bridges */}
      <svg
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full opacity-50"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={missionPathD()}
          fill="none"
          stroke="rgba(94, 231, 255, 0.35)"
          strokeWidth="0.6"
          strokeDasharray="1.8 1.6"
          strokeLinecap="round"
        />
      </svg>

      {/* Hotspots over painted islands — motifs are in the art */}
      {MISSION_NODES.map((node) => {
        const unlocked = state.level >= node.level
        const isCurrent = node.level === state.level
        const showHint = hintId === node.id

        return (
          <div
            key={node.id}
            className="absolute z-[3] -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${node.leftPct}%`, top: `${node.topPct}%` }}
          >
            <button
              type="button"
              aria-label={unlocked ? node.title : `${node.title} trancada`}
              onClick={() => {
                if (!unlocked) {
                  showLockedHint(node.id)
                  return
                }
                onCellTap(node.anchor.x, node.anchor.y)
              }}
              onPointerEnter={() => {
                if (!unlocked) showLockedHint(node.id)
              }}
              onFocus={() => {
                if (!unlocked) showLockedHint(node.id)
              }}
              className={`island-bob relative flex flex-col items-center outline-none ${isCurrent ? 'scale-105' : ''}`}
            >
              {!unlocked && (
                <span className="lock-float pointer-events-none absolute -top-6 z-10 flex size-8 items-center justify-center overflow-hidden rounded-full bg-black shadow-[0_2px_6px_rgba(0,0,0,0.85)] sm:-top-7 sm:size-9">
                  <img
                    src={LOCK_SPRITE}
                    alt=""
                    draggable={false}
                    className="h-full w-full scale-110 object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </span>
              )}

              <span
                className={`size-[min(20vw,6.25rem)] rounded-full border-2 transition ${
                  unlocked
                    ? isCurrent
                      ? 'border-cyan-hud bg-cyan-hud/10 shadow-[0_0_20px_rgba(94,231,255,0.4)]'
                      : 'border-cyan-hud/40 bg-transparent hover:border-cyan-hud/70 hover:bg-cyan-hud/5'
                    : 'border-transparent bg-transparent'
                }`}
              />

              <span
                className={`mt-1 max-w-[8rem] truncate rounded px-1.5 py-0.5 text-center font-pixel text-[9px] leading-tight sm:text-[10px] ${
                  unlocked ? 'bg-[#0a1628]/9 text-cyan-hud' : 'bg-void-950/85 text-void-300'
                }`}
              >
                {node.level}. {node.title}
              </span>
            </button>

            {showHint && !unlocked && (
              <div
                className="pointer-events-none absolute top-0 left-1/2 z-20 w-max max-w-[9rem] -translate-x-1/2 -translate-y-[calc(100%+0.4rem)] rounded border border-cyan-hud/40 bg-[#0a1628]/95 px-2 py-1 font-pixel text-[9px] leading-snug text-[#f4fff4] shadow-lg sm:text-[10px]"
                role="status"
              >
                {node.lockedHint}
              </div>
            )}
          </div>
        )
      })}

      <div
        className="pointer-events-none absolute z-[4] -translate-x-1/2 -translate-y-[95%] transition-[left,top] duration-300 ease-out"
        style={{ left: `${current.leftPct}%`, top: `${current.topPct}%` }}
      >
        <img
          src={ROVER_SPRITE}
          alt="Seu rover"
          draggable={false}
          className="rover-bob size-[min(14vw,72px)] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)]"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  )
}

export const MarsMap = memo(MarsMapComponent)
