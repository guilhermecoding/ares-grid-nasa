import type { QuestKind, ToolId } from '../types/game'

export interface LevelDef {
  level: number
  title: string
  unlockMessage: string
  tools: ToolId[]
  quest: {
    kind: QuestKind
    target: number
    label: string
  }
  xpReward: number
  xpToNext: number
}

/** Progressive Stardew-like levels for Arcadia Planitia AP-1. */
export const LEVELS: LevelDef[] = [
  {
    level: 1,
    title: 'Fazendeiro Solar',
    unlockMessage: 'Você pode limpar painéis solares! Ande até eles e toque em Interagir.',
    tools: ['walk', 'clean'],
    quest: { kind: 'clean_panels', target: 2, label: 'Limpe 2 painéis solares' },
    xpReward: 40,
    xpToNext: 40,
  },
  {
    level: 2,
    title: 'Caçador de Gelo SWIM',
    unlockMessage: 'Perfuração SWIM liberada! Extraia gelo subterrâneo para a base.',
    tools: ['walk', 'clean', 'drill'],
    quest: { kind: 'drill_ice', target: 1, label: 'Extraia 1 bloco de gelo SWIM' },
    xpReward: 50,
    xpToNext: 50,
  },
  {
    level: 3,
    title: 'Jardineiro OSDR',
    unlockMessage: 'Estufas liberadas! Colha culturas espaciais quando estiverem maduras.',
    tools: ['walk', 'clean', 'drill', 'harvest'],
    quest: { kind: 'harvest', target: 1, label: 'Colha 1 cultura na estufa' },
    xpReward: 60,
    xpToNext: 60,
  },
  {
    level: 4,
    title: 'Construtor de Escudo',
    unlockMessage: 'Regolito e cúpula liberados! Minerar e depositar reforça a base.',
    tools: ['walk', 'clean', 'drill', 'harvest', 'mine', 'shield'],
    quest: { kind: 'deposit_shield', target: 1, label: 'Deposite 1 carga de regolito no escudo' },
    xpReward: 70,
    xpToNext: 70,
  },
  {
    level: 5,
    title: 'Guardião da Tempestade',
    unlockMessage: 'Tempestades DONKI podem chegar! Durma seguro e proteja a base.',
    tools: ['walk', 'clean', 'drill', 'harvest', 'mine', 'shield'],
    quest: { kind: 'survive_storms', target: 2, label: 'Sobreviva a 2 Sols de tempestade' },
    xpReward: 80,
    xpToNext: 80,
  },
]

export function getLevelDef(level: number): LevelDef {
  const capped = Math.min(Math.max(level, 1), LEVELS.length)
  return LEVELS[capped - 1]!
}

export function toolsForLevel(level: number): ToolId[] {
  return getLevelDef(level).tools
}

export function questForLevel(level: number): LevelDef['quest'] {
  return getLevelDef(level).quest
}

export function tileUnlockLevel(type: string): number {
  switch (type) {
    case 'SOLAR_PANEL':
    case 'HABITAT':
    case 'EMPTY':
      return 1
    case 'SWIM_ICE_DRILL':
      return 2
    case 'HYDROPONIC_BAY':
      return 3
    case 'REGOLITH_PIT':
    case 'RADIATION_SHIELD':
      return 4
    default:
      return 1
  }
}
