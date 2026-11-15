export type TileType =
  | 'EMPTY'
  | 'SOLAR_PANEL'
  | 'HYDROPONIC_BAY'
  | 'SWIM_ICE_DRILL'
  | 'REGOLITH_PIT'
  | 'RADIATION_SHIELD'
  | 'HABITAT'

export type ToolId = 'walk' | 'clean' | 'drill' | 'harvest' | 'mine' | 'shield'

export type RoverCargo = 'none' | 'ice' | 'regolith'

export type WeatherKind = 'calm' | 'flare' | 'cme' | 'sep'

export type QuestKind = 'clean_panels' | 'drill_ice' | 'harvest' | 'deposit_shield' | 'survive_storms'

export interface GridTile {
  type: TileType
  dust: number
  growth: number
  cropId: string | null
  locked: boolean
}

export interface RoverState {
  x: number
  y: number
  cargo: RoverCargo
  sheltered: boolean
}

export interface BaseStats {
  /** Stamina — primary Stardew-like meter (0–100). */
  energy: number
  /** Soft habitat health / life support (0–100). */
  lifeSupport: number
  /** Soft radiation shield (0–100). */
  shield: number
}

export interface QuestProgress {
  kind: QuestKind
  current: number
  target: number
  label: string
}

export interface WeatherState {
  kind: WeatherKind
  label: string
  intensity: number
  eventLabel: string
  eventLink?: string
  sourceMode: 'live' | 'cached' | 'curated'
}

export interface WorldState {
  grid: GridTile[][]
  rover: RoverState
  stats: BaseStats
  sol: number
  hour: number
  level: number
  xp: number
  xpToNext: number
  unlockedTools: ToolId[]
  quest: QuestProgress
  weather: WeatherState
  message: string | null
  iceStored: number
  stormsSurvived: number
  justLeveledUp: boolean
  levelUpTitle: string | null
}

export type ScreenId = 'home' | 'world' | 'mission'

export const GRID_SIZE = 4
export const MAX_ENERGY = 100
export const MOVE_COST = 4
export const ACTION_COST = 8
export const NIGHT_HOUR = 20
export const WAKE_HOUR = 6
