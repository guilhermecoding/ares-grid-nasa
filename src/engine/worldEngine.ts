import { createArcadiaGrid, refreshLocks } from '../data/arcadiaSiteData'
import { getLevelDef, questForLevel, toolsForLevel } from '../data/levels'
import { getCrop } from '../data/osdrCrops'
import { isStorm, weatherForSol } from '../services/weatherService'
import type { DonkiBundle } from '../types/nasa'
import type {
  BaseStats,
  GridTile,
  QuestProgress,
  ToolId,
  WeatherState,
  WorldState,
} from '../types/game'
import {
  ACTION_COST,
  GRID_SIZE,
  MAX_ENERGY,
  MOVE_COST,
  NIGHT_HOUR,
  WAKE_HOUR,
} from '../types/game'

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n))
}

function cloneGrid(grid: GridTile[][]): GridTile[][] {
  return grid.map((row) => row.map((t) => ({ ...t })))
}

function makeQuest(level: number, stormsSurvived = 0): QuestProgress {
  const q = questForLevel(level)
  return {
    kind: q.kind,
    current: q.kind === 'survive_storms' ? stormsSurvived : 0,
    target: q.target,
    label: q.label,
  }
}

function defaultWeather(): WeatherState {
  return {
    kind: 'calm',
    label: 'Sol calmo em Arcadia',
    intensity: 10,
    eventLabel: 'Sem alerta severo',
    sourceMode: 'curated',
  }
}

export function createWorldState(
  level: number,
  xp: number,
  weather?: WeatherState,
): WorldState {
  const def = getLevelDef(level)
  return {
    grid: createArcadiaGrid(level),
    rover: { x: 0, y: 0, cargo: 'none', sheltered: true },
    stats: { energy: MAX_ENERGY, lifeSupport: 85, shield: 70 },
    sol: 1,
    hour: WAKE_HOUR,
    level,
    xp,
    xpToNext: def.xpToNext,
    unlockedTools: toolsForLevel(level),
    quest: makeQuest(level),
    weather: weather ?? defaultWeather(),
    message: `Bom dia! ${def.unlockMessage}`,
    iceStored: 0,
    stormsSurvived: 0,
    justLeveledUp: false,
    levelUpTitle: null,
  }
}

function hasTool(state: WorldState, tool: ToolId): boolean {
  return state.unlockedTools.includes(tool)
}

function spendEnergy(stats: BaseStats, cost: number): BaseStats | null {
  if (stats.energy < cost) return null
  return { ...stats, energy: clamp(stats.energy - cost) }
}

function bumpQuest(state: WorldState, kind: QuestProgress['kind'], amount = 1): WorldState {
  if (state.quest.kind !== kind) return state
  const current = Math.min(state.quest.target, state.quest.current + amount)
  return { ...state, quest: { ...state.quest, current } }
}

function tryLevelUp(state: WorldState): WorldState {
  if (state.quest.current < state.quest.target) {
    return { ...state, justLeveledUp: false, levelUpTitle: null }
  }
  if (state.level >= 5) {
    return {
      ...state,
      xp: state.xp + getLevelDef(state.level).xpReward,
      quest: makeQuest(state.level, state.stormsSurvived),
      message: 'Você é o guardião de AP-1! Continue cuidando da base.',
      justLeveledUp: false,
      levelUpTitle: null,
    }
  }

  const nextLevel = state.level + 1
  const def = getLevelDef(nextLevel)
  const xp = state.xp + getLevelDef(state.level).xpReward
  return {
    ...state,
    level: nextLevel,
    xp,
    xpToNext: def.xpToNext,
    unlockedTools: toolsForLevel(nextLevel),
    quest: makeQuest(nextLevel, state.stormsSurvived),
    grid: refreshLocks(state.grid, nextLevel),
    message: def.unlockMessage,
    justLeveledUp: true,
    levelUpTitle: `Nível ${nextLevel} — ${def.title}`,
  }
}

function applyPassiveHour(state: WorldState): WorldState {
  const grid = cloneGrid(state.grid)
  let life = state.stats.lifeSupport
  let shield = state.stats.shield

  // Dust accumulates slowly on panels.
  for (const row of grid) {
    for (const tile of row) {
      if (tile.type === 'SOLAR_PANEL' && !tile.locked) {
        tile.dust = clamp(tile.dust + 0.8)
      }
      if (tile.type === 'HYDROPONIC_BAY' && !tile.locked) {
        const crop = getCrop(tile.cropId)
        if (crop && tile.growth < crop.growthTicks) tile.growth += 0.35
      }
    }
  }

  // Clean panels boost life a little during day.
  let cleanPanels = 0
  for (const row of grid) {
    for (const tile of row) {
      if (tile.type === 'SOLAR_PANEL' && !tile.locked && tile.dust < 40) cleanPanels++
    }
  }
  if (state.hour >= 6 && state.hour < 18) life = clamp(life + cleanPanels * 0.4)
  else life = clamp(life - 0.6)

  if (state.iceStored > 0) life = clamp(life + 0.3)

  const storm = isStorm(state.weather.kind)
  if (storm) {
    const exposure = state.rover.sheltered ? 0.25 : 1
    const shieldFactor = shield / 100
    life = clamp(life - (state.weather.intensity / 40) * exposure * (1 - shieldFactor * 0.7))
    shield = clamp(shield - state.weather.intensity * 0.04 * (state.rover.sheltered ? 0.35 : 1))
  } else {
    shield = clamp(shield - 0.15)
  }

  return {
    ...state,
    grid,
    stats: { ...state.stats, lifeSupport: life, shield },
  }
}

export function moveRover(state: WorldState, dx: number, dy: number): WorldState {
  if (state.stats.energy < MOVE_COST) {
    return { ...state, message: 'Sem energia… volte para a casinha e durma!' }
  }
  const x = state.rover.x + dx
  const y = state.rover.y + dy
  if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) {
    return { ...state, message: 'Não dá para ir além da cratera AP-1.' }
  }
  const tile = state.grid[y]![x]!
  if (tile.locked) {
    return { ...state, message: 'Essa área ainda está trancada. Suba de nível!' }
  }

  const spent = spendEnergy(state.stats, MOVE_COST)!
  const sheltered = tile.type === 'HABITAT'
  let next: WorldState = {
    ...state,
    rover: { ...state.rover, x, y, sheltered },
    stats: spent,
    hour: Math.min(23, state.hour + (state.hour >= 18 ? 1 : 0)),
    message: sheltered ? 'Em casa! Aqui você está seguro.' : null,
    justLeveledUp: false,
    levelUpTitle: null,
  }
  next = applyPassiveHour(next)
  if (next.hour >= NIGHT_HOUR) {
    next = { ...next, message: 'Está ficando tarde… melhor dormir na casinha.' }
  }
  return next
}

export function interact(state: WorldState): WorldState {
  const { x, y } = state.rover
  const grid = cloneGrid(state.grid)
  const tile = grid[y]![x]!
  if (tile.locked) {
    return { ...state, message: 'Ainda trancado. Complete a missão do nível!' }
  }

  if (state.stats.energy < ACTION_COST && tile.type !== 'HABITAT') {
    return { ...state, message: 'Energia baixa demais para trabalhar. Durma!' }
  }

  let stats = { ...state.stats }
  const rover = { ...state.rover }
  let iceStored = state.iceStored
  let message = 'Nada para fazer aqui.'
  let next: WorldState = { ...state, grid, justLeveledUp: false, levelUpTitle: null }

  switch (tile.type) {
    case 'HABITAT':
      message = 'Toque em Dormir para passar o Sol e recuperar energia.'
      break
    case 'SOLAR_PANEL': {
      if (!hasTool(state, 'clean')) {
        message = 'Você ainda não sabe limpar painéis.'
        break
      }
      stats = spendEnergy(stats, ACTION_COST) ?? stats
      if (stats.energy === state.stats.energy && state.stats.energy < ACTION_COST) break
      const before = tile.dust
      tile.dust = clamp(tile.dust - 40)
      message =
        before > 15
          ? `Painel limpinho! Poeira ${Math.round(before)}% → ${Math.round(tile.dust)}%`
          : 'Este painel já está bem limpo.'
      if (before > 15) next = bumpQuest({ ...next, stats, rover, iceStored, message, grid }, 'clean_panels')
      else next = { ...next, stats, rover, iceStored, message, grid }
      return tryLevelUp(applyPassiveHour({ ...next, hour: Math.min(23, next.hour + 1) }))
    }
    case 'SWIM_ICE_DRILL': {
      if (!hasTool(state, 'drill')) {
        message = 'Perfuração SWIM ainda trancada.'
        break
      }
      if (rover.cargo !== 'none') {
        message = 'Você já carrega algo. Deposite antes!'
        break
      }
      stats = spendEnergy(stats, ACTION_COST)!
      rover.cargo = 'ice'
      iceStored += 1
      stats.lifeSupport = clamp(stats.lifeSupport + 10)
      message = 'Gelo SWIM extraído! +água e ar para a base.'
      next = bumpQuest({ ...next, stats, rover, iceStored, message, grid }, 'drill_ice')
      return tryLevelUp(applyPassiveHour({ ...next, hour: Math.min(23, next.hour + 1) }))
    }
    case 'HYDROPONIC_BAY': {
      if (!hasTool(state, 'harvest')) {
        message = 'Estufa ainda trancada.'
        break
      }
      const crop = getCrop(tile.cropId)
      if (!crop || tile.growth < crop.growthTicks) {
        message = crop
          ? `${crop.name} ainda crescendo (${Math.floor(tile.growth)}/${crop.growthTicks})…`
          : 'Nada plantado.'
        break
      }
      stats = spendEnergy(stats, ACTION_COST)!
      stats.lifeSupport = clamp(stats.lifeSupport + crop.lifeSupportReturn * 0.7)
      tile.growth = 0
      tile.cropId = tile.cropId === 'radish' ? 'spirulina' : tile.cropId === 'spirulina' ? 'romaine' : 'radish'
      message = `Colheita de ${crop.name}! A base agradece.`
      next = bumpQuest({ ...next, stats, rover, iceStored, message, grid }, 'harvest')
      return tryLevelUp(applyPassiveHour({ ...next, hour: Math.min(23, next.hour + 1) }))
    }
    case 'REGOLITH_PIT': {
      if (!hasTool(state, 'mine')) {
        message = 'Jazida ainda trancada.'
        break
      }
      if (rover.cargo !== 'none' && rover.cargo !== 'regolith') {
        message = 'Esvazie a carga atual primeiro.'
        break
      }
      stats = spendEnergy(stats, ACTION_COST)!
      rover.cargo = 'regolith'
      message = 'Regolito coletado! Leve até a cúpula.'
      break
    }
    case 'RADIATION_SHIELD': {
      if (!hasTool(state, 'shield')) {
        message = 'Cúpula ainda trancada.'
        break
      }
      if (rover.cargo !== 'regolith') {
        message = 'Traga regolito da jazida para depositar.'
        break
      }
      stats = spendEnergy(stats, ACTION_COST)!
      rover.cargo = 'none'
      stats.shield = clamp(stats.shield + 16)
      message = 'Escudo reforçado! Mais seguro nas tempestades.'
      next = bumpQuest({ ...next, stats, rover, iceStored, message, grid }, 'deposit_shield')
      return tryLevelUp(applyPassiveHour({ ...next, hour: Math.min(23, next.hour + 1) }))
    }
    case 'EMPTY':
      message = 'Só poeira e craterinhas. Ande até um módulo da base!'
      break
  }

  return applyPassiveHour({
    ...next,
    stats,
    rover,
    iceStored,
    message,
    grid,
    hour: tile.type === 'HABITAT' ? state.hour : Math.min(23, state.hour + 1),
  })
}

export function sleep(state: WorldState, bundle: DonkiBundle | null): WorldState {
  const onHabitat = state.grid[state.rover.y]![state.rover.x]!.type === 'HABITAT'
  if (!onHabitat) {
    return { ...state, message: 'Só dá para dormir na casinha (🏠).' }
  }

  let stormsSurvived = state.stormsSurvived
  let quest = { ...state.quest }
  if (isStorm(state.weather.kind)) {
    stormsSurvived += 1
    if (quest.kind === 'survive_storms') {
      quest = { ...quest, current: Math.min(quest.target, stormsSurvived) }
    }
  }

  const nextSol = state.sol + 1
  const weather = bundle ? weatherForSol(bundle, nextSol) : defaultWeather()

  let next: WorldState = {
    ...state,
    sol: nextSol,
    hour: WAKE_HOUR,
    stats: {
      energy: MAX_ENERGY,
      lifeSupport: clamp(state.stats.lifeSupport + 6),
      shield: clamp(state.stats.shield + (isStorm(weather.kind) ? 0 : 4)),
    },
    rover: { ...state.rover, sheltered: true, cargo: state.rover.cargo },
    weather,
    stormsSurvived,
    quest,
    message: isStorm(weather.kind)
      ? `Alerta DONKI: ${weather.label}! Cuidado lá fora.`
      : `Sol ${nextSol} — ${weather.label}. Energia cheia!`,
    justLeveledUp: false,
    levelUpTitle: null,
  }

  // Passive overnight crop growth
  const grid = cloneGrid(next.grid)
  for (const row of grid) {
    for (const tile of row) {
      if (tile.type === 'HYDROPONIC_BAY' && !tile.locked) {
        const crop = getCrop(tile.cropId)
        if (crop) tile.growth = Math.min(crop.growthTicks, tile.growth + 1.2)
      }
      if (tile.type === 'SOLAR_PANEL' && !tile.locked) {
        tile.dust = clamp(tile.dust + 6)
      }
    }
  }
  next = { ...next, grid }
  return tryLevelUp(next)
}

export function applyWeatherBundle(state: WorldState, bundle: DonkiBundle): WorldState {
  return {
    ...state,
    weather: weatherForSol(bundle, state.sol),
  }
}
