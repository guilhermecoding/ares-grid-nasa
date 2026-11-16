/** Mission 01 scientific copy & Capi lines. Sources cited below. */

export type Mission1Step =
  | 'intro'
  | 'replay_intro'
  | 'replay_idle'
  | 'risk_warning'
  | 'step1_location'
  | 'step2_solar_calc'
  | 'step3_panel_test'
  | 'step4_logbook'
  | 'step5_transmission'

/** Surface EVA: wellbeing drains to 0 over this duration while outdoors. */
export const EXPOSURE_MS = 180_000

/** Short Capi parts — one dialog box each. */
export const RISK_WARNING_PARTS = [
  [{ en: 'Outside, there are risks: radiation, dust, and cold.', pt: 'Lá fora há riscos: radiação, poeira e frio.' }],
  [
    { en: 'Stay out too long and your Health drops.', pt: 'Ficar tempo demais derruba a Saúde.' },
    { en: 'Be quick and come back!', pt: 'Rápido e de volta!' },
  ],
] as const

export const RISK_HIGHLIGHT_WORDS = {
  en: ['Health'] as const,
  pt: ['Saúde'] as const,
}

export const MISSION1_META = {
  number: 1,
  gateTitle: { en: 'POWER TO EXPLORE MARS', pt: 'ENERGIA PARA EXPLORAR MARTE' },
  shortTitle: { en: 'Solar Power', pt: 'Energia Solar' },
  lat: '40.0° N',
  lon: '180.0° W',
  sources: [
    {
      en: 'NASA GISS Mars24 Algorithm — where the Sun is on Mars',
      pt: 'NASA GISS Mars24 Algorithm — posição do Sol em Marte',
    },
    {
      en: 'Photovoltaic Arrays for Martian Surface Power (NASA)',
      pt: 'Photovoltaic Arrays for Martian Surface Power (NASA)',
    },
  ],
} as const

export const SCI_TERMS_EN = {
  'Arcadia Planitia': 'A large, fairly flat plain on Mars.',
  Azimuth: 'The direction of the Sun along the horizon: east, south, or west.',
  'Solar Elevation': 'How high the Sun is in the sky. Higher means more light!',
  Photovoltaic: 'A panel that turns sunlight into electricity.',
  Sun: 'From Mars, the Sun looks smaller, but it still gives heat and power.',
} as const

export const SCI_TERMS_PT = {
  'Arcadia Planitia': 'Uma planície grande e relativamente plana em Marte.',
  Azimute: 'A direção do Sol no horizonte: leste, sul ou oeste.',
  'Elevação Solar': 'Quão alto o Sol está no céu — mais alto = mais luz!',
  Fotovoltaico: 'Painel que transforma luz do Sol em eletricidade.',
  Sol: 'O Sol de Marte parece menor, mas ainda aquece e dá energia.',
} as const

/** Short Capi parts — one dialog box each. */
export const INTRO_PARTS = [
  [
    { en: 'We made it to Mars!', pt: 'Chegamos a Marte!' },
    { en: 'But there is no power source here yet.', pt: 'Mas aqui não há fonte de energia ainda.' },
  ],
  [
    {
      en: "Let's install a solar panel so the base can run.",
      pt: 'Vamos instalar um painel solar para a base funcionar.',
    },
  ],
] as const

export const INTRO_HIGHLIGHT_WORDS = {
  en: ['solar panel'] as const,
  pt: ['painel solar'] as const,
}

/** Shown when re-entering Missão 01 after the panel was already set up. */
export const REPLAY_INTRO_PARTS = [
  [{ en: 'You were here a little while ago.', pt: 'Você esteve aqui há pouco tempo.' }],
  [{ en: 'The solar panel is already set up.', pt: 'O painel solar já está configurado.' }],
] as const

export const REPLAY_INTRO_HIGHLIGHT_WORDS = {
  en: ['solar panel'] as const,
  pt: ['painel solar'] as const,
}

/** Cooldown between panel cleans on Missão 01 replay visits. */
export const PANEL_CLEAN_COOLDOWN_MS = 5 * 60_000
export const PANEL_CLEAN_EFFICIENCY_GAIN = 4
export const PANEL_CLEAN_ENERGY_GAIN = 10
/** While base energy is at or below this, cleaning ignores the cooldown. */
export const PANEL_CLEAN_EMERGENCY_MAX = 40
export const PANEL_CLEAN_EFFICIENCY_CAP = 98

export function isOutdoorMission1Step(step: Mission1Step): boolean {
  return step === 'step1_location' || step === 'step2_solar_calc' || step === 'step3_panel_test'
}

/** Outcome of the panel-condition test that replaced the dust-storm screen. */
export type PanelTestChoice = 'clean' | 'dust'

/** Shown efficiency while dust covers the cells (about a 65% drop). */
export const PANEL_TEST_DUST_EFFICIENCY_FACTOR = 0.35
/** Energy left in the base after the dusty test. */
export const PANEL_TEST_DUST_ENERGY_FACTOR = 0.55
export const PANEL_TEST_DUST_WATER_COST = 6
export const PANEL_TEST_CLEAN_WATER_COST = 3

export const DUST_DROP_PARTS = [
  [
    {
      en: 'Did you notice the solar panel lost efficiency after the storm?',
      pt: 'Percebeu que a eficiência da placa solar caiu depois da tempestade?',
    },
    { en: 'Can you guess why?', pt: 'Você imagina por quê?' },
  ],
  [
    {
      en: 'Fine dust covers the cells on the panel.',
      pt: 'A poeira fina cobre as células do painel.',
    },
    {
      en: 'It blocks the sunlight, so the panel makes less electricity.',
      pt: 'Ela bloqueia a luz do Sol, e o painel gera menos eletricidade.',
    },
  ],
] as const

export const DUST_HIGHLIGHT_WORDS = {
  en: ['dust'] as const,
  pt: ['poeira'] as const,
}

export const CLEAN_RESULT_PARTS = [
  [
    {
      en: 'Nice cleaning! With the dust gone, more light reaches the cells.',
      pt: 'Boa limpeza! Sem poeira, mais luz chega às células.',
    },
  ],
  [
    {
      en: 'Efficiency goes up. Cleaning uses a little of the water reserve.',
      pt: 'A eficiência sobe. A limpeza gasta um pouco da reserva de água.',
    },
  ],
] as const

export const PANEL_TEST_OPTIONS = [
  {
    id: 'dust' as const,
    name: { en: 'Aging + dust', pt: 'Envelhecer + poeira' },
    pros: [
      { en: 'Shows what dust really does', pt: 'Mostra o efeito real da poeira' },
      { en: 'You can see the drop right away', pt: 'Dá para ver a queda na hora' },
    ],
    cons: [
      { en: 'Efficiency drops by about 65%', pt: 'Eficiência cai cerca de 65%' },
      { en: 'Energy and water go down', pt: 'Energia e água diminuem' },
    ],
  },
  {
    id: 'clean' as const,
    name: { en: 'Cleaning', pt: 'Limpeza' },
    pros: [
      { en: 'Clears the dust off the cells', pt: 'Tira a poeira das células' },
      { en: 'Efficiency and energy go up', pt: 'Eficiência e energia sobem' },
    ],
    cons: [{ en: 'Uses a little of the water reserve', pt: 'Gasta um pouco da reserva de água' }],
  },
] as const

export type SiteId = 'A' | 'B' | 'C'

export const INSTALL_SITES = [
  {
    id: 'A' as const,
    name: { en: 'Shaded Valley', pt: 'Vale Sombreado' },
    leftPct: 22,
    topPct: 58,
    pros: [
      { en: 'Blocks the wind well', pt: 'Protege bem do vento' },
      { en: 'Tall rocks right beside it', pt: 'Rochas altas ao lado' },
    ],
    cons: [
      { en: 'It sits in shade for half the day', pt: 'Fica na sombra metade do dia' },
      { en: 'It makes less power', pt: 'Gera menos energia' },
    ],
    ideal: false,
    capiFeedback: {
      en: 'Good shelter! But the shade blocks the light. On Mars, we need as much sun as we can get.',
      pt: 'Boa proteção! Mas a sombra corta a luz. Em Marte, precisamos de sol o máximo possível.',
    },
  },
  {
    id: 'B' as const,
    name: { en: 'Open Northern Plain', pt: 'Planície Aberta Norte' },
    leftPct: 52,
    topPct: 48,
    pros: [
      { en: 'Sun all day long', pt: 'Sol o dia todo' },
      { en: 'Easy to brush the dust off', pt: 'Fácil limpar a poeira' },
      { en: 'Far from the rover route', pt: 'Longe da rota do rover' },
    ],
    cons: [
      { en: 'More dust blows in on the wind', pt: 'Mais poeira no vento' },
      { en: 'Less natural shelter', pt: 'Menos abrigo natural' },
    ],
    ideal: true,
    capiFeedback: {
      en: 'Excellent choice! Flat ground and lots of light — just right for photovoltaic panels.',
      pt: 'Excelente escolha! Terreno plano e muita luz — ideal para painéis fotovoltaicos.',
    },
  },
  {
    id: 'C' as const,
    name: { en: 'Steep Slope', pt: 'Encosta Inclinada' },
    leftPct: 74,
    topPct: 62,
    pros: [
      { en: 'Close to the ship hatch', pt: 'Perto da escotilha da nave' },
      { en: 'Quick to reach', pt: 'Acesso rápido' },
    ],
    cons: [
      { en: 'Uneven ground', pt: 'Terreno irregular' },
      { en: 'Gets in the way of later missions', pt: 'Atrapalha futuras missões' },
    ],
    ideal: false,
    capiFeedback: {
      en: 'It is close to the ship, but the slope is risky and takes space other missions need. Want to think again?',
      pt: 'Fica perto da nave, mas a encosta é arriscada e ocupa espaço de outras missões. Vamos pensar de novo?',
    },
  },
] as const

export type SeasonId = 'summer_n' | 'equinox_n' | 'winter_n'

export const SEASONS = [
  {
    id: 'summer_n' as const,
    label: { en: 'Northern Summer', pt: 'Verão Norte' },
    sunBoost: 1.12,
    tip: { en: 'The Sun sits higher in the sky', pt: 'Sol mais alto no céu' },
    idealTilt: 28,
  },
  {
    id: 'equinox_n' as const,
    label: { en: 'Equinox', pt: 'Equinócio' },
    sunBoost: 1,
    tip: { en: 'The Sun is halfway up — spring or fall', pt: 'Sol a meio caminho — primavera ou outono' },
    idealTilt: 35,
  },
  {
    id: 'winter_n' as const,
    label: { en: 'Northern Winter', pt: 'Inverno Norte' },
    sunBoost: 0.82,
    tip: { en: 'The Sun sits lower — less light', pt: 'Sol mais baixo — menos luz' },
    idealTilt: 42,
  },
] as const

/** Teaching array used only to turn efficiency into watts. Not a NASA measurement. */
export const DEMO_PANEL_WATTS = 600

export function estimateGenerationWatts(efficiency: number): number {
  return Math.round((efficiency / 100) * DEMO_PANEL_WATTS)
}

export const AZIMUTH_POINTS = [
  { id: 'east', label: { en: 'East', pt: 'Leste' }, azimuth: -90 },
  { id: 'south', label: { en: 'South', pt: 'Sul' }, azimuth: 0 },
  { id: 'west', label: { en: 'West', pt: 'Oeste' }, azimuth: 90 },
  { id: 'north', label: { en: 'North', pt: 'Norte' }, azimuth: 180 },
] as const

export function azimuthCardinal(azimuth: number): string {
  const abs = Math.abs(azimuth)
  if (abs >= 135) return 'Norte'
  if (azimuth <= -45) return 'Leste'
  if (azimuth >= 45) return 'Oeste'
  return 'Sul'
}

export const MARS24_FORMULA =
  'Z = arccos(sin δ sin φ + cos δ cos φ cos H)   →   h = 90° − Z'

export const MARS24_KID = {
  en: 'NASA finds the height of the Sun (h) with the Mars24 formula. The best panel tilt also depends on dust and the batteries!',
  pt: 'A NASA calcula a altura do Sol (h) com a fórmula Mars24. A inclinação ideal do painel também depende da poeira e das baterias!',
} as const

/** Rough efficiency model for kids UI (not a full Mars24 sim). */
export function estimatePanelEfficiency(opts: {
  season: SeasonId
  azimuth: number // -90 leste, 0 sul, 90 oeste, ±180 norte
  tilt: number // 0–60
  site: SiteId
}): number {
  const season = SEASONS.find((s) => s.id === opts.season)!
  const siteFactor = opts.site === 'B' ? 1 : opts.site === 'A' ? 0.72 : 0.8
  const azFactor = 1 - Math.min(1, Math.abs(opts.azimuth) / 120) * 0.35
  const idealTilt = SEASONS.find((item) => item.id === opts.season)?.idealTilt ?? 35
  const tiltFactor = 1 - Math.min(1, Math.abs(opts.tilt - idealTilt) / 45) * 0.45
  return Math.round(Math.min(98, Math.max(18, 55 * season.sunBoost * siteFactor * azFactor * tiltFactor)))
}

export const TRANSMISSION_LINES = [
  { en: 'MISSION 1 DATA SAVED.', pt: 'DADOS DA MISSÃO 1 ARMAZENADOS.' },
  { en: 'TRYING TO CONNECT WITH EARTH CONTROL…', pt: 'TENTANDO CONEXÃO COM A CENTRAL TERRESTRE…' },
  { en: 'WAITING FOR A SIGNAL…', pt: 'AGUARDANDO SINAL…' },
  {
    en: 'Data stays saved on the ship until the communication window opens!',
    pt: 'Dados ficam salvos a bordo até a janela de comunicação abrir!',
  },
] as const
