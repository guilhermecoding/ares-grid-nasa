import { memo } from 'react'
import { TILE_EMOJI, TILE_HINTS, TILE_LABELS } from '../data/arcadiaSiteData'
import { getCrop } from '../data/osdrCrops'
import type { WorldState } from '../types/game'
import { GRID_SIZE } from '../types/game'

interface Props {
  state: WorldState
  onCellTap: (x: number, y: number) => void
}

function dayOverlay(hour: number): string {
  if (hour < 6 || hour >= 21) return 'rgba(7, 4, 15, 0.5)'
  if (hour < 8) return 'rgba(139, 92, 246, 0.12)'
  if (hour >= 18) return 'rgba(109, 40, 217, 0.18)'
  return 'transparent'
}

function MarsGridComponent({ state, onCellTap }: Props) {
  const storm = state.weather.intensity > 45

  return (
    <div
      className="grid h-full w-full min-h-0 min-w-0 place-items-center"
      style={{ containerType: 'size' }}
    >
      <div
        className="relative overflow-hidden rounded-xl border-2 border-panel-edge bg-void-900/90"
        style={{
          width: 'min(100cqw, 100cqh)',
          height: 'min(100cqw, 100cqh)',
          backgroundImage:
            'radial-gradient(ellipse at 50% 0%, rgba(78,161,255,0.12), transparent 55%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-colors duration-700"
          style={{ background: dayOverlay(state.hour) }}
          aria-hidden
        />
        {storm && (
          <div
            className="pointer-events-none absolute inset-0 z-10 animate-pulse"
            style={{ boxShadow: 'inset 0 0 24px rgba(255,107,138,0.4)' }}
            aria-hidden
          />
        )}

        <div
          className="relative grid h-full w-full gap-1 p-1.5 sm:gap-1.5 sm:p-2"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
          role="grid"
          aria-label="Superfície de Arcadia Planitia"
        >
          {state.grid.map((row, y) =>
            row.map((tile, x) => {
              const isRover = state.rover.x === x && state.rover.y === y
              const crop = getCrop(tile.cropId)
              const badge =
                tile.type === 'SOLAR_PANEL'
                  ? `${Math.round(tile.dust)}%`
                  : tile.type === 'HYDROPONIC_BAY' && crop
                    ? `${Math.floor(tile.growth)}/${crop.growthTicks}`
                    : null

              return (
                <button
                  key={`${x}-${y}`}
                  type="button"
                  role="gridcell"
                  title={
                    tile.locked ? 'Trancado' : `${TILE_LABELS[tile.type]}: ${TILE_HINTS[tile.type]}`
                  }
                  onClick={() => onCellTap(x, y)}
                  className={`crater-tile relative flex min-h-0 min-w-0 flex-col items-center justify-center overflow-hidden rounded-md transition active:scale-95 ${
                    tile.locked ? 'opacity-55 grayscale-[0.4]' : ''
                  }`}
                >
                  {tile.locked ? (
                    <span className="text-base sm:text-xl" aria-label="Trancado">
                      🔒
                    </span>
                  ) : (
                    <span className="text-base sm:text-xl" aria-hidden>
                      {TILE_EMOJI[tile.type]}
                    </span>
                  )}
                  <span className="mt-0.5 max-w-full truncate px-0.5 text-[8px] font-bold text-void-100 sm:text-[9px]">
                    {tile.locked ? '???' : TILE_LABELS[tile.type]}
                  </span>
                  {badge && !tile.locked && (
                    <span className="absolute bottom-0.5 rounded bg-void-950/60 px-0.5 text-[7px] font-bold text-void-100">
                      {badge}
                    </span>
                  )}
                  {isRover && (
                    <span
                      className="rover-bob absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl"
                      aria-label="Seu robô"
                    >
                      🤖
                    </span>
                  )}
                </button>
              )
            }),
          )}
        </div>
      </div>
    </div>
  )
}

export const MarsGrid = memo(MarsGridComponent)
