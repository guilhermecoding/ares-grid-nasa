import { tileUnlockLevel } from './levels'
import type { GridTile, TileType } from '../types/game'
import { GRID_SIZE } from '../types/game'

/** Arcadia Planitia AP-1 site flavor from NASA SWIM / HiRISE / MOLA context. */
export const ARCADIA_SITE = {
  name: 'Arcadia Planitia',
  sector: 'AP-1',
  latitude: 39.0,
  longitude: -170.0,
  elevationKm: -3.9,
  iceDepthM: 0.3,
  swimNote:
    'Dados NASA SWIM (SHARAD / THEMIS) indicam gelo de água raso sob a planície — ideal para ISRU.',
  hiriseNote:
    'Imagens HiRISE mostram terreno plano e baixo risco de rochas grandes para pouso tripulado.',
  attribution: {
    swim: 'https://swim.psi.edu/',
    marsTrek: 'https://trek.nasa.gov/mars/',
    donki: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
    osdr: 'https://osdr.nasa.gov/bio/',
  },
} as const

const LAYOUT: TileType[][] = [
  ['HABITAT', 'SOLAR_PANEL', 'EMPTY', 'SOLAR_PANEL'],
  ['EMPTY', 'HYDROPONIC_BAY', 'SWIM_ICE_DRILL', 'EMPTY'],
  ['REGOLITH_PIT', 'EMPTY', 'EMPTY', 'RADIATION_SHIELD'],
  ['EMPTY', 'SOLAR_PANEL', 'HYDROPONIC_BAY', 'EMPTY'],
]

export function createArcadiaGrid(playerLevel: number): GridTile[][] {
  return Array.from({ length: GRID_SIZE }, (_, y) =>
    Array.from({ length: GRID_SIZE }, (_, x) => {
      const type = LAYOUT[y]?.[x] ?? 'EMPTY'
      const unlockAt = tileUnlockLevel(type)
      return {
        type,
        dust: type === 'SOLAR_PANEL' ? 25 + ((x + y) % 3) * 12 : 0,
        growth: type === 'HYDROPONIC_BAY' ? 2 : 0,
        cropId: type === 'HYDROPONIC_BAY' ? (x % 2 === 0 ? 'radish' : 'spirulina') : null,
        locked: playerLevel < unlockAt,
      }
    }),
  )
}

export function refreshLocks(grid: GridTile[][], playerLevel: number): GridTile[][] {
  return grid.map((row) =>
    row.map((tile) => ({
      ...tile,
      locked: playerLevel < tileUnlockLevel(tile.type),
    })),
  )
}

export const TILE_LABELS: Record<TileType, string> = {
  EMPTY: 'Planície',
  SOLAR_PANEL: 'Painel Solar',
  HYDROPONIC_BAY: 'Estufa',
  SWIM_ICE_DRILL: 'Gelo SWIM',
  REGOLITH_PIT: 'Regolito',
  RADIATION_SHIELD: 'Cúpula',
  HABITAT: 'Casinha',
}

export const TILE_HINTS: Record<TileType, string> = {
  EMPTY: 'Poeira e crateras pequenas de Arcadia Planitia.',
  SOLAR_PANEL: 'Limpe a poeira vermelha para a base ter luz!',
  HYDROPONIC_BAY: 'Plantinhas da NASA OSDR. Colha quando crescerem.',
  SWIM_ICE_DRILL: 'Gelo escondido sob o solo — água e ar para a base!',
  REGOLITH_PIT: 'Terra de Marte para reforçar o abrigo.',
  RADIATION_SHIELD: 'Traga regolito aqui para proteger da tempestade solar.',
  HABITAT: 'Sua casinha. Durma aqui para o próximo Sol.',
}
