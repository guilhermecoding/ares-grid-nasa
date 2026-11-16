import type { Locale } from '../i18n/locale'

/** Missão 04 — A Primeira Estufa de Marte. */

export type Mission4Step =
  | 'intro'
  | 'step4_1_build_greenhouse'
  | 'step4_2_cultivation_method'
  | 'step4_3_select_species'
  | 'step4_4_growth_monitor'
  | 'step4_5_bioregenerative'
  | 'step4_logbook_and_sleep'

export type Mission4Phase = 'play' | 'logbook' | 'night' | 'outro'

export interface Mission4Run {
  step: Mission4Step
  phase: Mission4Phase
  waterL: number
  waterPct: number
  installed: GreenhouseModuleId[]
  energyLinked: boolean
  waterLinked: boolean
  method: CultivationMethodId | null
  plants: { group: PlantGroupId; species: SpeciesId }[]
  growthStage: 0 | 1 | 2
  misted: boolean
  lightOn: boolean
  tempOk: boolean
  harvested: SpeciesId[]
  blss: BlssLinkId[]
  foodPct: number
  o2Pct: number
}

export type GreenhouseModuleId = 'shell' | 'led' | 'air' | 'temp' | 'monitor'

export type CultivationMethodId = 'hydro' | 'aero' | 'regolith'

export type PlantGroupId = 'veggie' | 'fruit' | 'grain' | 'flower'

export type SpeciesId = 'lettuce' | 'tomato' | 'carrot' | 'strawberry' | 'wheat' | 'zinnia'

export type BlssLinkId = 'air' | 'water' | 'nutrient'

export const MISSION4_META = {
  solLabel: 'Sol 04',
  location: 'Arcadia Planitia',
  title: 'A Primeira Estufa de Marte',
  titleEn: 'The First Greenhouse on Mars',
} as const

export const NASA_CITATIONS_M4 = {
  veggie: 'NASA — experimentos Veggie e Advanced Plant Habitat na Estação Espacial Internacional.',
  blss: 'NASA — sistemas bioregenerativos de suporte à vida (BLSS): plantas, água e ar no mesmo ciclo.',
  perchlorate: 'O regolito marciano cru contém percloratos e quase nenhuma matéria orgânica. Sem tratamento, ele não serve para plantar.',
} as const

export const SCI_TERMS_M4: Record<string, string> = {
  Hidroponia: 'As raízes ficam na água com nutrientes, sem terra.',
  Aeroponia: 'As raízes ficam no ar e recebem uma névoa com nutrientes.',
  Regolito: 'É o pó e a pedra solta da superfície de Marte.',
  Bioregenerativo: 'Plantas, água e ar se ajudam e o ciclo recomeça.',
  Fotossíntese: 'A planta usa luz para transformar ar e água em alimento e oxigênio.',
  Percloratos: 'Sais tóxicos do solo de Marte. Precisam sair antes do plantio.',
}

export const SCI_TERMS_M4_EN: Record<string, string> = {
  Hydroponics: 'Roots sit in water with nutrients, and there is no soil.',
  Aeroponics: 'Roots hang in the air and get a mist with nutrients.',
  Regolith: 'It is the loose dust and rock on the surface of Mars.',
  Bioregenerative: 'Plants, water, and air help each other, and the cycle starts again.',
  Photosynthesis: 'The plant uses light to turn air and water into food and oxygen.',
  Perchlorates: 'Toxic salts in the soil of Mars. They have to come out before planting.',
}

export const GREENHOUSE_MODULES: readonly {
  id: GreenhouseModuleId
  title: string
  titleEn: string
  detail: string
  detailEn: string
  energyCost: number
}[] = [
  {
    id: 'shell',
    title: 'Estrutura térmica e pressurizada',
    titleEn: 'Heated, pressurized frame',
    detail: 'O domo segura o ar e o calor.',
    detailEn: 'The dome holds in the air and the heat.',
    energyCost: 4,
  },
  {
    id: 'led',
    title: 'Iluminação LED',
    titleEn: 'LED lighting',
    detail: 'Luz rosa e branca no lugar do Sol fraco.',
    detailEn: 'Pink and white light in place of the weak Sun.',
    energyCost: 6,
  },
  {
    id: 'air',
    title: 'Ventilação',
    titleEn: 'Ventilation',
    detail: 'O ar circula entre as folhas.',
    detailEn: 'Air moves between the leaves.',
    energyCost: 3,
  },
  {
    id: 'temp',
    title: 'Controle de temperatura',
    titleEn: 'Temperature control',
    detail: 'Nem frio demais, nem calor demais.',
    detailEn: 'Not too cold, and not too hot.',
    energyCost: 4,
  },
  {
    id: 'monitor',
    title: 'Monitoramento ambiental',
    titleEn: 'Environment monitoring',
    detail: 'Sensores de luz, água e ar.',
    detailEn: 'Sensors for light, water, and air.',
    energyCost: 2,
  },
]

export const CULTIVATION_METHODS: readonly {
  id: CultivationMethodId
  title: string
  titleEn: string
  detail: string
  detailEn: string
  energyCost: number
  waterL: number
  term: string
}[] = [
  {
    id: 'hydro',
    title: 'Hidroponia',
    titleEn: 'Hydroponics',
    detail: 'Raízes na água com nutrientes. Gasta pouca água e cresce rápido.',
    detailEn: 'Roots sit in water with nutrients. It uses little water and grows fast.',
    energyCost: 6,
    waterL: 6,
    term: 'Hidroponia',
  },
  {
    id: 'aero',
    title: 'Aeroponia',
    titleEn: 'Aeroponics',
    detail: 'Raízes no ar, com névoa. Economiza ainda mais água e gasta mais energia nas bombas.',
    detailEn: 'Roots hang in the air, with mist. It saves even more water and uses more energy for the pumps.',
    energyCost: 10,
    waterL: 2,
    term: 'Aeroponia',
  },
  {
    id: 'regolith',
    title: 'Regolito tratado',
    titleEn: 'Treated regolith',
    detail: 'Solo de Marte só depois de lavar e tirar os sais tóxicos. É um teste.',
    detailEn: 'Martian soil only after the toxic salts are washed out. It is a test.',
    energyCost: 6,
    waterL: 4,
    term: 'Regolito',
  },
]

export const PLANT_GROUPS: readonly {
  id: PlantGroupId
  title: string
  titleEn: string
  species: readonly { id: SpeciesId; label: string; labelEn: string }[]
}[] = [
  {
    id: 'veggie',
    title: 'Hortaliça',
    titleEn: 'Vegetable',
    species: [
      { id: 'lettuce', label: 'Alface', labelEn: 'Lettuce' },
      { id: 'tomato', label: 'Tomate', labelEn: 'Tomato' },
      { id: 'carrot', label: 'Cenoura', labelEn: 'Carrot' },
    ],
  },
  { id: 'fruit', title: 'Fruta', titleEn: 'Fruit', species: [{ id: 'strawberry', label: 'Morango', labelEn: 'Strawberry' }] },
  { id: 'grain', title: 'Cereal', titleEn: 'Grain', species: [{ id: 'wheat', label: 'Trigo anão', labelEn: 'Dwarf wheat' }] },
  { id: 'flower', title: 'Flor', titleEn: 'Flower', species: [{ id: 'zinnia', label: 'Zínia', labelEn: 'Zinnia' }] },
]

export const GROWTH_STAGES = ['Sementes', 'Broto', 'Colheita'] as const

export const BLSS_LINKS: readonly { id: BlssLinkId; label: string; labelEn: string; detail: string; detailEn: string }[] = [
  {
    id: 'air',
    label: 'Ar',
    labelEn: 'Air',
    detail: 'As plantas pegam CO₂ e soltam oxigênio.',
    detailEn: 'The plants take in CO₂ and give off oxygen.',
  },
  {
    id: 'water',
    label: 'Água',
    labelEn: 'Water',
    detail: 'O vapor das folhas vira água limpa de novo.',
    detailEn: 'Vapor from the leaves becomes clean water again.',
  },
  {
    id: 'nutrient',
    label: 'Nutrientes',
    labelEn: 'Nutrients',
    detail: 'O que sobra da planta volta como alimento do solo.',
    detailEn: 'What is left of the plant comes back as food for the soil.',
  },
]

export function speciesLabel(id: SpeciesId, locale: Locale = 'pt'): string {
  for (const group of PLANT_GROUPS) {
    const found = group.species.find((s) => s.id === id)
    if (found) return locale === 'en' ? found.labelEn : found.label
  }
  return id
}

export function groupOf(id: SpeciesId): PlantGroupId {
  const group = PLANT_GROUPS.find((g) => g.species.some((s) => s.id === id))
  return group?.id ?? 'veggie'
}
