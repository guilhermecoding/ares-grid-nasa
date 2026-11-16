import { GRID_SIZE } from '../types/game'

export interface MapPoi {
  x: number
  y: number
  /** CSS left % — clustered toward map center for playable focus */
  leftPct: number
  /** CSS top % */
  topPct: number
}

/**
 * Logical 4x4 cells mapped onto the unique Arcadia crater map.
 * Positions sit roughly in the 22–78% band (center action area).
 *
 * LAYOUT reminder:
 * [HABITAT, SOLAR, EMPTY, SOLAR]
 * [EMPTY, HYDRO, ICE, EMPTY]
 * [REGOLITH, EMPTY, EMPTY, SHIELD]
 * [EMPTY, SOLAR, HYDRO, EMPTY]
 */
const POI_GRID: { leftPct: number; topPct: number }[][] = [
  [
    { leftPct: 42, topPct: 40 }, // habitat dome
    { leftPct: 56, topPct: 44 }, // solar near dome
    { leftPct: 48, topPct: 28 }, // north path
    { leftPct: 68, topPct: 46 }, // right solar arrays
  ],
  [
    { leftPct: 30, topPct: 48 }, // west plain
    { leftPct: 26, topPct: 40 }, // greenhouse modules
    { leftPct: 54, topPct: 56 }, // ice / mid crater rim
    { leftPct: 76, topPct: 38 }, // far east ridge
  ],
  [
    { leftPct: 28, topPct: 68 }, // regolith / lower crater
    { leftPct: 44, topPct: 60 }, // central path
    { leftPct: 58, topPct: 68 }, // south-central plain
    { leftPct: 74, topPct: 62 }, // shield / east platform
  ],
  [
    { leftPct: 36, topPct: 78 }, // south-west plain
    { leftPct: 50, topPct: 76 }, // south solar-ish
    { leftPct: 62, topPct: 78 }, // south greenhouse
    { leftPct: 78, topPct: 74 }, // south-east edge
  ],
]

export function getPoi(x: number, y: number): MapPoi {
  const cell = POI_GRID[y]?.[x] ?? { leftPct: 50, topPct: 50 }
  return { x, y, ...cell }
}

export function allPois(): MapPoi[] {
  const list: MapPoi[] = []
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      list.push(getPoi(x, y))
    }
  }
  return list
}

export const ARCADIA_MAP_SRC = '/art/maps/arcadia-map.jpg'
