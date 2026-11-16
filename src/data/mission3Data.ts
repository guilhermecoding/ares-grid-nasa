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
export type MapLayerId = 'surface' | 'radar' | 'studies' | 'terrain' | 'ice'

export type ProcessStepId = 'identify' | 'separate' | 'melt' | 'filter' | 'treat' | 'quality'

export type PotabilityId = 'ph' | 'conductivity' | 'chemicals' | 'metals' | 'microbes' | 'treatment'


export const MISSION3_META = {
  solLabel: 'Sol 03',
  location: 'Arcadia Planitia',
  lat: '40.0° N',
  lon: '180.0° W',
} as const

/** Official citations shown in panels / logbook. */
export const NASA_CITATIONS = {
  iceCores:
    'NASA — Relatório First Ice Cores from Mars (sensoriamento remoto, radar, geologia e perfuração exploratória).',
  sharad:
    'Mars Reconnaissance Orbiter (MRO) — instrumento SHARAD (radar orbital de subsuperfície em Arcadia Planitia).',
} as const

export const NASA_CITATIONS_EN = {
  iceCores:
    'NASA — First Ice Cores from Mars report (remote sensing, radar, geology, and test drilling).',
  sharad:
    'Mars Reconnaissance Orbiter (MRO) — SHARAD instrument (an orbital radar that looks under the ground at Arcadia Planitia).',
} as const

export const WATER_REWARD_L = 50
export const WRONG_SITE_ENERGY_COST = 8
export const PROCESS_STEP_ENERGY = 4
export const RETREAT_ENERGY_COST = 6
export const IDEAL_SITE: SiteId = 'beta'

export const SCI_TERMS_M3: Record<string, string> = {
  'Radar SHARAD': 'Radar do satélite MRO que “enxerga” gelo escondido sob o solo.',
  Subsolo: 'Camadas de terra e gelo abaixo da superfície de Marte.',
  Amostra: 'Pedacinho de gelo/solo guardado para estudar na base.',
  'Condutividade Elétrica': 'Mede quanto sal tem na água. Sal demais deixa a água imprópria para beber.',
  Potabilidade: 'Quer dizer: a água está segura para beber?',
  Regolito: 'Poeira e cascalho soltos na superfície de Marte.',
  Percloratos: 'Sais do solo marciano que precisam ser limpos da água.',
  'Ice Core': 'Cilindro de gelo tirado do subsolo pela broca.',
  Criogênico: 'Bem gelado, para a amostra não derreter nem mudar.',
}

export const SCI_TERMS_M3_EN: Record<string, string> = {
  'SHARAD radar': 'A radar on the MRO satellite that can “see” ice hiding under the ground.',
  Subsurface: 'Layers of soil and ice under the surface of Mars.',
  Sample: 'A small piece of ice or soil saved so we can study it at the base.',
  'Electrical conductivity': 'It tells how much salt is in the water. Too much salt means you should not drink it.',
  Potability: 'It means: is this water safe to drink?',
  Regolith: 'Loose dust and gravel on the surface of Mars.',
  Perchlorates: 'Salts in Martian soil that we must clean out of the water.',
  'Ice core': 'A cylinder of ice the drill pulls up from underground.',
  Cryogenic: 'Very cold, so the sample does not melt or change.',
}

export const INTRO_PARTS_M3 = [
  ['Arcadia Planitia esconde gelo sob a poeira!', 'Mas cientistas não furam o chão sem dados.'],
  ['Vamos ouvir o radar, ler estudos da NASA', 'e só então fazer pequenas perfurações.'],
] as const

export const INTRO_PARTS_M3_EN = [
  ['Arcadia Planitia hides ice under the dust!', 'But scientists do not dig down without data.'],
  ['We will listen to the radar, read NASA studies,', 'and only then start drilling.'],
] as const

export const INTRO_HIGHLIGHT_WORDS_M3 = ['radar', 'NASA', 'perfurações'] as const

export const INTRO_HIGHLIGHT_WORDS_M3_EN = ['radar', 'NASA', 'drilling'] as const

export const METHODOLOGY_STEPS = [
  {
    id: 'radar',
    title: 'Análise de Dados de Radar (SHARAD / MRO)',
    titleEn: 'Radar Data Check (SHARAD / MRO)',
    detail: 'Ondas de radar enviadas da órbita refletem de forma diferente quando encontram gelo abaixo do solo.',
    detailEn: 'Radar waves sent from orbit bounce back in a different way when they hit ice under the ground.',
  },
  {
    id: 'studies',
    title: 'Estudo Prévio da NASA',
    titleEn: 'Earlier NASA Study',
    detail: 'Consultar mapas geológicos e descobertas anteriores para não repetir pesquisas nem arriscar equipamentos.',
    detailEn: 'Look at geologic maps and older finds so we do not repeat work or risk the equipment.',
  },
  {
    id: 'explore',
    title: 'Pequenas Perfurações Exploratórias',
    titleEn: 'Small Test Drills',
    detail: 'Validar no local se o que o radar mostrou realmente existe no subsolo.',
    detailEn: 'Check on the ground that what the radar showed is really under the surface.',
  },
] as const

export const MAP_LAYERS: { id: MapLayerId; label: string; labelEn: string }[] = [
  { id: 'surface', label: 'Imagens da Superfície', labelEn: 'Surface Pictures' },
  { id: 'radar', label: 'Dados de Radar Orbital (SHARAD)', labelEn: 'Orbital Radar Data (SHARAD)' },
  { id: 'studies', label: 'Estudos Anteriores da NASA', labelEn: 'Earlier NASA Studies' },
  { id: 'terrain', label: 'Características e Estabilidade do Terreno', labelEn: 'Ground Shape and Stability' },
  { id: 'ice', label: 'Áreas de Possíveis Depósitos de Gelo', labelEn: 'Places That May Hold Ice' },
]

/** Layers the player must inspect before confirming a site. */
export const REQUIRED_MAP_LAYERS: readonly MapLayerId[] = ['radar', 'studies', 'terrain', 'ice']

export interface SiteInfo {
  id: SiteId
  name: string
  nameEn: string
  short: string
  shortEn: string
  ideal: boolean
  radar: 'Forte' | 'Moderado' | 'Sem sinal'
  radarEn: string
  studies: string
  studiesEn: string
  terrain: 'Plano e estável' | 'Instável' | 'Plano'
  terrainEn: string
  iceHint: boolean
  rejectReason: readonly string[]
  rejectReasonEn: readonly string[]
  color: string
  leftPct: number
  topPct: number
}

export const SITES: SiteInfo[] = [
  {
    id: 'alpha',
    name: 'Setor Alfa',
    nameEn: 'Sector Alpha',
    short: 'Encosta Rochosa',
    shortEn: 'Rocky Slope',
    ideal: false,
    radar: 'Moderado',
    radarEn: 'Medium',
    studies: 'Poucos dados',
    studiesEn: 'Little data',
    terrain: 'Instável',
    terrainEn: 'Unstable',
    iceHint: true,
    rejectReason: [
      'O radar mostra um sinal moderado, mas a encosta é instável.',
      'A perfuradora pode tombar e quebrar a broca. Escolha um terreno seguro!',
    ],
    rejectReasonEn: [
      'The radar shows a medium signal, but the slope is unstable.',
      'The drill could tip over and break the bit. Pick a safe place!',
    ],
    color: '#f97316',
    leftPct: 22,
    topPct: 58,
  },
  {
    id: 'beta',
    name: 'Setor Beta',
    nameEn: 'Sector Beta',
    short: 'Planície Estável Norte',
    shortEn: 'Stable Northern Plain',
    ideal: true,
    radar: 'Forte',
    radarEn: 'Strong',
    studies: 'Gelo confirmado',
    studiesEn: 'Ice confirmed',
    terrain: 'Plano e estável',
    terrainEn: 'Flat and stable',
    iceHint: true,
    rejectReason: [],
    rejectReasonEn: [],
    color: '#38bdf8',
    leftPct: 52,
    topPct: 38,
  },
  {
    id: 'gamma',
    name: 'Setor Gama',
    nameEn: 'Sector Gamma',
    short: 'Cratera Rasa',
    shortEn: 'Shallow Crater',
    ideal: false,
    radar: 'Sem sinal',
    radarEn: 'No signal',
    studies: 'Sem gelo',
    studiesEn: 'No ice',
    terrain: 'Plano',
    terrainEn: 'Flat',
    iceHint: false,
    rejectReason: [
      'O terreno é plano, mas o radar e os estudos anteriores não mostram gelo.',
      'Perfurar aqui gastaria energia à toa. Procure o sinal de gelo!',
    ],
    rejectReasonEn: [
      'The ground is flat, but the radar and the older studies do not show ice.',
      'Drilling here would waste energy. Look for the ice signal!',
    ],
    color: '#a78bfa',
    leftPct: 76,
    topPct: 64,
  },
]

export const BETA_CONFIRM_LINES = [
  'Setor Beta confirmado: forte reflexão no SHARAD, gelo nos estudos e chão plano!',
  'Hora da pequena perfuração exploratória.',
] as const

export const BETA_CONFIRM_LINES_EN = [
  'Sector Beta confirmed: a strong SHARAD reflection, ice in the studies, and flat ground!',
  'Time for a small test drill.',
] as const

/* ───────────── Desafio 3.3 — perfuração ───────────── */

export const DRILL_TARGET_M = 2.2

export interface DrillLayer {
  id: 'dust' | 'regolith' | 'rock' | 'frozen' | 'ice'
  label: string
  labelEn: string
  from: number
  to: number
  color: string
  /** Metres per second while the button is held. */
  speed: number
  /** Heat gained per second while drilling (% of the bar). */
  heat: number
}

export const DRILL_LAYERS: readonly DrillLayer[] = [
  { id: 'dust', label: 'Poeira superficial', labelEn: 'Surface dust', from: 0, to: 0.2, color: '#c47848', speed: 0.34, heat: 14 },
  { id: 'regolith', label: 'Regolito com cascalho', labelEn: 'Regolith with gravel', from: 0.2, to: 0.8, color: '#8a4a28', speed: 0.26, heat: 22 },
  { id: 'rock', label: 'Camada Rochosa Densa', labelEn: 'Dense rock layer', from: 0.8, to: 1.5, color: '#5a3424', speed: 0.13, heat: 62 },
  { id: 'frozen', label: 'Solo congelado', labelEn: 'Frozen soil', from: 1.5, to: 2.0, color: '#6f8fa6', speed: 0.2, heat: 30 },
  { id: 'ice', label: 'Depósito de Gelo Subterrâneo', labelEn: 'Underground ice deposit', from: 2.0, to: 2.6, color: '#9fe3ff', speed: 0.18, heat: 26 },
] as const

/** Heat lost per second while the button is released. */
export const DRILL_COOL_RATE = 48
export const DRILL_OVERHEAT_LOCK_MS = 2500
/** Depths written to the log on the way down. */
export const DRILL_LOG_DEPTHS_M = [0.5, 1.2, 1.8, DRILL_TARGET_M] as const
export const DRILL_ENERGY_PER_LOG = 2
export const DRILL_OVERHEAT_ENERGY = 2

export function drillLayerAt(depth: number): DrillLayer {
  return DRILL_LAYERS.find((layer) => depth < layer.to) ?? DRILL_LAYERS[DRILL_LAYERS.length - 1]!
}

export function formatDepth(depth: number, locale: 'en' | 'pt' = 'en'): string {
  const rounded = depth.toFixed(1)
  const shown = locale === 'pt' ? rounded.replace('.', ',') : rounded
  return `${shown} m`
}

export const CAPI_DRILL = {
  start: 'Segure o botão para a broca descer. Fique de olho na temperatura!',
  rock: 'Camada rochosa! O atrito esquenta a broca. Solte por 1 ou 2 segundos para esfriar.',
  overheat: 'Superaqueceu! Pulse o botão em vez de segurar direto. A broca destrava já já.',
  done: [
    'Gelo encontrado a 2,2 m! A pequena perfuração confirma a hipótese aqui neste ponto.',
    'Sozinha, ela não mostra o tamanho total do depósito. Para isso a NASA junta radar e mais furos.',
  ],
} as const

export const CAPI_DRILL_EN = {
  start: 'Hold the button so the drill goes down. Keep an eye on the temperature!',
  rock: 'Rocky layer! Rubbing makes the drill hot. Let go for 1 or 2 seconds so it can cool.',
  overheat: 'Too hot! Tap the button in short presses instead of holding it down. The drill unlocks in a moment.',
  done: [
    'Ice found at 2.2 m! This small drill confirms the idea at this spot.',
    'On its own, this hole does not show how big the whole ice deposit is. NASA uses radar and more holes for that.',
  ],
} as const

/* ───────────── Desafio 3.4 — coleta ───────────── */

export const SCRUB_CLEAN_GOAL = 0.9
export const CRYO_SEAL_C = -73

export const CAPI_SAMPLE = {
  scrub: 'Esfregue a crosta de regolito até os cristais de gelo aparecerem.',
  drag: 'Limpinho! Agora arraste o cilindro para o recipiente térmico.',
  sealed: 'Selo criogênico ativo a −73 °C. Uma parte vai para a base, outra fica guardada para a Terra.',
} as const

export const CAPI_SAMPLE_EN = {
  scrub: 'Rub off the regolith crust until the ice crystals show.',
  drag: 'All clean! Now drag the cylinder into the cold container.',
  sealed: 'Cryogenic seal on at −73 °C. One part goes to the base. The other stays stored for Earth.',
} as const

/* ───────────── Desafio 3.5 — laboratório ───────────── */

export const PROCESS_STEPS: {
  id: ProcessStepId
  title: string
  titleEn: string
  detail: string
  detailEn: string
  energyCost: number
}[] = [
  {
    id: 'identify',
    title: 'Identificar o material congelado',
    titleEn: 'Identify the frozen material',
    detail: 'Confirmar que é gelo misturado ao solo.',
    detailEn: 'Check that it is ice mixed with soil.',
    energyCost: PROCESS_STEP_ENERGY,
  },
  {
    id: 'separate',
    title: 'Separar partículas grossas do solo',
    titleEn: 'Separate the large soil bits',
    detail: 'Retirar pedrinhas e regolito maior.',
    detailEn: 'Take out pebbles and bigger regolith.',
    energyCost: PROCESS_STEP_ENERGY,
  },
  {
    id: 'melt',
    title: 'Derreter o gelo em câmara controlada',
    titleEn: 'Melt the ice in a heated chamber',
    detail: 'Câmara aquecida com energia da base.',
    detailEn: 'A warm chamber that uses energy from the base.',
    energyCost: PROCESS_STEP_ENERGY + 2,
  },
  {
    id: 'filter',
    title: 'Filtrar partículas em suspensão',
    titleEn: 'Filter the floating bits',
    detail: 'Remover o que ainda flutua na água.',
    detailEn: 'Take out what is still floating in the water.',
    energyCost: PROCESS_STEP_ENERGY,
  },
  {
    id: 'treat',
    title: 'Remover contaminantes químicos',
    titleEn: 'Remove chemical contaminants',
    detail: 'Tratamento contra sais e percloratos.',
    detailEn: 'A treatment that cleans salts and perchlorates.',
    energyCost: PROCESS_STEP_ENERGY + 1,
  },
  {
    id: 'quality',
    title: 'Encaminhar para verificação de qualidade',
    titleEn: 'Send it for a quality check',
    detail: 'Mandar a amostra ao teste de potabilidade.',
    detailEn: 'Send the sample to the drinkability test.',
    energyCost: 2,
  },
]

/* ───────────── Desafio 3.6 — potabilidade ───────────── */

export const POTABILITY_INDICATORS: {
  id: PotabilityId
  label: string
  labelEn: string
  safe: string
  safeEn: string
  unsafe?: string
  unsafeEn?: string
  /** First analysis fails this one until re-treatment. */
  failsInitially: boolean
}[] = [
  { id: 'ph', label: 'pH', labelEn: 'pH', safe: '7,1 · neutro', safeEn: '7.1 · neutral', failsInitially: false },
  {
    id: 'conductivity',
    label: 'Condutividade elétrica e sais',
    labelEn: 'Electrical conductivity and salts',
    safe: '320 µS/cm · seguro',
    safeEn: '320 µS/cm · safe',
    unsafe: '2.400 µS/cm · sal demais',
    unsafeEn: '2,400 µS/cm · too much salt',
    failsInitially: true,
  },
  {
    id: 'chemicals',
    label: 'Contaminantes químicos',
    labelEn: 'Chemical contaminants',
    safe: 'Percloratos removidos',
    safeEn: 'Perchlorates removed',
    failsInitially: false,
  },
  {
    id: 'metals',
    label: 'Metais indesejados',
    labelEn: 'Unwanted metals',
    safe: 'Abaixo do limite',
    safeEn: 'Below the limit',
    failsInitially: false,
  },
  {
    id: 'microbes',
    label: 'Indicadores microbiológicos',
    labelEn: 'Microbe signs',
    safe: 'Nenhum detectado',
    safeEn: 'None found',
    failsInitially: false,
  },
  {
    id: 'treatment',
    label: 'Eficiência do tratamento',
    labelEn: 'How well the treatment worked',
    safe: '99%',
    safeEn: '99%',
    failsInitially: false,
  },
]

export const CAPI_POTABILITY = {
  fail: [
    'A água parece transparente, mas tem sais do solo marciano escondidos!',
    'Não dá para beber assim. Execute um novo tratamento e repita a análise.',
  ],
  pass: ['Todos os indicadores verdes: APROVADO PARA CONSUMO!', `+${WATER_REWARD_L} L de água potável para a base.`],
} as const

export const CAPI_POTABILITY_EN = {
  fail: [
    'The water looks clear, but salts from the Martian soil are hiding in it!',
    'You cannot drink it like this. Run the treatment again and repeat the test.',
  ],
  pass: ['Every indicator is green: SAFE TO DRINK!', `+${WATER_REWARD_L} L of drinking water for the base.`],
} as const

export function isCrossSectionStep(step: Mission3Step): boolean {
  return step === 'step3_3_drilling' || step === 'step3_4_sample_collection'
}
