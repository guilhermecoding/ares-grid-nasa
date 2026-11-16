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

export type FoodGroupId = 'protein' | 'veggie' | 'carb'

export type MealVerdict = 'low' | 'balanced' | 'high'

export interface FoodItem {
  id: string
  group: FoodGroupId
  label: string
  kcal: number
  intensity: string
}

/** Fixed educational spend from the Sol 02 workout plus mission prep. */
export const ACTIVITY_ENERGY_KCAL = 740
export const MEAL_KCAL_MIN = 650
export const MEAL_KCAL_MAX = 820
/** Bar scale so an over-target tray still fits on screen. */
export const MEAL_KCAL_SCALE = 1000

export const WATER_DISPENSER = {
  minMl: 300,
  maxMl: 400,
  stepMl: 10,
  defaultMl: 350,
} as const

/** Ideal meal bonus: health and a little base energy. */
export const BALANCED_MEAL_BONUS = { wellbeing: 18, energy: 6 } as const

export const FOOD_ITEMS: readonly FoodItem[] = [
  { id: 'tofu', group: 'protein', label: 'Tofu Proteico', kcal: 140, intensity: 'Leve' },
  { id: 'chickpea', group: 'protein', label: 'Grão-de-bico Espacial', kcal: 250, intensity: 'Moderado' },
  { id: 'fish', group: 'protein', label: 'Peixe Selado NASA', kcal: 360, intensity: 'Alta Energia' },
  { id: 'salad', group: 'veggie', label: 'Salada de Folhas Verdes', kcal: 35, intensity: 'Ultra Leve' },
  { id: 'tomato', group: 'veggie', label: 'Tomates-cereja', kcal: 70, intensity: 'Leve' },
  { id: 'broccoli', group: 'veggie', label: 'Brócolis da Estufa', kcal: 130, intensity: 'Nutritivo' },
  { id: 'tortilla', group: 'carb', label: 'Tortilha Integral', kcal: 190, intensity: 'Leve' },
  { id: 'quinoa', group: 'carb', label: 'Quinoa Espacial', kcal: 290, intensity: 'Moderado' },
  { id: 'rice', group: 'carb', label: 'Arroz Integral', kcal: 410, intensity: 'Alta Energia' },
] as const

export const FOOD_GROUPS: Record<FoodGroupId, { label: string; hint: string }> = {
  protein: { label: 'Proteínas', hint: 'Músculos' },
  veggie: { label: 'Vegetais', hint: 'Vitaminas e fibras' },
  carb: { label: 'Carboidratos', hint: 'Energia' },
}

export const MEAL_GROUP_ORDER: readonly FoodGroupId[] = ['protein', 'veggie', 'carb']

export const CAPI_MEAL_LINES: Record<MealVerdict, readonly string[]> = {
  low: [
    'Atenção, comandante! Você gastou muita energia nos exercícios e essa refeição tem poucas calorias.',
    'O astronauta vai ficar sem força — troque por alimentos mais energéticos!',
  ],
  balanced: [
    'Combinação perfeita! Você repôs exatamente a energia gasta nos treinos com proteínas, vitaminas e carboidratos na medida certa!',
  ],
  high: [
    'Essa refeição ultrapassou o gasto energético do dia!',
    'Muita energia acumulada pode causar desconforto antes da próxima atividade. Tente equilibrar um item mais leve.',
  ],
}

export type NutritionCardId = FoodGroupId | 'hydrate'

const FOOD_BY_ID = new Map(FOOD_ITEMS.map((item) => [item.id, item]))

export function foodById(id: string): FoodItem | undefined {
  return FOOD_BY_ID.get(id)
}

export function mealKcal(foodIds: readonly string[]): number {
  let total = 0
  for (const id of foodIds) total += FOOD_BY_ID.get(id)?.kcal ?? 0
  return total
}

export function mealVerdict(kcal: number): MealVerdict {
  if (kcal < MEAL_KCAL_MIN) return 'low'
  if (kcal > MEAL_KCAL_MAX) return 'high'
  return 'balanced'
}

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
  const groups = new Set<FoodGroupId>()
  for (const id of foodIds) {
    const group = FOOD_BY_ID.get(id)?.group
    if (group) groups.add(group)
  }
  if (groups.size === 0) return 0
  if (groups.size === 1) return 35
  if (groups.size < MEAL_GROUP_ORDER.length) return 70
  const verdict = mealVerdict(mealKcal(foodIds))
  return verdict === 'balanced' ? 100 : 55
}

/** True when the current stage cannot be finished because energy is too low. */
export function isMission2EnergySoftLocked(
  step: Mission2Step,
  energyPct: number,
  exercises: readonly ExerciseId[],
  _nutritionCards: readonly NutritionCardId[],
  hygieneDone: readonly HygieneId[],
): boolean {
  if (step === 'step2_1_exercise') {
    const need = EXERCISE_REQUIRED_COUNT - exercises.length
    if (need <= 0) return false
    const affordable = EXERCISES.filter((e) => !exercises.includes(e.id) && e.energyCost <= energyPct)
    return affordable.length < need
  }

  if (step === 'step2_2_nutrition') return false

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

  const mealMl = Math.round(choices.waterRationL * 1000)
  const hydration =
    mealMl >= WATER_DISPENSER.minMl && mealMl <= WATER_DISPENSER.maxMl
      ? 92
      : mealMl < WATER_DISPENSER.minMl
        ? 28 + mealMl / 20
        : 78 - (mealMl - WATER_DISPENSER.maxMl) / 25

  const hygieneComplete = choices.hygieneDone.length >= HYGIENE_ACTIONS.length
  const contDrop = hygieneCosts(choices.hygieneDone).contaminationDrop
  const contaminationRisk = clamp(100 - contDrop)

  const physicalHealth = clamp(42 + physicalFromEx * 0.9 + (balance >= 70 ? 8 : 0))

  let sleepScore = 48 + sleepBonusEx + (balance >= 100 ? 12 : balance >= 70 ? 6 : 0)
  const waterInRange = mealMl >= WATER_DISPENSER.minMl && mealMl <= WATER_DISPENSER.maxMl
  sleepScore += waterInRange ? 10 : -10
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
