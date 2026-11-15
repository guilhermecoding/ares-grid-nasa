export interface MissionNode {
  id: string
  level: number
  title: string
  /** Full plaque title for gate transition */
  gateTitle: string
  lockedHint: string
  soonHint: string
  leftPct: number
  topPct: number
  /** Canonical 4×4 tile when the island is tapped (legacy grid) */
  anchor: { x: number; y: number }
}

/** Missions that currently have a dedicated playable screen. */
export const PLAYABLE_MISSION_LEVELS = [1, 2, 3] as const

export function isPlayableMission(level: number): boolean {
  return (PLAYABLE_MISSION_LEVELS as readonly number[]).includes(level)
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
    gateTitle: 'Energia para explorar Marte',
    lockedHint: 'Complete a missão anterior!',
    soonHint: 'Em breve!',
    leftPct: 16,
    topPct: 74,
    anchor: { x: 1, y: 0 },
  },
  {
    id: 'm2-saude',
    level: 2,
    title: 'Saúde',
    gateTitle: 'Cuidando do astronauta',
    lockedHint: 'Missão bloqueada',
    soonHint: 'Complete a Missão 1 primeiro!',
    leftPct: 30,
    topPct: 58,
    anchor: { x: 0, y: 0 },
  },
  {
    id: 'm3-gelo',
    level: 3,
    title: 'Gelo de Marte',
    gateTitle: 'O mistério do gelo de Marte',
    lockedHint: 'Ainda não!',
    soonHint: 'Em breve!',
    leftPct: 48,
    topPct: 48,
    anchor: { x: 2, y: 1 },
  },
  {
    id: 'm4-estufa',
    level: 4,
    title: 'Estufa',
    gateTitle: 'A PRIMEIRA ESTUFA DE MARTE',
    lockedHint: 'Missão bloqueada',
    soonHint: 'Em breve!',
    leftPct: 66,
    topPct: 36,
    anchor: { x: 1, y: 1 },
  },
  {
    id: 'm5-tempestades',
    level: 5,
    title: 'Tempestades',
    gateTitle: 'ALERTA! TEMPESTADES EM MARTE',
    lockedHint: 'Última missão — avance mais!',
    soonHint: 'Em breve!',
    leftPct: 84,
    topPct: 26,
    anchor: { x: 3, y: 2 },
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
