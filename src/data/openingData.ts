export type OpeningPhase =
  | 'ready_gate'
  | 'scene1_countdown'
  | 'scene2_takeoff'
  | 'scene3_capi_intro'
  | 'scene3_1_customizer'
  | 'scene4_landing'
  | 'start_mission_1'

export const TAKEOFF_HUD_LINES = [
  'DECOLAGEM CONFIRMADA!',
  'Sistemas de navegação ativados.',
  'Destino: MARTE.',
  'Região de exploração: ARCADIA PLANITIA.',
  'Ativando assistente virtual de bordo...',
] as const

export const LANDING_HUD_LINES = [
  'POUSO CONFIRMADO!',
  'Localização: Arcadia Planitia – Marte.',
  'Sistemas de suporte à vida: OPERACIONAIS.',
  'Equipamentos científicos: OPERACIONAIS.',
  'Energia externa: SISTEMA SOLAR AINDA NÃO INSTALADO.',
] as const

export const CAPI_INTRO_LINES = [
  'Olááá, astronauta! Finalmente vamos nos conhecer! Eu sou a Capi, sua assistente virtual. Vou monitorar a nave, ajudar nos experimentos e lembrar você de cuidar da saúde!',
  'Nosso destino é Arcadia Planitia, em Marte! Vamos estudar o ambiente, procurar pistas de gelo subterrâneo e descobrir como usar os recursos do planeta.',
  'Mas não vou fazer tudo sozinha — você será o pesquisador responsável! Antes de começarmos, preciso saber quem está comigo nessa aventura!',
] as const

export const CAPI_CONFIRM_TEMPLATE =
  'Prontinho, Comandante {name}! Agora temos um astronauta preparado para explorar o Planeta Vermelho. Nossa primeira tarefa começará assim que pousarmos!'

export const CAPI_LANDING_LINES = [
  'Conseguimos, comandante! Estamos em Marte! Olhe pela janela — que lugar diferente!',
  'Precisamos garantir energia para os equipamentos. A primeira missão será instalar o sistema de painéis solares.',
  'Não dá para colocar os painéis em qualquer posição. Vamos descobrir onde e como aproveitar melhor a luz do Sol. Vamos começar?',
] as const

export const NAME_SUGGESTIONS = ['Nova', 'Leo', 'Maya', 'Kai', 'Sofia', 'Ravi', 'Luna', 'Theo'] as const

export const SUIT_COLORS = [
  { id: 'nasa-white', label: 'Branco NASA', hex: '#f2f4f8' },
  { id: 'mission-orange', label: 'Laranja Missão', hex: '#e67a2e' },
  { id: 'cobalt-blue', label: 'Azul Cobalto', hex: '#3b6fd9' },
  { id: 'explorer-green', label: 'Verde Explorador', hex: '#3d9b6a' },
] as const

export const HELMET_STYLES = [
  { id: 'classic', label: 'Clássico' },
  { id: 'visor-gold', label: 'Visor Dourado' },
  { id: 'visor-cyan', label: 'Visor Ciano' },
] as const

export const BACKPACK_STYLES = [
  { id: 'standard', label: 'Padrão' },
  { id: 'compact', label: 'Compacta' },
  { id: 'research', label: 'Pesquisa' },
] as const

export const INSIGNIAS = [
  { id: 'ares', label: 'Ares' },
  { id: 'star', label: 'Estrela' },
  { id: 'mars', label: 'Marte' },
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
