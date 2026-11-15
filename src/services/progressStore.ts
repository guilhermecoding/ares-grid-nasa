import type { Mission1Step, PanelTestChoice, SeasonId, SiteId } from '../data/mission1Data'
import type { ExerciseId, HygieneId, Mission2Step, NutritionCardId } from '../data/mission2Data'
import type { Mission3Step, PotabilityId, SiteId as IceSiteId } from '../data/mission3Data'
import type { BackpackId, HelmetId, InsigniaId, SuitColorId } from '../data/openingData'
import { MAX_WATER_RESERVE_L, type BaseStats, type ToolId } from '../types/game'

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
  /** Mission dialog groups closed with Pular. Later dialogs in that group stay hidden. */
  skippedDialogGroups: string[]
  /** Unfinished mission attempts. Cleared when that mission is completed. */
  missionRuns: MissionRuns
}

/** In-progress Missão 01. A finished visit has no run and opens the panel replay. */
export interface Mission1Run {
  step: Mission1Step
  site: SiteId
  season: SeasonId
  tilt: number
  azimuth: number
  efficiency: number
  panelTest: PanelTestChoice | null
}

/** In-progress Missão 02. Energy comes from the live base meter on resume. */
export interface Mission2Run {
  step: Mission2Step
  waterL: number
  waterPct: number
  wellbeingBoost: number
  contaminationRisk: number
  exercises: ExerciseId[]
  foods: string[]
  nutritionCards: NutritionCardId[]
  waterRationL: number
  hygieneDone: HygieneId[]
  cabinDone: boolean
}

/** In-progress Missão 03. Energy comes from the live base meter on resume. */
export interface Mission3Run {
  step: Mission3Step
  phase: 'play' | 'logbook' | 'outro'
  waterL: number
  waterPct: number
  site: IceSiteId
  drillDepth: number
  drillLogged: number
  processDone: number
  potabilityTreated: boolean
  potabilityAnalyzed: PotabilityId[]
}

export interface MissionRuns {
  m1?: Mission1Run
  m2?: Mission2Run
  m3?: Mission3Run
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
  skippedDialogGroups: [],
  missionRuns: {},
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
    const skippedDialogGroups = Array.isArray(parsed.skippedDialogGroups)
      ? parsed.skippedDialogGroups.filter((id): id is string => typeof id === 'string')
      : []
    const progress: PlayerProgress = {
      ...DEFAULT_PROGRESS,
      ...parsed,
      unlockedTools: parsed.unlockedTools ?? DEFAULT_PROGRESS.unlockedTools,
      baseStats,
      mission1Panel,
      seenDialogIds,
      skippedDialogGroups,
      missionRuns: parseMissionRuns(parsed.missionRuns),
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

/** Group for Pular: m1, m2, m3 or the missions map. */
export function dialogGroupOf(dialogId: string): string | null {
  if (dialogId.startsWith('m1')) return 'm1'
  if (dialogId.startsWith('m2')) return 'm2'
  if (dialogId.startsWith('m3')) return 'm3'
  if (dialogId.startsWith('map')) return 'map'
  return null
}

export function isDialogGroupSkipped(group: string): boolean {
  return loadProgress().skippedDialogGroups.includes(group)
}

export function markDialogGroupSkipped(group: string): void {
  const current = loadProgress()
  if (current.skippedDialogGroups.includes(group)) return
  updateProgress({ skippedDialogGroups: [...current.skippedDialogGroups, group] })
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

const M1_STEPS = new Set<Mission1Step>([
  'intro',
  'replay_intro',
  'replay_idle',
  'risk_warning',
  'step1_location',
  'step2_solar_calc',
  'step3_panel_test',
  'step4_logbook',
  'step5_transmission',
])
const M2_STEPS = new Set<Mission2Step>([
  'intro',
  'step2_1_exercise',
  'step2_2_nutrition',
  'step2_3_hygiene',
  'step2_4_sleep_prep',
  'special_capi_night_report',
  'morning_wakeup',
  'logbook',
  'mission_outro',
])
const M3_STEPS = new Set<Mission3Step>([
  'intro',
  'step3_1_methodology',
  'step3_2_layered_map',
  'step3_3_drilling',
  'step3_4_sample_collection',
  'step3_5_ice_processing',
  'step3_6_potability_test',
  'step3_logbook_and_ship',
])
const EXERCISE_IDS = new Set<ExerciseId>(['treadmill', 'resistance', 'stretch', 'balance'])
const HYGIENE_IDS = new Set<HygieneId>(['teeth', 'body', 'sensors'])
const NUTRITION_IDS = new Set<NutritionCardId>(['protein', 'veggie', 'carb', 'hydrate'])
const POTABILITY_IDS = new Set<PotabilityId>(['ph', 'conductivity', 'chemicals', 'metals', 'microbes', 'treatment'])

function strList<T extends string>(raw: unknown, allowed: Set<T>): T[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((id): id is T => typeof id === 'string' && allowed.has(id as T))
}

function parseMission1Run(raw: unknown): Mission1Run | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const p = raw as Partial<Mission1Run>
  if (!p.step || !M1_STEPS.has(p.step)) return undefined
  if (p.step === 'replay_intro' || p.step === 'replay_idle') return undefined
  const site: SiteId | null = p.site === 'A' || p.site === 'B' || p.site === 'C' ? p.site : null
  const season: SeasonId | null =
    p.season === 'summer_n' || p.season === 'equinox_n' || p.season === 'winter_n' ? p.season : null
  if (!site || !season) return undefined
  if (typeof p.tilt !== 'number' || typeof p.azimuth !== 'number' || typeof p.efficiency !== 'number') return undefined
  const panelTest: PanelTestChoice | null = p.panelTest === 'clean' || p.panelTest === 'dust' ? p.panelTest : null
  return { step: p.step, site, season, tilt: p.tilt, azimuth: p.azimuth, efficiency: p.efficiency, panelTest }
}

function parseMission2Run(raw: unknown): Mission2Run | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const p = raw as Partial<Mission2Run>
  if (!p.step || !M2_STEPS.has(p.step)) return undefined
  if (typeof p.waterL !== 'number' || typeof p.waterPct !== 'number') return undefined
  return {
    step: p.step,
    waterL: p.waterL,
    waterPct: p.waterPct,
    wellbeingBoost: typeof p.wellbeingBoost === 'number' ? p.wellbeingBoost : 0,
    contaminationRisk: typeof p.contaminationRisk === 'number' ? p.contaminationRisk : 100,
    exercises: strList(p.exercises, EXERCISE_IDS),
    foods: Array.isArray(p.foods) ? p.foods.filter((id): id is string => typeof id === 'string') : [],
    nutritionCards: strList(p.nutritionCards, NUTRITION_IDS),
    waterRationL: typeof p.waterRationL === 'number' ? p.waterRationL : 0.35,
    hygieneDone: strList(p.hygieneDone, HYGIENE_IDS),
    cabinDone: Boolean(p.cabinDone),
  }
}

function parseMission3Run(raw: unknown): Mission3Run | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const p = raw as Partial<Mission3Run>
  if (!p.step || !M3_STEPS.has(p.step)) return undefined
  if (typeof p.waterL !== 'number' || typeof p.waterPct !== 'number') return undefined
  const site: IceSiteId | null = p.site === 'alpha' || p.site === 'beta' || p.site === 'gamma' ? p.site : null
  if (!site) return undefined
  const phase = p.phase === 'logbook' || p.phase === 'outro' ? p.phase : 'play'
  return {
    step: p.step,
    phase,
    waterL: p.waterL,
    waterPct: p.waterPct,
    site,
    drillDepth: typeof p.drillDepth === 'number' ? p.drillDepth : 0,
    drillLogged: typeof p.drillLogged === 'number' ? p.drillLogged : 0,
    processDone: typeof p.processDone === 'number' ? p.processDone : 0,
    potabilityTreated: Boolean(p.potabilityTreated),
    potabilityAnalyzed: strList(p.potabilityAnalyzed, POTABILITY_IDS),
  }
}

function parseMissionRuns(raw: unknown): MissionRuns {
  if (!raw || typeof raw !== 'object') return {}
  const p = raw as Partial<MissionRuns>
  return {
    m1: parseMission1Run(p.m1),
    m2: parseMission2Run(p.m2),
    m3: parseMission3Run(p.m3),
  }
}

export function saveMissionRun<K extends keyof MissionRuns>(
  key: K,
  run: NonNullable<MissionRuns[K]>,
  stats?: Partial<BaseStats>,
): void {
  const progress = loadProgress()
  updateProgress({
    missionRuns: { ...progress.missionRuns, [key]: run },
    ...(stats ? { baseStats: { ...progress.baseStats, ...stats } } : {}),
  })
}

export function clearMissionRun(key: keyof MissionRuns): void {
  const missionRuns = { ...loadProgress().missionRuns }
  delete missionRuns[key]
  updateProgress({ missionRuns })
}

/** Keep liters saved above the percent cap when the reserve did not change outside the mission. */
export function resumeWaterLiters(savedLiters: number, savedPct: number, currentPct: number): number {
  const pct = Math.max(0, Math.min(100, Math.round(currentPct)))
  const saved = Math.max(0, Math.min(100, Math.round(savedPct)))
  if (pct === saved) return savedLiters
  return Math.round((pct / 100) * MAX_WATER_RESERVE_L * 10) / 10
}

function hadLegacyPanelTest(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false
  const legacy = raw as { panelTest?: unknown; stormChoice?: unknown }
  return (
    legacy.panelTest == null && (legacy.stormChoice === 'save' || legacy.stormChoice === 'max')
  )
}
