/** Missão 04 — A Primeira Estufa de Marte. */

export type Mission4Step =
  | 'intro'
  | 'step4_1_build_greenhouse'
  | 'step4_2_cultivation_method'
  | 'step4_3_select_species'
  | 'step4_4_growth_monitor'
  | 'step4_5_bioregenerative'
  | 'step4_logbook_and_sleep'

export type Mission4Phase = 'play' | 'logbook' | 'night'

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

export const GREENHOUSE_MODULES: readonly {
  id: GreenhouseModuleId
  title: string
  detail: string
  energyCost: number
}[] = [
  { id: 'shell', title: 'Estrutura térmica e pressurizada', detail: 'O domo segura o ar e o calor.', energyCost: 4 },
  { id: 'led', title: 'Iluminação LED', detail: 'Luz rosa e branca no lugar do Sol fraco.', energyCost: 6 },
  { id: 'air', title: 'Ventilação', detail: 'O ar circula entre as folhas.', energyCost: 3 },
  { id: 'temp', title: 'Controle de temperatura', detail: 'Nem frio demais, nem calor demais.', energyCost: 4 },
  { id: 'monitor', title: 'Monitoramento ambiental', detail: 'Sensores de luz, água e ar.', energyCost: 2 },
]

export const CULTIVATION_METHODS: readonly {
  id: CultivationMethodId
  title: string
  detail: string
  energyCost: number
  waterL: number
  term: string
}[] = [
  {
    id: 'hydro',
    title: 'Hidroponia',
    detail: 'Raízes na água com nutrientes. Gasta pouca água e cresce rápido.',
    energyCost: 6,
    waterL: 6,
    term: 'Hidroponia',
  },
  {
    id: 'aero',
    title: 'Aeroponia',
    detail: 'Raízes no ar, com névoa. Economiza ainda mais água e gasta mais energia nas bombas.',
    energyCost: 10,
    waterL: 2,
    term: 'Aeroponia',
  },
  {
    id: 'regolith',
    title: 'Regolito tratado',
    detail: 'Solo de Marte só depois de lavar e tirar os sais tóxicos. É um teste.',
    energyCost: 6,
    waterL: 4,
    term: 'Regolito',
  },
]

export const PLANT_GROUPS: readonly {
  id: PlantGroupId
  title: string
  species: readonly { id: SpeciesId; label: string }[]
}[] = [
  {
    id: 'veggie',
    title: 'Hortaliça',
    species: [
      { id: 'lettuce', label: 'Alface' },
      { id: 'tomato', label: 'Tomate' },
      { id: 'carrot', label: 'Cenoura' },
    ],
  },
  { id: 'fruit', title: 'Fruta', species: [{ id: 'strawberry', label: 'Morango' }] },
  { id: 'grain', title: 'Cereal', species: [{ id: 'wheat', label: 'Trigo anão' }] },
  { id: 'flower', title: 'Flor', species: [{ id: 'zinnia', label: 'Zínia' }] },
]

export const GROWTH_STAGES = ['Sementes', 'Broto', 'Colheita'] as const

export const BLSS_LINKS: readonly { id: BlssLinkId; label: string; detail: string }[] = [
  { id: 'air', label: 'Ar', detail: 'As plantas pegam CO₂ e soltam oxigênio.' },
  { id: 'water', label: 'Água', detail: 'O vapor das folhas vira água limpa de novo.' },
  { id: 'nutrient', label: 'Nutrientes', detail: 'O que sobra da planta volta como alimento do solo.' },
]

export const LOGBOOK_EVENTS_M4 = [
  { id: 'right', label: 'Construção, plantio e operação da estufa bioregenerativa', correct: true },
  { id: 'storm', label: 'Limpeza dos painéis depois de uma tempestade', correct: false },
  { id: 'drill', label: 'Perfuração em busca de gelo', correct: false },
] as const

export function speciesLabel(id: SpeciesId): string {
  for (const group of PLANT_GROUPS) {
    const found = group.species.find((s) => s.id === id)
    if (found) return found.label
  }
  return id
}

export function groupOf(id: SpeciesId): PlantGroupId {
  const group = PLANT_GROUPS.find((g) => g.species.some((s) => s.id === id))
  return group?.id ?? 'veggie'
}
