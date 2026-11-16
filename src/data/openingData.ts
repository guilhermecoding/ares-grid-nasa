export type OpeningPhase =
  | 'ready_gate'
  | 'scene1_countdown'
  | 'scene2_takeoff'
  | 'scene3_capi_intro'
  | 'scene3_1_customizer'
  | 'scene4_landing'
  | 'start_mission_1'

export interface LocalizedLine {
  en: string
  pt: string
}

export const TAKEOFF_HUD_LINES: readonly LocalizedLine[] = [
  { en: 'TAKEOFF CONFIRMED!', pt: 'DECOLAGEM CONFIRMADA!' },
  { en: 'Navigation systems online.', pt: 'Sistemas de navegação ativados.' },
  { en: 'Destination: MARS.', pt: 'Destino: MARTE.' },
  { en: 'Exploration region: ARCADIA PLANITIA.', pt: 'Região de exploração: ARCADIA PLANITIA.' },
  { en: 'Starting the onboard virtual assistant...', pt: 'Ativando assistente virtual de bordo...' },
]

export const LANDING_HUD_LINES: readonly LocalizedLine[] = [
  { en: 'LANDING CONFIRMED!', pt: 'POUSO CONFIRMADO!' },
  { en: 'Location: Arcadia Planitia, Mars.', pt: 'Localização: Arcadia Planitia – Marte.' },
  { en: 'Life support systems: OPERATIONAL.', pt: 'Sistemas de suporte à vida: OPERACIONAIS.' },
  { en: 'Science equipment: OPERATIONAL.', pt: 'Equipamentos científicos: OPERACIONAIS.' },
  { en: 'Outside power: SOLAR SYSTEM NOT INSTALLED YET.', pt: 'Energia externa: SISTEMA SOLAR AINDA NÃO INSTALADO.' },
]

export const CAPI_INTRO_LINES: readonly LocalizedLine[] = [
  {
    en: 'Hellooo, astronaut! We finally get to meet! I am Capi, your virtual assistant. I will watch the ship, help with the experiments, and remind you to take care of your health!',
    pt: 'Olááá, astronauta! Finalmente vamos nos conhecer! Eu sou a Capi, sua assistente virtual. Vou monitorar a nave, ajudar nos experimentos e lembrar você de cuidar da saúde!',
  },
  {
    en: 'Our destination is Arcadia Planitia, on Mars! We will study the environment, look for clues of ice under the ground, and learn how to use the planet’s resources.',
    pt: 'Nosso destino é Arcadia Planitia, em Marte! Vamos estudar o ambiente, procurar pistas de gelo subterrâneo e descobrir como usar os recursos do planeta.',
  },
  {
    en: 'I will not do it all by myself — you are the lead researcher! Before we start, I need to know who is coming with me on this adventure!',
    pt: 'Mas não vou fazer tudo sozinha — você será o pesquisador responsável! Antes de começarmos, preciso saber quem está comigo nessa aventura!',
  },
]

export const CAPI_CONFIRM: LocalizedLine = {
  en: 'All set, Commander {name}! We now have an astronaut ready to explore the Red Planet. Our first job starts as soon as we land!',
  pt: 'Prontinho, Comandante {name}! Agora temos um astronauta preparado para explorar o Planeta Vermelho. Nossa primeira tarefa começará assim que pousarmos!',
}

export const CAPI_LANDING_LINES: readonly LocalizedLine[] = [
  {
    en: 'We made it, commander! We are on Mars! Look out the window — what a different place!',
    pt: 'Conseguimos, comandante! Estamos em Marte! Olhe pela janela — que lugar diferente!',
  },
  {
    en: 'We need power for the equipment. The first mission is to install the solar panel system.',
    pt: 'Precisamos garantir energia para os equipamentos. A primeira missão será instalar o sistema de painéis solares.',
  },
  {
    en: 'The panels cannot go just anywhere. Let’s find the spot and the angle that catch the most sunlight. Ready to start?',
    pt: 'Não dá para colocar os painéis em qualquer posição. Vamos descobrir onde e como aproveitar melhor a luz do Sol. Vamos começar?',
  },
]

export const NAME_SUGGESTIONS = ['Nova', 'Leo', 'Maya', 'Kai', 'Sofia', 'Ravi', 'Luna', 'Theo'] as const

export const SUIT_COLORS = [
  { id: 'nasa-white', label: 'Branco NASA', en: 'NASA White', hex: '#f2f4f8' },
  { id: 'mission-orange', label: 'Laranja Missão', en: 'Mission Orange', hex: '#e67a2e' },
  { id: 'cobalt-blue', label: 'Azul Cobalto', en: 'Cobalt Blue', hex: '#3b6fd9' },
  { id: 'explorer-green', label: 'Verde Explorador', en: 'Explorer Green', hex: '#3d9b6a' },
] as const

export const HELMET_STYLES = [
  { id: 'classic', label: 'Clássico', en: 'Classic' },
  { id: 'visor-gold', label: 'Visor Dourado', en: 'Gold Visor' },
  { id: 'visor-cyan', label: 'Visor Ciano', en: 'Cyan Visor' },
] as const

export const BACKPACK_STYLES = [
  { id: 'standard', label: 'Padrão', en: 'Standard' },
  { id: 'compact', label: 'Compacta', en: 'Compact' },
  { id: 'research', label: 'Pesquisa', en: 'Research' },
] as const

export const INSIGNIAS = [
  { id: 'ares', label: 'Ares', en: 'Ares' },
  { id: 'star', label: 'Estrela', en: 'Star' },
  { id: 'mars', label: 'Marte', en: 'Mars' },
] as const

export type SuitColorId = (typeof SUIT_COLORS)[number]['id']
export type HelmetId = (typeof HELMET_STYLES)[number]['id']
export type BackpackId = (typeof BACKPACK_STYLES)[number]['id']
export type InsigniaId = (typeof INSIGNIAS)[number]['id']

export interface AstronautProfile {
  name: string
  suitColor: SuitColorId
  helmet: HelmetId
  backpack: BackpackId
  insignia: InsigniaId
}
