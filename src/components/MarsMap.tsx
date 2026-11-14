import { memo } from 'react'
import { TILE_HINTS, TILE_LABELS } from '../data/arcadiaSiteData'
import { allPois, ARCADIA_MAP_SRC, getPoi } from '../data/mapPois'
import { LOCK_SPRITE, ROVER_SPRITE } from '../data/tileSprites'
import type { WorldState } from '../types/game'

interface Props {
  state: WorldState
  onCellTap: (x: number, y: number) => void
}

function dayOverlay(hour: number): string {
  if (hour < 6 || hour >= 21) return 'rgba(7, 4, 15, 0.4)'
  if (hour < 8) return 'rgba(139, 92, 246, 0.08)'
  if (hour >= 18) return 'rgba(109, 40, 217, 0.14)'
  return 'transparent'
}

function MarsMapComponent({ state, onCellTap }: Props) {
  const storm = state.weather.intensity > 45
  const roverPoi = getPoi(state.rover.x, state.rover.y)
  const pois = allPois()

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={ARCADIA_MAP_SRC}
        alt="Arcadia Planitia — mapa da base"
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

      {/* Invisible / subtle hotspots — no square grid */}
      {pois.map((poi) => {
        const tile = state.grid[poi.y]![poi.x]!
        const label = TILE_LABELS[tile.type]
        return (
          <button
            key={`${poi.x}-${poi.y}`}
            type="button"
            title={tile.locked ? 'Trancado' : `${label}: ${TILE_HINTS[tile.type]}`}
            aria-label={tile.locked ? `${label} trancado` : label}
            onClick={() => onCellTap(poi.x, poi.y)}
            className="absolute z-[2] flex size-[min(14vw,72px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-transparent bg-transparent transition hover:border-cyan-hud/35 hover:bg-cyan-hud/10 focus-visible:border-star focus-visible:bg-star/15"
            style={{ left: `${poi.leftPct}%`, top: `${poi.topPct}%` }}
          >
            {tile.locked && (
              <img
                src={LOCK_SPRITE}
                alt=""
                draggable={false}
                className="max-h-[55%] max-w-[55%] object-contain opacity-90"
                style={{ imageRendering: 'pixelated' }}
              />
            )}
          </button>
        )
      })}

      {/* Rover — slides between POIs */}
      <img
        src={ROVER_SPRITE}
        alt="Seu rover"
        draggable={false}
        className="rover-bob pointer-events-none absolute z-[3] size-[min(16vw,88px)] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)] transition-[left,top] duration-200 ease-out"
        style={{
          left: `${roverPoi.leftPct}%`,
          top: `${roverPoi.topPct}%`,
          imageRendering: 'pixelated',
        }}
      />
    </div>
  )
}

export const MarsMap = memo(MarsMapComponent)
