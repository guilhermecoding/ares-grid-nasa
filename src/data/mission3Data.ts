/** Missão 03 — O Mistério do Gelo de Marte (Arcadia Planitia). */

export type Mission3Step =
  | 'intro'
  | 'step3_1_methodology'
  | 'step3_2_layered_map'
  | 'step3_3_drilling'
  | 'step3_4_sample_collection'
  | 'step3_5_ice_processing'
  | 'step3_6_potability_test'
  | 'step3_logbook_and_ship'

export type SiteId = 'alpha' | 'beta' | 'gamma'
export type MapLayerId =
  | 'surface'
  | 'radar'
  | 'studies'
  | 'terrain'
  | 'ice'

export type ProcessStepId =
  | 'identify'
  | 'separate'
  | 'melt'
  | 'filter'
  | 'treat'
  | 'quality'

export type PotabilityId =
  | 'ph'
  | 'conductivity'
  | 'chemicals'
  | 'metals'
  | 'microbes'
  | 'treatment'

/** Official citations shown in panels / logbook. */
export const NASA_CITATIONS = {
  iceCores:
    'NASA — Relatório First Ice Cores from Mars (sensoriamento remoto, radar, geologia e perfuração exploratória).',
  sharad:
    'Mars Reconnaissance Orbiter (MRO) — instrumento SHARAD (radar orbital de subsuperfície em Arcadia Planitia).',
} as const

export const WATER_REWARD_L = 50
export const DRILL_ENERGY_COST = 5
export const WRONG_SITE_ENERGY_COST = 8
export const PROCESS_STEP_ENERGY = 4
export const RETREAT_ENERGY_COST = 6
export const IDEAL_SITE: SiteId = 'beta'

export const DRILL_DEPTHS_M = [0.5, 1.2, 1.8] as const

export const SCI_TERMS_M3: Record<string, string> = {
  'Radar SHARAD': 'Radar do satélite MRO que “enxerga” gelo escondido sob o solo.',
  Subsolo: 'Camadas de terra e gelo abaixo da superfície de Marte.',
  Amostra: 'Pedacinho de gelo/solo guardado para estudar na base.',
  'Condutividade Elétrica': 'Mede quanto sal tem na água — sal demais não é boa para beber.',
  Potabilidade: 'Quer dizer: a água está segura para beber?',
  Regolito: 'Poeira e cascalho soltos na superfície de Marte.',
  Percloratos: 'Sais do solo marciano que precisam ser limpos da água.',
}

export const INTRO_PARTS_M3 = [
  [
    'Arcadia Planitia esconde gelo sob a poeira!',
    'Mas cientistas não furam o chão sem dados.',
  ],
  [
    'Vamos ouvir o radar, ler estudos da NASA',
    'e só então fazer pequenas perfurações.',
  ],
] as const

export const INTRO_HIGHLIGHT_WORDS_M3 = ['radar', 'NASA', 'perfurações'] as const

export const METHODOLOGY_STEPS = [
  {
    id: 'radar',
    title: 'Análise de Radar (SHARAD / MRO)',
    detail:
      'Ondas de radar da órbita refletem diferente quando encontram gelo no subsolo.',
  },
  {
    id: 'studies',
    title: 'Estudo Prévio da NASA',
    detail:
      'Consultamos mapas e descobertas antigas para não arriscar equipamentos à toa.',
  },
  {
    id: 'explore',
    title: 'Perfurações Exploratórias',
    detail:
      'Furinhos de teste confirmam se o que o radar mostrou existe de verdade.',
  },
] as const

export const MAP_LAYERS: { id: MapLayerId; label: string }[] = [
  { id: 'surface', label: 'Imagens da Superfície' },
  { id: 'radar', label: 'Dados de Radar Orbital (SHARAD)' },
  { id: 'studies', label: 'Estudos Anteriores da NASA' },
  { id: 'terrain', label: 'Características e Estabilidade do Terreno' },
  { id: 'ice', label: 'Áreas de Possíveis Depósitos de Gelo' },
]

export interface SiteInfo {
  id: SiteId
  name: string
  short: string
  ideal: boolean
  radar: 'forte' | 'moderado' | 'fraco'
  terrain: 'estavel' | 'instavel' | 'plano'
  iceHint: boolean
  rejectReason: string
  color: string
  leftPct: number
  topPct: number
}

export const SITES: SiteInfo[] = [
  {
    id: 'alpha',
    name: 'Setor Alfa',
    short: 'Encosta Rochosa',
    ideal: false,
    radar: 'moderado',
    terrain: 'instavel',
    iceHint: true,
    rejectReason:
      'O radar mostra algo, mas o terreno é instável — a broca pode quebrar na encosta!',
    color: '#f97316',
    leftPct: 22,
    topPct: 58,
  },
  {
    id: 'beta',
    name: 'Setor Beta',
    short: 'Planície Estável Norte',
    ideal: true,
    radar: 'forte',
    terrain: 'estavel',
    iceHint: true,
    rejectReason: '',
    color: '#38bdf8',
    leftPct: 52,
    topPct: 42,
  },
  {
    id: 'gamma',
    name: 'Setor Gama',
    short: 'Cratera Rasa',
    ideal: false,
    radar: 'fraco',
    terrain: 'plano',
    iceHint: false,
    rejectReason:
      'Terreno plano, mas sem indícios de gelo no radar nem nos estudos anteriores.',
    color: '#a78bfa',
    leftPct: 72,
    topPct: 62,
  },
]

export const SAMPLE_STEPS = [
  {
    id: 'separate',
    title: 'Separar o material',
    detail: 'Tire o gelo com cuidado — sem misturar poeira da superfície.',
  },
  {
    id: 'register',
    title: 'Registrar coordenadas',
    detail: 'Anote onde e a que profundidade a amostra foi tirada.',
  },
  {
    id: 'store',
    title: 'Armazenar no recipiente térmico',
    detail: 'Uma parte para a base, outra preservada para a Terra.',
  },
] as const

export const PROCESS_STEPS: {
  id: ProcessStepId
  title: string
  detail: string
  energyCost: number
}[] = [
  {
    id: 'identify',
    title: 'Identificar o material congelado',
    detail: 'Confirme que é gelo misturado ao solo.',
    energyCost: PROCESS_STEP_ENERGY,
  },
  {
    id: 'separate',
    title: 'Separar partículas grossas',
    detail: 'Retire pedrinhas e regolito maior.',
    energyCost: PROCESS_STEP_ENERGY,
  },
  {
    id: 'melt',
    title: 'Derreter o gelo',
    detail: 'Câmara controlada — gasta energia da base.',
    energyCost: PROCESS_STEP_ENERGY + 2,
  },
  {
    id: 'filter',
    title: 'Filtrar partículas',
    detail: 'Remova o que ainda flutua na água.',
    energyCost: PROCESS_STEP_ENERGY,
  },
  {
    id: 'treat',
    title: 'Tratar contaminantes',
    detail: 'Limpe sais e percloratos químicos.',
    energyCost: PROCESS_STEP_ENERGY + 1,
  },
  {
    id: 'quality',
    title: 'Encaminhar para verificação',
    detail: 'Mande a amostra para o teste de potabilidade.',
    energyCost: 2,
  },
]

export const POTABILITY_INDICATORS: {
  id: PotabilityId
  label: string
  /** First-pass fails this one until re-treatment. */
  failsInitially: boolean
}[] = [
  { id: 'ph', label: 'pH', failsInitially: false },
  { id: 'conductivity', label: 'Condutividade e sais', failsInitially: true },
  { id: 'chemicals', label: 'Contaminantes químicos', failsInitially: false },
  { id: 'metals', label: 'Metais indesejados', failsInitially: false },
  { id: 'microbes', label: 'Indicadores microbiológicos', failsInitially: false },
  { id: 'treatment', label: 'Eficiência do tratamento', failsInitially: false },
]

export function isCrossSectionStep(step: Mission3Step): boolean {
  return step === 'step3_3_drilling' || step === 'step3_4_sample_collection'
}
