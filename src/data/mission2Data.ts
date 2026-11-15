/** Mission 02 scientific copy, choices, costs & Sleep Score formulas. */

export type Mission2Step =
  | 'intro'
  | 'step2_1_exercise'
  | 'step2_2_nutrition'
  | 'step2_3_hygiene'
  | 'step2_4_sleep_prep'
  | 'special_capi_night_report'
  | 'morning_wakeup'
  | 'logbook'
  | 'mission_outro'

export type HabitatLighting = 'morning' | 'afternoon' | 'dusk' | 'night' | 'dawn'

export const MISSION2_META = {
  number: 2,
  gateTitle: 'CUIDANDO DO ASTRONAUTA',
  shortTitle: 'Saúde',
  solLabel: 'Sol 02',
  location: 'Arcadia Planitia',
  marsGravityPct: 38,
  /** Keep in sync with MAX_WATER_RESERVE_L in types/game. */
  initialWaterReserveL: 40,
  sources: [
    'NASA Spaceflight Standard Measures',
    'NASA Human Research Program — exercise, nutrition & sleep in spaceflight',
  ],
  educationalDisclaimer:
    'Dados simulados para fins educativos. Não representam medições clínicas reais.',
  nasaCitation: 'NASA Spaceflight Standard Measures',
} as const

export const SCI_TERMS_M2: Record<string, string> = {
  Microgravidade: 'Quase sem peso — em Marte a gravidade é só 38% da Terra.',
  Actigrafia: 'Medir movimento e sono com sensores no corpo ou na cabine.',
  Contaminação: 'Micróbios ou sujeira que podem adoecer a tripulação no módulo fechado.',
  Metabolismo: 'Como o corpo transforma comida e água em energia.',
  Hidratação: 'Água suficiente no corpo para funcionar bem.',
  'Arcadia Planitia': 'Uma planície grande e relativamente plana em Marte.',
}

/** Short Capi intro parts — one dialog box each. */
export const INTRO_PARTS_M2 = [
  ['A vida fora da Terra pode abalar a saúde de um astronauta corajoso.'] as const,
  ['Com a energia ligada, vamos cuidar de VOCÊ.'] as const,
  ['Hoje: exercício, refeição, higiene e descanso.'] as const,
] as const

export const INTRO_HIGHLIGHT_WORDS_M2 = ['saúde', 'VOCÊ', 'exercício', 'refeição', 'higiene', 'descanso'] as const

export const BRIDGE_TO_NUTRITION = ['Músculos aquecidos!', 'Hora de alimentar o corpo.'] as const
export const BRIDGE_TO_HYGIENE = ['Refeição ok.', 'Agora higiene no módulo fechado.'] as const
export const BRIDGE_TO_SLEEP = ['Dia quase completo.', 'Prepare a cabine e descanse.'] as const

export type Mission2Bridge = 'nutrition' | 'hygiene' | 'sleep'

export type ExerciseId = 'treadmill' | 'resistance' | 'stretch' | 'balance'

export interface ExerciseOption {
  id: ExerciseId
  title: string
  focus: string
  energyCost: number
  waterCostL: number
  physicalGain: number
  sleepBonus: number
  /** Direct wellbeing restored when this card is completed. */
  wellbeingGain: number
  /** Accent color for the activity card. */
  color: string
}

/**
 * Complete exactly 2 of these 4 cards.
 * Energy costs stay modest so a typical Missão 01 battery (~35–60%) can finish the day.
 */
export const EXERCISES: readonly ExerciseOption[] = [
  {
    id: 'treadmill',
    title: 'Caminhada na Esteira',
    focus: 'Coração e resistência',
    energyCost: 6,
    waterCostL: 0.8,
    physicalGain: 14,
    sleepBonus: 4,
    wellbeingGain: 14,
    color: '#38bdf8',
  },
  {
    id: 'resistance',
    title: 'Exercícios de Resistência',
    focus: 'Força muscular e densidade óssea',
    energyCost: 8,
    waterCostL: 0.5,
    physicalGain: 22,
    sleepBonus: 2,
    wellbeingGain: 18,
    color: '#f97316',
  },
  {
    id: 'stretch',
    title: 'Alongamento',
    focus: 'Flexibilidade e recuperação',
    energyCost: 2,
    waterCostL: 0.2,
    physicalGain: 6,
    sleepBonus: 6,
    wellbeingGain: 10,
    color: '#4ade80',
  },
  {
    id: 'balance',
    title: 'Treinamento de Equilíbrio',
    focus: 'Adaptação neurológica à gravidade de Marte',
    energyCost: 3,
    waterCostL: 0.3,
    physicalGain: 8,
    sleepBonus: 5,
    wellbeingGain: 12,
    color: '#a78bfa',
  },
] as const

export const EXERCISE_REQUIRED_COUNT = 2

export type FoodGroupId = 'protein' | 'veggie' | 'fruit'

export interface FoodItem {
  id: string
  group: FoodGroupId
  label: string
  energyCost: number
  waterCostL: number
}

export const FOOD_ITEMS: readonly FoodItem[] = [
  { id: 'beans', group: 'protein', label: 'Feijão espacial', energyCost: 2, waterCostL: 0.15 },
  { id: 'tofu', group: 'protein', label: 'Proteína de soja', energyCost: 2, waterCostL: 0.1 },
  { id: 'grain', group: 'protein', label: 'Grãos integrais', energyCost: 1, waterCostL: 0.1 },
  { id: 'lettuce', group: 'veggie', label: 'Folhas hidropônicas', energyCost: 1, waterCostL: 0.05 },
  { id: 'carrot', group: 'veggie', label: 'Cenoura da estufa', energyCost: 1, waterCostL: 0.08 },
  { id: 'pepper', group: 'veggie', label: 'Pimentão vermelho', energyCost: 1, waterCostL: 0.06 },
  { id: 'apple', group: 'fruit', label: 'Maçã desidratada', energyCost: 1, waterCostL: 0.04 },
  { id: 'berry', group: 'fruit', label: 'Frutas vermelhas', energyCost: 1, waterCostL: 0.05 },
  { id: 'banana', group: 'fruit', label: 'Barra de banana', energyCost: 1, waterCostL: 0.03 },
] as const

export const FOOD_GROUPS: Record<FoodGroupId, { label: string; short: string }> = {
  protein: { label: 'Proteínas / Grãos', short: 'Proteína' },
  veggie: { label: 'Vegetais / Hortaliças', short: 'Vegetais' },
  fruit: { label: 'Frutas / Energia', short: 'Frutas' },
}

export type NutritionCardId = FoodGroupId | 'hydrate'

export interface NutritionCard {
  id: NutritionCardId
  title: string
  detail: string
  energyCost: number
  waterCostL: number
  wellbeingGain: number
  color: string
  /** Food item ids added when this group card is completed. */
  foodIds?: string[]
  /** Water ration set when hydrate card is completed. */
  waterRationL?: number
}

/** Four nutrition cards — complete at least 3 (incl. hydrate). Food uses water, not battery. */
export const NUTRITION_CARDS: readonly NutritionCard[] = [
  {
    id: 'protein',
    title: 'Proteínas',
    detail: 'Feijão + soja',
    energyCost: 0,
    waterCostL: 0.25,
    wellbeingGain: 8,
    color: '#f0b429',
    foodIds: ['beans', 'tofu'],
  },
  {
    id: 'veggie',
    title: 'Vegetais',
    detail: 'Folhas da estufa',
    energyCost: 0,
    waterCostL: 0.15,
    wellbeingGain: 7,
    color: '#5ecf9a',
    foodIds: ['lettuce', 'carrot'],
  },
  {
    id: 'fruit',
    title: 'Frutas',
    detail: 'Energia rápida',
    energyCost: 0,
    waterCostL: 0.1,
    wellbeingGain: 6,
    color: '#ff6b8a',
    foodIds: ['apple', 'berry'],
  },
  {
    id: 'hydrate',
    title: 'Hidratação',
    detail: '2.2 L no dia',
    energyCost: 0,
    waterCostL: 2.2,
    wellbeingGain: 10,
    color: '#38bdf8',
    waterRationL: 2.2,
  },
] as const

export const NUTRITION_REQUIRED_COUNT = 3

export const WATER_RATION = {
  minL: 1.5,
  maxL: 3.0,
  idealMinL: 2.0,
  idealMaxL: 2.5,
  /** Extra liters above idealMax drain the base reserve harder. */
  wasteThresholdL: 2.5,
} as const

export type HygieneId = 'teeth' | 'body' | 'sensors'

export interface HygieneAction {
  id: HygieneId
  title: string
  detail: string
  waterCostL: number
  energyCost: number
  contaminationDrop: number
}

export const HYGIENE_ACTIONS: readonly (HygieneAction & { wellbeingGain: number; color: string })[] = [
  {
    id: 'teeth',
    title: 'Escovar os dentes',
    detail: 'Sistema de sucção — quase sem desperdício de água.',
    waterCostL: 0.05,
    energyCost: 0,
    contaminationDrop: 25,
    wellbeingGain: 5,
    color: '#7b8cff',
  },
  {
    id: 'body',
    title: 'Higienizar mãos e corpo',
    detail: 'Lenços especiais / banho seco econômico.',
    waterCostL: 0.2,
    energyCost: 1,
    contaminationDrop: 40,
    wellbeingGain: 8,
    color: '#5ee7ff',
  },
  {
    id: 'sensors',
    title: 'Limpar sensores e equipamentos',
    detail: 'Evita poeira e microrganismos na estação.',
    waterCostL: 0.08,
    energyCost: 1,
    contaminationDrop: 35,
    wellbeingGain: 6,
    color: '#c47848',
  },
] as const

export const HYGIENE_BONUS_CARD = {
  id: 'cabin' as const,
  title: 'Revisar cabine',
  detail: 'Última checagem de higiene',
  energyCost: 0,
  waterCostL: 0.05,
  wellbeingGain: 4,
  color: '#4ade80',
}

export const NIGHT_REPORT_STEPS = [
  { id: 'health', label: 'Saúde', title: 'Indicadores fisiológicos' },
  { id: 'sleep', label: 'Sono', title: 'Duração e Sleep Score' },
  { id: 'activities', label: 'Atividades', title: 'Resumo do dia' },
  { id: 'research', label: 'Pesquisas', title: 'Diário científico' },
  { id: 'storage', label: 'Armazenamento', title: 'Servidor de bordo' },
  { id: 'comms', label: 'Comunicação', title: 'Link Marte–Terra' },
  { id: 'confirm', label: 'Confirmação', title: 'Aviso educativo' },
] as const

export type NightReportStepId = (typeof NIGHT_REPORT_STEPS)[number]['id']

export interface Mission2Choices {
  exercises: ExerciseId[]
  foods: string[]
  waterRationL: number
  hygieneDone: HygieneId[]
}

export interface Mission2Scores {
  physicalHealth: number
  hydration: number
  sleepScore: number
  sleepHours: number
  wellbeing: number
  contaminationRisk: number
  sciencePoints: number
  healthPoints: number
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)))
}

export function nutritionBalance(foodIds: string[]): number {
  const groups = new Set(
    foodIds
      .map((id) => FOOD_ITEMS.find((f) => f.id === id)?.group)
      .filter(Boolean),
  )
  if (groups.size === 0) return 0
  if (groups.size === 1) return 35
  if (groups.size === 2) return 70
  return 100
}

/** True when the current stage cannot be finished because energy is too low. */
export function isMission2EnergySoftLocked(
  step: Mission2Step,
  energyPct: number,
  exercises: readonly ExerciseId[],
  nutritionCards: readonly NutritionCardId[],
  hygieneDone: readonly HygieneId[],
): boolean {
  if (step === 'step2_1_exercise') {
    const need = EXERCISE_REQUIRED_COUNT - exercises.length
    if (need <= 0) return false
    const affordable = EXERCISES.filter((e) => !exercises.includes(e.id) && e.energyCost <= energyPct)
    return affordable.length < need
  }

  if (step === 'step2_2_nutrition') {
    const done = new Set(nutritionCards)
    if (done.size >= NUTRITION_REQUIRED_COUNT && done.has('hydrate')) return false
    const remaining = NUTRITION_CARDS.filter((c) => !done.has(c.id) && c.energyCost <= energyPct)
    const need = Math.max(0, NUTRITION_REQUIRED_COUNT - done.size)
    if (need === 0) return !done.has('hydrate') && !remaining.some((c) => c.id === 'hydrate')
    if (!done.has('hydrate')) {
      const hydrateOk = remaining.some((c) => c.id === 'hydrate')
      if (!hydrateOk) return true
      const others = remaining.filter((c) => c.id !== 'hydrate')
      return others.length < need - 1
    }
    return remaining.length < need
  }

  if (step === 'step2_3_hygiene') {
    const need = HYGIENE_ACTIONS.length - hygieneDone.length
    if (need <= 0) return false
    const affordable = HYGIENE_ACTIONS.filter((a) => !hygieneDone.includes(a.id) && a.energyCost <= energyPct)
    return affordable.length < need
  }

  return false
}

export function exerciseCosts(ids: ExerciseId[]): { energy: number; waterL: number } {
  return ids.reduce(
    (acc, id) => {
      const ex = EXERCISES.find((e) => e.id === id)
      if (!ex) return acc
      return { energy: acc.energy + ex.energyCost, waterL: acc.waterL + ex.waterCostL }
    },
    { energy: 0, waterL: 0 },
  )
}

export function foodCosts(foodIds: string[]): { energy: number; waterL: number } {
  return foodIds.reduce(
    (acc, id) => {
      const f = FOOD_ITEMS.find((x) => x.id === id)
      if (!f) return acc
      return { energy: acc.energy + f.energyCost, waterL: acc.waterL + f.waterCostL }
    },
    { energy: 0, waterL: 0 },
  )
}

export function hygieneCosts(ids: HygieneId[]): { energy: number; waterL: number; contaminationDrop: number } {
  return ids.reduce(
    (acc, id) => {
      const h = HYGIENE_ACTIONS.find((x) => x.id === id)
      if (!h) return acc
      return {
        energy: acc.energy + h.energyCost,
        waterL: acc.waterL + h.waterCostL,
        contaminationDrop: acc.contaminationDrop + h.contaminationDrop,
      }
    },
    { energy: 0, waterL: 0, contaminationDrop: 0 },
  )
}

/** Deterministic Sleep Score & wellbeing from the day's choices. */
export function computeMission2Scores(choices: Mission2Choices, baseEnergySeed: number): Mission2Scores {
  const ex = choices.exercises
    .map((id) => EXERCISES.find((e) => e.id === id))
    .filter(Boolean) as ExerciseOption[]

  const physicalFromEx = ex.reduce((s, e) => s + e.physicalGain, 0)
  const sleepBonusEx = ex.reduce((s, e) => s + e.sleepBonus, 0)
  const balance = nutritionBalance(choices.foods)

  const ration = choices.waterRationL
  let hydration = 50
  if (ration < WATER_RATION.idealMinL) hydration = 35 + (ration - WATER_RATION.minL) * 20
  else if (ration <= WATER_RATION.idealMaxL) hydration = 78 + (ration - WATER_RATION.idealMinL) * 20
  else hydration = 88 - (ration - WATER_RATION.idealMaxL) * 18

  const hygieneComplete = choices.hygieneDone.length >= HYGIENE_ACTIONS.length
  const contDrop = hygieneCosts(choices.hygieneDone).contaminationDrop
  const contaminationRisk = clamp(100 - contDrop)

  const physicalHealth = clamp(42 + physicalFromEx * 0.9 + (balance >= 70 ? 8 : 0))

  let sleepScore = 48 + sleepBonusEx + (balance >= 100 ? 12 : balance >= 70 ? 6 : 0)
  sleepScore += ration < WATER_RATION.idealMinL ? -14 : ration > WATER_RATION.wasteThresholdL ? -6 : 10
  sleepScore += hygieneComplete ? 8 : -10
  sleepScore += baseEnergySeed >= 55 ? 4 : 0
  sleepScore = clamp(sleepScore)

  const sleepHours = Math.round((5.5 + sleepScore / 40) * 10) / 10

  const wellbeing = clamp(
    physicalHealth * 0.35 + hydration * 0.3 + sleepScore * 0.25 + (100 - contaminationRisk) * 0.1,
  )

  const sciencePoints = clamp(
    10 + ex.length * 8 + (balance >= 100 ? 12 : 4) + (hygieneComplete ? 10 : 0) + Math.floor(sleepScore / 12),
    0,
    99,
  )
  const healthPoints = clamp(Math.floor(wellbeing / 4) + Math.floor(physicalHealth / 8), 0, 99)

  return {
    physicalHealth,
    hydration: clamp(hydration),
    sleepScore,
    sleepHours,
    wellbeing,
    contaminationRisk,
    sciencePoints,
    healthPoints,
  }
}

export function lightingForStep(step: Mission2Step): HabitatLighting {
  switch (step) {
    case 'intro':
    case 'step2_1_exercise':
      return 'morning'
    case 'step2_2_nutrition':
      return 'afternoon'
    case 'step2_3_hygiene':
      return 'dusk'
    case 'step2_4_sleep_prep':
    case 'special_capi_night_report':
      return 'night'
    case 'morning_wakeup':
    case 'logbook':
    case 'mission_outro':
      return 'dawn'
  }
}

export function roomAccentForStep(step: Mission2Step): 'exercise' | 'nutrition' | 'hygiene' | 'sleep' | 'idle' {
  switch (step) {
    case 'step2_1_exercise':
      return 'exercise'
    case 'step2_2_nutrition':
      return 'nutrition'
    case 'step2_3_hygiene':
      return 'hygiene'
    case 'step2_4_sleep_prep':
    case 'special_capi_night_report':
    case 'morning_wakeup':
    case 'logbook':
    case 'mission_outro':
      return 'sleep'
    default:
      return 'idle'
  }
}
