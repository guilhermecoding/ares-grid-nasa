/** Missão 05 — Alerta! Tempestades em Marte, mais as cenas finais. */

export type Mission5Step =
  | 'intro'
  | 'step5_1_dust_storm'
  | 'step5_2_clean_panels'
  | 'step5_3_solar_radiation'
  | 'step5_4_post_storm_inspection'
  | 'step5_logbook_and_sleep'
  | 'scene6_earth_transmission'
  | 'scene7_ending'

export type Mission5Phase = 'play' | 'logbook' | 'night' | 'ending'

export interface Mission5Run {
  step: Mission5Step
  phase: Mission5Phase
  waterL: number
  waterPct: number
  sealed: DustLatchId[]
  windSafe: boolean
  panelsClean: boolean
  shelter: ShelterId | null
  shielded: boolean
  inspected: InspectId[]
  radiation: number
  integrity: number
}

export type DustLatchId = 'alert' | 'return' | 'seal' | 'battery'

export type ShelterId = 'greenhouse' | 'surface' | 'shield'

export type InspectId = 'panels' | 'habitat' | 'greenhouse' | 'antenna'

export const MISSION5_META = {
  solLabel: 'Sol 05',
  location: 'ALERTA AMBIENTAL',
  title: 'Alerta! Tempestades em Marte',
  panelWatts: 480,
} as const

export const NASA_CITATIONS_M5 = {
  dust: 'NASA — Dust in the Wind: tempestades de poeira em Marte escurecem o céu e cobrem os painéis.',
  radiation: 'NASA — Real Martians e o banco DONKI: erupções solares e CMEs mandam partículas que a gente não vê.',
  shield: 'A blindagem boa junta hidrogênio, como o da água, e uma camada grossa de regolito.',
} as const

export const SCI_TERMS_M5: Record<string, string> = {
  'Tempestade de poeira': 'Vento com pó. Corta a luz do Sol e suja máquinas. Dá para ver.',
  'Tempestade solar': 'Partículas invisíveis de uma erupção no Sol. Não é a mesma coisa que poeira.',
  Regolito: 'Pó e pedra solta de Marte. Uma camada grossa ajuda a segurar radiação.',
  CME: 'Uma bolha de partículas que o Sol joga no espaço.',
}

export const DUST_LATCHES: readonly { id: DustLatchId; title: string; detail: string }[] = [
  { id: 'alert', title: '1. Ler o alerta', detail: 'Os sensores marcam tempestade regional de poeira.' },
  { id: 'return', title: '2. Voltar ao habitat', detail: 'Parar o trabalho lá fora e entrar agora.' },
  { id: 'seal', title: '3. Vedar e filtrar', detail: 'Fechar escotilhas e checar o filtro de ar.' },
  { id: 'battery', title: '4. Economizar bateria', detail: 'Proteger o que está fora e desligar o que não é vital.' },
]

export const SHELTERS: readonly { id: ShelterId; title: string; detail: string; safe: boolean }[] = [
  { id: 'greenhouse', title: 'Estufa de vidro', detail: 'Pouca proteção contra partículas.', safe: false },
  { id: 'surface', title: 'Módulo de superfície', detail: 'Protege um pouco. Não chega para uma tempestade solar forte.', safe: false },
  { id: 'shield', title: 'Abrigo com água e regolito', detail: 'O hidrogênio da água e o solo grosso seguram a radiação.', safe: true },
]

export const INSPECTION_POINTS: readonly { id: InspectId; title: string; detail: string }[] = [
  { id: 'panels', title: 'Painéis solares', detail: 'Produção normalizada.' },
  { id: 'habitat', title: 'Vedação do habitat', detail: 'Pressurização ok.' },
  { id: 'greenhouse', title: 'Estufa', detail: 'Sistemas intactos.' },
  { id: 'antenna', title: 'Antena', detail: 'Pronta para falar com a Terra.' },
]

export const EXPEDITION_MISSIONS = [
  'Energia Solar',
  'Saúde Humana',
  'Geologia e Água',
  'Agricultura Espacial',
  'Proteção Ambiental',
] as const

export const GAME_NASA_SOURCES = [
  'NASA GISS Mars24 — posição do Sol em Marte.',
  'NASA — Photovoltaic Arrays for Martian Surface Power.',
  'NASA Spaceflight Standard Measures — saúde da tripulação.',
  'NASA — First Ice Cores from Mars e o radar SHARAD (MRO).',
  'NASA — Veggie e Advanced Plant Habitat na ISS.',
  'NASA — sistemas bioregenerativos de suporte à vida (BLSS).',
  NASA_CITATIONS_M5.dust,
  NASA_CITATIONS_M5.radiation,
  NASA_CITATIONS_M5.shield,
] as const

export const CURATED_DONKI_ALERT = 'Erupção solar classe M e uma CME a caminho — dados no estilo DONKI.'
