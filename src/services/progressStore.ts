import type { BackpackId, HelmetId, InsigniaId, SuitColorId } from '../data/openingData'
import type { ToolId } from '../types/game'

const STORAGE_KEY = 'aresgrid-progress-v2'

export interface PlayerProgress {
  version: 2
  playerName: string
  tutorialDone: boolean
  controlsHintSeen: boolean
  level: number
  xp: number
  solsPlayed: number
  unlockedTools: ToolId[]
  muted: boolean
  openingCompleted: boolean
  suitColor: SuitColorId
  helmet: HelmetId
  backpack: BackpackId
  insignia: InsigniaId
}

const DEFAULT_PROGRESS: PlayerProgress = {
  version: 2,
  playerName: 'Robô Jr.',
  tutorialDone: false,
  controlsHintSeen: false,
  level: 1,
  xp: 0,
  solsPlayed: 0,
  unlockedTools: ['walk', 'clean'],
  muted: true,
  openingCompleted: false,
  suitColor: 'nasa-white',
  helmet: 'classic',
  backpack: 'standard',
  insignia: 'ares',
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage
}

export function loadProgress(): PlayerProgress {
  if (!canUseStorage()) return { ...DEFAULT_PROGRESS }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PROGRESS }
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>
    if (parsed.version !== 2) return { ...DEFAULT_PROGRESS }
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      unlockedTools: parsed.unlockedTools ?? DEFAULT_PROGRESS.unlockedTools,
    }
  } catch {
    return { ...DEFAULT_PROGRESS }
  }
}

export function saveProgress(progress: PlayerProgress): void {
  if (!canUseStorage()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function updateProgress(patch: Partial<PlayerProgress>): PlayerProgress {
  const next = { ...loadProgress(), ...patch, version: 2 as const }
  saveProgress(next)
  return next
}
