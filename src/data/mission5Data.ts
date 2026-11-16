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

type Copy = { readonly en: string; readonly pt: string }

export const MISSION5_META = {
  solLabel: 'Sol 05',
  location: { en: 'ENVIRONMENTAL ALERT', pt: 'ALERTA AMBIENTAL' },
  title: { en: 'Alert! Storms on Mars', pt: 'Alerta! Tempestades em Marte' },
  panelWatts: 480,
} as const

export const NASA_CITATIONS_M5 = {
  dust: {
    en: 'NASA — Dust in the Wind: dust storms on Mars darken the sky and cover the panels.',
    pt: 'NASA — Dust in the Wind: tempestades de poeira em Marte escurecem o céu e cobrem os painéis.',
  },
  radiation: {
    en: 'NASA — Real Martians and the DONKI database: solar flares and CMEs send particles we cannot see.',
    pt: 'NASA — Real Martians e o banco DONKI: erupções solares e CMEs mandam partículas que a gente não vê.',
  },
  shield: {
    en: 'Good shielding puts hydrogen, like the hydrogen in water, together with a thick layer of regolith.',
    pt: 'A blindagem boa junta hidrogênio, como o da água, e uma camada grossa de regolito.',
  },
} as const

export const SCI_TERMS_M5: Record<string, Copy> = {
  'Tempestade de poeira': {
    en: 'Wind with dust. It blocks the sunlight and dirties the machines. You can see it.',
    pt: 'Vento com pó. Corta a luz do Sol e suja máquinas. Dá para ver.',
  },
  'Tempestade solar': {
    en: 'Invisible particles from a flare on the Sun. This is not the same as dust.',
    pt: 'Partículas invisíveis de uma erupção no Sol. Não é a mesma coisa que poeira.',
  },
  Regolito: {
    en: 'Loose dust and rock on Mars. A thick layer helps block radiation.',
    pt: 'Pó e pedra solta de Marte. Uma camada grossa ajuda a segurar radiação.',
  },
  CME: {
    en: 'A bubble of particles the Sun throws into space.',
    pt: 'Uma bolha de partículas que o Sol joga no espaço.',
  },
}

export const DUST_LATCHES: readonly { id: DustLatchId; title: Copy; detail: Copy }[] = [
  {
    id: 'alert',
    title: { en: '1. Read the alert', pt: '1. Ler o alerta' },
    detail: { en: 'The sensors report a regional dust storm.', pt: 'Os sensores marcam tempestade regional de poeira.' },
  },
  {
    id: 'return',
    title: { en: '2. Return to the habitat', pt: '2. Voltar ao habitat' },
    detail: { en: 'Stop the outdoor work and go inside now.', pt: 'Parar o trabalho lá fora e entrar agora.' },
  },
  {
    id: 'seal',
    title: { en: '3. Seal and filter', pt: '3. Vedar e filtrar' },
    detail: { en: 'Close the hatches and check the air filter.', pt: 'Fechar escotilhas e checar o filtro de ar.' },
  },
  {
    id: 'battery',
    title: { en: '4. Save the battery', pt: '4. Economizar bateria' },
    detail: {
      en: 'Protect what is outside and turn off what is not essential.',
      pt: 'Proteger o que está fora e desligar o que não é vital.',
    },
  },
]

export const SHELTERS: readonly { id: ShelterId; title: Copy; detail: Copy; safe: boolean }[] = [
  {
    id: 'greenhouse',
    title: { en: 'Glass greenhouse', pt: 'Estufa de vidro' },
    detail: { en: 'Little protection from the particles.', pt: 'Pouca proteção contra partículas.' },
    safe: false,
  },
  {
    id: 'surface',
    title: { en: 'Surface module', pt: 'Módulo de superfície' },
    detail: {
      en: 'It protects a little. Not enough for a strong solar storm.',
      pt: 'Protege um pouco. Não chega para uma tempestade solar forte.',
    },
    safe: false,
  },
  {
    id: 'shield',
    title: { en: 'Water and regolith shelter', pt: 'Abrigo com água e regolito' },
    detail: {
      en: 'Hydrogen in the water and the thick soil block the radiation.',
      pt: 'O hidrogênio da água e o solo grosso seguram a radiação.',
    },
    safe: true,
  },
]

export const INSPECTION_POINTS: readonly { id: InspectId; title: Copy; detail: Copy }[] = [
  {
    id: 'panels',
    title: { en: 'Solar panels', pt: 'Painéis solares' },
    detail: { en: 'Power is back to normal.', pt: 'Produção normalizada.' },
  },
  {
    id: 'habitat',
    title: { en: 'Habitat seal', pt: 'Vedação do habitat' },
    detail: { en: 'Pressure is ok.', pt: 'Pressurização ok.' },
  },
  {
    id: 'greenhouse',
    title: { en: 'Greenhouse', pt: 'Estufa' },
    detail: { en: 'Systems are intact.', pt: 'Sistemas intactos.' },
  },
  {
    id: 'antenna',
    title: { en: 'Antenna', pt: 'Antena' },
    detail: { en: 'Ready to talk with Earth.', pt: 'Pronta para falar com a Terra.' },
  },
]

export const EXPEDITION_MISSIONS: readonly Copy[] = [
  { en: 'Solar Energy', pt: 'Energia Solar' },
  { en: 'Human Health', pt: 'Saúde Humana' },
  { en: 'Geology and Water', pt: 'Geologia e Água' },
  { en: 'Space Farming', pt: 'Agricultura Espacial' },
  { en: 'Environmental Protection', pt: 'Proteção Ambiental' },
]

export const GAME_NASA_SOURCES: readonly Copy[] = [
  {
    en: 'NASA GISS Mars24 — where the Sun is on Mars.',
    pt: 'NASA GISS Mars24 — posição do Sol em Marte.',
  },
  {
    en: 'NASA — Photovoltaic Arrays for Martian Surface Power.',
    pt: 'NASA — Photovoltaic Arrays for Martian Surface Power.',
  },
  {
    en: 'NASA Spaceflight Standard Measures — crew health.',
    pt: 'NASA Spaceflight Standard Measures — saúde da tripulação.',
  },
  {
    en: 'NASA — First Ice Cores from Mars and the SHARAD radar (MRO).',
    pt: 'NASA — First Ice Cores from Mars e o radar SHARAD (MRO).',
  },
  {
    en: 'NASA — Veggie and Advanced Plant Habitat on the ISS.',
    pt: 'NASA — Veggie e Advanced Plant Habitat na ISS.',
  },
  {
    en: 'NASA — bioregenerative life support systems (BLSS).',
    pt: 'NASA — sistemas bioregenerativos de suporte à vida (BLSS).',
  },
  NASA_CITATIONS_M5.dust,
  NASA_CITATIONS_M5.radiation,
  NASA_CITATIONS_M5.shield,
]

export const CURATED_DONKI_ALERT: Copy = {
  en: 'A class M solar flare and a CME are on the way — data in the DONKI style.',
  pt: 'Erupção solar classe M e uma CME a caminho — dados no estilo DONKI.',
}
