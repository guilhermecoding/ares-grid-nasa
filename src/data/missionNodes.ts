export interface MissionNode {
  id: string
  level: number
  title: string
  lockedHint: string
  leftPct: number
  topPct: number
  /** Canonical 4×4 tile when the island is tapped */
  anchor: { x: number; y: number }
}

/**
 * RPG mission islands — positions match the painted map art (BL → TR path).
 * Themes follow the narrative PDF (Missões 1–5).
 */
export const MISSION_NODES: readonly MissionNode[] = [
  {
    id: 'm1-energia',
    level: 1,
    title: 'Energia Solar',
    lockedHint: 'Complete a missão anterior!',
    leftPct: 16,
    topPct: 74,
    anchor: { x: 1, y: 0 }, // SOLAR_PANEL
  },
  {
    id: 'm2-saude',
    level: 2,
    title: 'Saúde',
    lockedHint: 'Missão bloqueada',
    leftPct: 30,
    topPct: 58,
    anchor: { x: 0, y: 0 }, // HABITAT
  },
  {
    id: 'm3-gelo',
    level: 3,
    title: 'Gelo de Marte',
    lockedHint: 'Ainda não!',
    leftPct: 48,
    topPct: 48,
    anchor: { x: 2, y: 1 }, // SWIM_ICE_DRILL
  },
  {
    id: 'm4-estufa',
    level: 4,
    title: 'Estufa',
    lockedHint: 'Missão bloqueada',
    leftPct: 66,
    topPct: 36,
    anchor: { x: 1, y: 1 }, // HYDROPONIC_BAY
  },
  {
    id: 'm5-tempestades',
    level: 5,
    title: 'Tempestades',
    lockedHint: 'Última missão — avance mais!',
    leftPct: 84,
    topPct: 26,
    anchor: { x: 3, y: 2 }, // RADIATION_SHIELD
  },
] as const

export function getMissionNode(level: number): MissionNode {
  const capped = Math.min(Math.max(level, 1), MISSION_NODES.length)
  return MISSION_NODES[capped - 1]!
}

/** SVG path through island centers (viewBox 0 0 100 100 = map %). */
export function missionPathD(): string {
  const [a, b, c, d, e] = MISSION_NODES
  return `M ${a!.leftPct} ${a!.topPct} L ${b!.leftPct} ${b!.topPct} L ${c!.leftPct} ${c!.topPct} L ${d!.leftPct} ${d!.topPct} L ${e!.leftPct} ${e!.topPct}`
}
