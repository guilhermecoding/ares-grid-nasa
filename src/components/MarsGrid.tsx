import { memo } from 'react'
import { TILE_HINTS, TILE_LABELS } from '../data/arcadiaSiteData'
import { getCrop } from '../data/osdrCrops'
import {
  EMPTY_ROCK_SPRITE,
  GROUND_SPRITE,
  LOCK_SPRITE,
  ROVER_SPRITE,
  TILE_SPRITES,
} from '../data/tileSprites'
import type { WorldState } from '../types/game'
import { GRID_SIZE } from '../types/game'

interface Props {
  state: WorldState
  onCellTap: (x: number, y: number) => void
}

function dayOverlay(hour: number): string {
  if (hour < 6 || hour >= 21) return 'rgba(7, 4, 15, 0.45)'
  if (hour < 8) return 'rgba(139, 92, 246, 0.1)'
  if (hour >= 18) return 'rgba(109, 40, 217, 0.16)'
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
        className="relative overflow-hidden rounded-xl border-2 border-panel-edge shadow-[0_0_28px_rgba(78,161,255,0.15)]"
        style={{
          width: 'min(100cqw, 100cqh)',
          height: 'min(100cqw, 100cqh)',
          backgroundColor: '#8b4a2b',
          backgroundImage: `url(${GROUND_SPRITE})`,
          backgroundSize: '25% 25%',
          backgroundRepeat: 'repeat',
          imageRendering: 'pixelated',
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
            style={{ boxShadow: 'inset 0 0 28px rgba(255,107,138,0.45)' }}
            aria-hidden
          />
        )}

        <div
          className="relative z-[1] grid h-full w-full gap-0.5 p-1 sm:gap-1 sm:p-1.5"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
          role="grid"
          aria-label="Mapa de Arcadia Planitia"
        >
          {state.grid.map((row, y) =>
            row.map((tile, x) => {
              const isRover = state.rover.x === x && state.rover.y === y
              const sprite = TILE_SPRITES[tile.type]
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
                  className={`relative flex min-h-0 min-w-0 flex-col items-center justify-center overflow-hidden rounded-md border border-black/25 bg-black/10 transition active:scale-[0.97] ${
                    tile.locked ? 'saturate-50' : 'hover:border-cyan-hud/50'
                  }`}
                >
                  {/* Subtle cell tint so the continuous ground still reads as a grid */}
                  <span
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                      background:
                        (x + y) % 2 === 0 ? 'rgba(0,0,0,0.12)' : 'rgba(255,200,140,0.06)',
                    }}
                    aria-hidden
                  />

                  {sprite ? (
                    <img
                      src={sprite}
                      alt=""
                      draggable={false}
                      className={`relative z-[1] max-h-[72%] max-w-[78%] object-contain drop-shadow-[0_2px_0_rgba(0,0,0,0.45)] ${
                        tile.locked ? 'opacity-45' : ''
                      }`}
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <img
                      src={EMPTY_ROCK_SPRITE}
                      alt=""
                      draggable={false}
                      className="relative z-[1] max-h-[55%] max-w-[55%] object-contain opacity-80"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}

                  <span
                    className="relative z-[1] mt-0.5 max-w-full truncate rounded bg-void-950/55 px-0.5 text-[8px] font-bold text-void-100 sm:text-[9px]"
                  >
                    {tile.locked ? '???' : TILE_LABELS[tile.type]}
                  </span>

                  {badge && !tile.locked && (
                    <span className="absolute bottom-0.5 z-[2] rounded bg-void-950/70 px-0.5 text-[7px] font-bold text-void-100">
                      {badge}
                    </span>
                  )}

                  {tile.locked && (
                    <img
                      src={LOCK_SPRITE}
                      alt="Trancado"
                      draggable={false}
                      className="absolute z-[3] max-h-[42%] max-w-[42%] object-contain opacity-95"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}

                  {isRover && (
                    <img
                      src={ROVER_SPRITE}
                      alt="Seu rover"
                      draggable={false}
                      className="rover-bob pointer-events-none absolute z-[4] max-h-[78%] max-w-[78%] object-contain drop-shadow-[0_3px_4px_rgba(0,0,0,0.65)]"
                      style={{ imageRendering: 'pixelated' }}
                    />
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
