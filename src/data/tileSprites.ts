import type { TileType } from '../types/game'

/** Pixel-art sprites inspired by the Arcadia colony reference illustration. */
export const GROUND_SPRITE = '/art/sprites/ground.jpg'
export const ROVER_SPRITE = '/art/sprites/rover.jpg'
export const LOCK_SPRITE = '/art/sprites/lock.jpg'
export const EMPTY_ROCK_SPRITE = '/art/sprites/empty-rock.jpg'

export const TILE_SPRITES: Record<TileType, string | null> = {
  EMPTY: null,
  HABITAT: '/art/sprites/habitat.jpg',
  SOLAR_PANEL: '/art/sprites/solar.jpg',
  HYDROPONIC_BAY: '/art/sprites/greenhouse.jpg',
  SWIM_ICE_DRILL: '/art/sprites/ice.jpg',
  REGOLITH_PIT: '/art/sprites/regolith.jpg',
  RADIATION_SHIELD: '/art/sprites/shield.jpg',
}
