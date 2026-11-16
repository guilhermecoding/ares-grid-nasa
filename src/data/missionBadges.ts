import { Droplets, HeartPulse, ShieldAlert, Sprout, Sun, type LucideIcon } from 'lucide-react'
import type { MissionKey } from '../services/progressStore'

export interface MissionBadge {
  id: number
  key: MissionKey
  /** Insignia name, also the science theme of the mission. */
  title: string
  /** Short mission name as shown on the map. */
  mission: string
  icon: LucideIcon
  color: string
  /** Logbook photo sprite. */
  photo: string
  photoAlt: string
}

/** One insignia and one logbook photo per mission, in play order. */
export const MISSION_BADGES: readonly MissionBadge[] = [
  {
    id: 1,
    key: 'm1',
    title: 'Energia Solar',
    mission: 'Energia para explorar Marte',
    icon: Sun,
    color: '#f0b429',
    photo: '/assets/logbook/m1.jpg',
    photoAlt: 'Astronauta ao lado dos painéis solares em Arcadia Planitia',
  },
  {
    id: 2,
    key: 'm2',
    title: 'Saúde Humana',
    mission: 'Cuidando do astronauta',
    icon: HeartPulse,
    color: '#ff6b8a',
    photo: '/assets/logbook/m2.jpg',
    photoAlt: 'Astronauta correndo na esteira dentro do habitat',
  },
  {
    id: 3,
    key: 'm3',
    title: 'Geologia e Água',
    mission: 'O mistério do gelo de Marte',
    icon: Droplets,
    color: '#38bdf8',
    photo: '/assets/logbook/m3.jpg',
    photoAlt: 'Astronauta com a amostra de gelo ao lado da perfuratriz',
  },
  {
    id: 4,
    key: 'm4',
    title: 'Agricultura Espacial',
    mission: 'A primeira estufa de Marte',
    icon: Sprout,
    color: '#5ecf9a',
    photo: '/assets/logbook/m4.jpg',
    photoAlt: 'Astronauta com a colheita dentro da estufa',
  },
  {
    id: 5,
    key: 'm5',
    title: 'Proteção Ambiental',
    mission: 'Alerta! Tempestades em Marte',
    icon: ShieldAlert,
    color: '#ffb15a',
    photo: '/assets/logbook/m5.jpg',
    photoAlt: 'Astronauta entrando no abrigo com a tempestade de poeira chegando',
  },
]

export const TOTAL_MISSIONS = MISSION_BADGES.length

export const TROPHY_SPRITE = '/assets/logbook/trophy.png'

export function missionBadge(id: number): MissionBadge {
  return MISSION_BADGES[Math.min(Math.max(id, 1), TOTAL_MISSIONS) - 1]!
}

/** Stamp printed under every logbook photo. */
export function logbookCaption(id: number): string {
  return `NASA · Sol 0${id} · Arcadia Planitia · 40.0° N 180.0° W`
}

/** Missions are cleared in order, so the player level tells how many are done. */
export function completedMissions(level: number): number {
  return Math.min(Math.max(level - 1, 0), TOTAL_MISSIONS)
}
