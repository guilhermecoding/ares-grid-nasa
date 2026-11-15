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
  ['Lá fora há riscos: radiação, poeira e frio.'] as const,
  ['Ficar tempo demais derruba a Saúde.', 'Rápido e de volta!'] as const,
] as const

export const RISK_HIGHLIGHT_WORDS = ['Saúde'] as const

export const MISSION1_META = {
  number: 1,
  gateTitle: 'ENERGIA PARA EXPLORAR MARTE',
  shortTitle: 'Energia Solar',
  lat: '40.0° N',
  lon: '180.0° W',
  sources: [
    'NASA GISS Mars24 Algorithm — posição do Sol em Marte',
    'Photovoltaic Arrays for Martian Surface Power (NASA)',
  ],
} as const

export const SCI_TERMS: Record<string, string> = {
  'Arcadia Planitia': 'Uma planície grande e relativamente plana em Marte.',
  Azimute: 'A direção do Sol no horizonte: leste, sul ou oeste.',
  'Elevação Solar': 'Quão alto o Sol está no céu — mais alto = mais luz!',
  Fotovoltaico: 'Painel que transforma luz do Sol em eletricidade.',
  Sol: 'O Sol de Marte parece menor, mas ainda aquece e dá energia.',
}

/** Short Capi parts — one dialog box each. */
export const INTRO_PARTS = [
  ['Chegamos a Marte!', 'Mas aqui não há fonte de energia ainda.'] as const,
  ['Vamos instalar um painel solar para a base funcionar.'] as const,
] as const

export const INTRO_HIGHLIGHT_WORDS = ['painel solar'] as const

/** Shown when re-entering Missão 01 after the panel was already set up. */
export const REPLAY_INTRO_PARTS = [
  ['Você esteve aqui há pouco tempo.'] as const,
  ['O painel solar já está configurado.'] as const,
] as const

export const REPLAY_INTRO_HIGHLIGHT_WORDS = ['painel solar'] as const

/** Cooldown between panel cleans on Missão 01 replay visits. */
export const PANEL_CLEAN_COOLDOWN_MS = 5 * 60_000
export const PANEL_CLEAN_EFFICIENCY_GAIN = 4
export const PANEL_CLEAN_ENERGY_GAIN = 10
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
  ['Percebeu que a eficiência da placa solar caiu depois da tempestade?', 'Você imagina por quê?'] as const,
  [
    'A poeira fina cobre as células do painel.',
    'Ela bloqueia a luz do Sol, e o painel gera menos eletricidade.',
  ] as const,
] as const

export const CLEAN_RESULT_PARTS = [
  ['Boa limpeza! Sem poeira, mais luz chega às células.'] as const,
  ['A eficiência sobe. A limpeza gasta um pouco da reserva de água.'] as const,
] as const

export const PANEL_TEST_OPTIONS = [
  {
    id: 'dust' as const,
    name: 'Envelhecer + poeira',
    pros: ['Mostra o efeito real da poeira', 'Dá para ver a queda na hora'],
    cons: ['Eficiência cai cerca de 65%', 'Energia e água diminuem'],
  },
  {
    id: 'clean' as const,
    name: 'Limpeza',
    pros: ['Tira a poeira das células', 'Eficiência e energia sobem'],
    cons: ['Gasta um pouco da reserva de água'],
  },
] as const

export type SiteId = 'A' | 'B' | 'C'

export const INSTALL_SITES = [
  {
    id: 'A' as const,
    name: 'Vale Sombreado',
    leftPct: 22,
    topPct: 58,
    pros: ['Protege bem do vento', 'Rochas altas ao lado'],
    cons: ['Fica na sombra metade do dia', 'Gera menos energia'],
    ideal: false,
    capiFeedback:
      'Boa proteção! Mas a sombra corta a luz. Em Marte, precisamos de sol o máximo possível.',
  },
  {
    id: 'B' as const,
    name: 'Planície Aberta Norte',
    leftPct: 52,
    topPct: 48,
    pros: ['Sol o dia todo', 'Fácil limpar a poeira', 'Longe da rota do rover'],
    cons: ['Mais poeira no vento', 'Menos abrigo natural'],
    ideal: true,
    capiFeedback: 'Excelente escolha! Terreno plano e muita luz — ideal para painéis fotovoltaicos.',
  },
  {
    id: 'C' as const,
    name: 'Encosta Inclinada',
    leftPct: 74,
    topPct: 62,
    pros: ['Perto da escotilha da nave', 'Acesso rápido'],
    cons: ['Terreno irregular', 'Atrapalha futuras missões'],
    ideal: false,
    capiFeedback:
      'Fica perto da nave, mas a encosta é arriscada e ocupa espaço de outras missões. Vamos pensar de novo?',
  },
] as const

export type SeasonId = 'summer_n' | 'equinox_n' | 'winter_n'

export const SEASONS = [
  { id: 'summer_n' as const, label: 'Verão Norte', sunBoost: 1.12, tip: 'Sol mais alto no céu', idealTilt: 28 },
  {
    id: 'equinox_n' as const,
    label: 'Equinócio',
    sunBoost: 1,
    tip: 'Sol a meio caminho — primavera ou outono',
    idealTilt: 35,
  },
  { id: 'winter_n' as const, label: 'Inverno Norte', sunBoost: 0.82, tip: 'Sol mais baixo — menos luz', idealTilt: 42 },
] as const

/** Teaching array used only to turn efficiency into watts. Not a NASA measurement. */
export const DEMO_PANEL_WATTS = 600

export function estimateGenerationWatts(efficiency: number): number {
  return Math.round((efficiency / 100) * DEMO_PANEL_WATTS)
}

export const AZIMUTH_POINTS = [
  { id: 'east', label: 'Leste', azimuth: -90 },
  { id: 'south', label: 'Sul', azimuth: 0 },
  { id: 'west', label: 'Oeste', azimuth: 90 },
  { id: 'north', label: 'Norte', azimuth: 180 },
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

export const MARS24_KID =
  'A NASA calcula a altura do Sol (h) com a fórmula Mars24. A inclinação ideal do painel também depende da poeira e das baterias!'

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

export const LOGBOOK_EVENT = 'Instalação e ativação dos painéis solares em Arcadia Planitia'

export const LOGBOOK_ASPECTS = [
  'Local com boa luz o dia todo',
  'Inclinação ajustada com a Capi',
  'Poeira cobre as células e a luz não passa',
  'Limpar o painel devolve parte da geração',
] as const

export const TRANSMISSION_LINES = [
  'DADOS DA MISSÃO 1 ARMAZENADOS.',
  'TENTANDO CONEXÃO COM A CENTRAL TERRESTRE…',
  'AGUARDANDO SINAL…',
  'Dados ficam salvos a bordo até a janela de comunicação abrir!',
] as const
