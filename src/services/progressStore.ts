import type { PanelTestChoice, SeasonId, SiteId } from '../data/mission1Data'
import type { BackpackId, HelmetId, InsigniaId, SuitColorId } from '../data/openingData'
import type { BaseStats, ToolId } from '../types/game'

const STORAGE_KEY = 'aresgrid-progress-v2'

/** Default base meters before Mission 01 installs solar power. */
export const DEFAULT_BASE_STATS: BaseStats = {
  energy: 0,
  water: 85,
  wellbeing: 70,
}

/** Saved Missão 01 panel setup — restored when replaying. */
export interface Mission1PanelSave {
  site: SiteId
  season: SeasonId
  tilt: number
  azimuth: number
  efficiency: number
  /** clean = limpeza, dust = envelhecimento com poeira. Legacy saves used save/max. */
  panelTest: PanelTestChoice | null
  /** Epoch ms of first successful panel install (starts clean cooldown). */
  firstInstalledAt: number
  /** Epoch ms of last panel clean; null if never cleaned. */
  lastCleanedAt: number | null
}

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
  /** Persistent base meters (energy from M01 panels, spent in later missions). */
  baseStats: BaseStats
  /** Last confirmed solar panel configuration (Missão 01). */
  mission1Panel: Mission1PanelSave | null
  /** Dialog ids the player has already finished, across every mission. */
  seenDialogIds: string[]
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
  baseStats: { ...DEFAULT_BASE_STATS },
  mission1Panel: null,
  seenDialogIds: [],
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
    const baseStats = {
      ...DEFAULT_BASE_STATS,
      ...(parsed.baseStats ?? {}),
    }
    // Legacy saves after M01 with no baseStats: seed energy once panels exist.
    if (!parsed.baseStats && (parsed.level ?? 1) >= 2 && baseStats.energy === 0) {
      baseStats.energy = 70
    }
    const parsedPanel = parseMission1Panel(parsed.mission1Panel)
    const mission1Panel = parsedPanel?.panel ?? null
    const seenDialogIds = Array.isArray(parsed.seenDialogIds)
      ? parsed.seenDialogIds.filter((id): id is string => typeof id === 'string')
      : []
    const progress: PlayerProgress = {
      ...DEFAULT_PROGRESS,
      ...parsed,
      unlockedTools: parsed.unlockedTools ?? DEFAULT_PROGRESS.unlockedTools,
      baseStats,
      mission1Panel,
      seenDialogIds,
    }
    // Persist firstInstalledAt once for legacy panel saves.
    if (parsedPanel?.migrated && mission1Panel) {
      saveProgress(progress)
    }
    return progress
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

export function hasSeenDialog(id: string): boolean {
  return loadProgress().seenDialogIds.includes(id)
}

export function markDialogSeen(id: string): void {
  const current = loadProgress()
  if (current.seenDialogIds.includes(id)) return
  updateProgress({ seenDialogIds: [...current.seenDialogIds, id] })
}

function parseMission1Panel(raw: unknown): { panel: Mission1PanelSave; migrated: boolean } | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Partial<Mission1PanelSave>
  const site: SiteId | null = p.site === 'A' || p.site === 'B' || p.site === 'C' ? p.site : null
  const season: SeasonId | null =
    p.season === 'summer_n' || p.season === 'equinox_n' || p.season === 'winter_n' ? p.season : null
  if (!site || !season) return null
  if (typeof p.tilt !== 'number' || typeof p.azimuth !== 'number' || typeof p.efficiency !== 'number') {
    return null
  }
  const rawTest = p.panelTest ?? legacyStormChoice(p)
  const panelTest: PanelTestChoice | null =
    rawTest === 'clean' || rawTest === 'save'
      ? 'clean'
      : rawTest === 'dust' || rawTest === 'max'
        ? 'dust'
        : null
  const hadInstallStamp = typeof p.firstInstalledAt === 'number' && p.firstInstalledAt > 0
  const firstInstalledAt = hadInstallStamp ? p.firstInstalledAt! : Date.now()
  const lastCleanedAt =
    typeof p.lastCleanedAt === 'number' && p.lastCleanedAt > 0 ? p.lastCleanedAt : null
  return {
    panel: {
      site,
      season,
      tilt: p.tilt,
      azimuth: p.azimuth,
      efficiency: p.efficiency,
      panelTest,
      firstInstalledAt,
      lastCleanedAt,
    },
    migrated: !hadInstallStamp || hadLegacyPanelTest(raw),
  }
}

function legacyStormChoice(raw: Partial<Mission1PanelSave> & { stormChoice?: unknown }): unknown {
  return raw.panelTest ?? raw.stormChoice
}

function hadLegacyPanelTest(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false
  const legacy = raw as { panelTest?: unknown; stormChoice?: unknown }
  return (
    legacy.panelTest == null && (legacy.stormChoice === 'save' || legacy.stormChoice === 'max')
  )
}
