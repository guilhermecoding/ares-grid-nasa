/**
 * Local solar time at Arcadia Planitia from the NASA GISS Mars24 algorithm
 * (Allison & McEwen 2000, with the revisions published on the Mars24 page).
 * NASA does not offer a solar-clock HTTP API; these are the official equations.
 */

import type { SeasonId } from '../data/mission1Data'

/** Planetographic latitude, degrees north. Matches Missão 01 (40.0° N). */
export const ARCADIA_LAT_DEG = 40
/** Planetographic longitude, degrees west. Matches Missão 01 (180.0° W). */
export const ARCADIA_LON_WEST_DEG = 180

export type SolarClockId = 'morning' | 'noon' | 'afternoon'

export interface SolarClockPreset {
  id: SolarClockId
  /** Local mean solar time, HH:MM:SS. */
  lmst: string
  elevationDeg: number
  zenithDeg: number
  sunUp: boolean
  suggestedTilt: number
}

export interface MarsSolarReading {
  /** Local mean solar time, HH:MM:SS in Mars hours. */
  lmst: string
  elevationDeg: number
  /** Solar zenith angle, degrees. h = 90° − Z. */
  zenithDeg: number
  /** Areocentric solar longitude, 0–360. */
  lsDeg: number
  sunUp: boolean
  suggestedTilt: number
  suggestedSeason: SeasonId
  /** Elevation at 09:00, 12:00 and 15:00 LMST for this sol's declination. */
  presets: readonly SolarClockPreset[]
}

const CLOCK_HOURS: readonly { id: SolarClockId; hours: number }[] = [
  { id: 'morning', hours: 9 },
  { id: 'noon', hours: 12 },
  { id: 'afternoon', hours: 15 },
]

const PERTURBERS = [
  { a: 0.0071, tau: 2.2353, phi: 49.409 },
  { a: 0.0057, tau: 2.7543, phi: 168.173 },
  { a: 0.0039, tau: 1.1177, phi: 191.837 },
  { a: 0.0037, tau: 15.7866, phi: 21.736 },
  { a: 0.0021, tau: 2.1354, phi: 15.704 },
  { a: 0.002, tau: 2.4694, phi: 95.528 },
  { a: 0.0018, tau: 32.8493, phi: 49.095 },
] as const

function mod(value: number, cycle: number): number {
  return ((value % cycle) + cycle) % cycle
}

function sinDeg(deg: number): number {
  return Math.sin((deg * Math.PI) / 180)
}

function cosDeg(deg: number): number {
  return Math.cos((deg * Math.PI) / 180)
}

/** TT − UTC in seconds. Leap seconds through 2017-01-01; none have been added since. */
function ttMinusUtcSeconds(date: Date): number {
  const t = date.getTime()
  if (t >= Date.UTC(2017, 0, 1)) return 69.184
  if (t >= Date.UTC(2015, 6, 1)) return 68.184
  if (t >= Date.UTC(2012, 6, 1)) return 67.184
  if (t >= Date.UTC(2009, 0, 1)) return 66.184
  if (t >= Date.UTC(2006, 0, 1)) return 65.184
  if (t >= Date.UTC(1999, 0, 1)) return 64.184
  return 69.184
}

function formatMarsClock(hours: number): string {
  const totalSec = Math.round(mod(hours, 24) * 3600) % 86400
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

function angularDistance(a: number, b: number): number {
  const delta = Math.abs(mod(a - b, 360))
  return Math.min(delta, 360 - delta)
}

/** Nearest of northern summer solstice, winter solstice, or either equinox. */
function seasonFromLs(ls: number): SeasonId {
  const summer = angularDistance(ls, 90)
  const winter = angularDistance(ls, 270)
  const equinox = Math.min(angularDistance(ls, 0), angularDistance(ls, 180))
  if (equinox <= summer && equinox <= winter) return 'equinox_n'
  return summer <= winter ? 'summer_n' : 'winter_n'
}

function seasonalTilt(season: SeasonId): number {
  if (season === 'summer_n') return 28
  if (season === 'equinox_n') return 35
  return 42
}

function sunGeometry(
  lmstHours: number,
  latDeg: number,
  lonWestDeg: number,
  declination: number,
  eotDeg: number,
  season: SeasonId,
): { elevationDeg: number; zenithDeg: number; sunUp: boolean; suggestedTilt: number } {
  const mstAt = mod(lmstHours + lonWestDeg / 15, 24)
  const subsolarLon = mod(mstAt * 15 + eotDeg + 180, 360)
  const hourAngle = lonWestDeg - subsolarLon
  const cosZ =
    sinDeg(declination) * sinDeg(latDeg) + cosDeg(declination) * cosDeg(latDeg) * cosDeg(hourAngle)
  const zenithDeg = (Math.acos(Math.min(1, Math.max(-1, cosZ))) * 180) / Math.PI
  const elevationDeg = 90 - zenithDeg
  const sunUp = elevationDeg > 0
  const suggestedTilt = sunUp
    ? Math.round(Math.min(60, Math.max(0, zenithDeg)))
    : seasonalTilt(season)
  return { elevationDeg, zenithDeg, sunUp, suggestedTilt }
}

export function marsSolarAt(
  date: Date,
  latDeg: number,
  lonWestDeg: number,
): MarsSolarReading {
  const jdUt = 2440587.5 + date.getTime() / 86400000
  const jdTt = jdUt + ttMinusUtcSeconds(date) / 86400
  const deltaJ2000 = jdTt - 2451545.0

  const meanAnomaly = 19.3871 + 0.52402073 * deltaJ2000
  const alphaFms = 270.3871 + 0.524038496 * deltaJ2000
  let pbs = 0
  for (const term of PERTURBERS) {
    pbs += term.a * cosDeg((0.985626 * deltaJ2000) / term.tau + term.phi)
  }
  const equationOfCenter =
    (10.691 + 0.0000003 * deltaJ2000) * sinDeg(meanAnomaly) +
    0.623 * sinDeg(2 * meanAnomaly) +
    0.05 * sinDeg(3 * meanAnomaly) +
    0.005 * sinDeg(4 * meanAnomaly) +
    0.0005 * sinDeg(5 * meanAnomaly) +
    pbs

  const ls = mod(alphaFms + equationOfCenter, 360)
  const eotDeg =
    2.861 * sinDeg(2 * ls) -
    0.071 * sinDeg(4 * ls) +
    0.002 * sinDeg(6 * ls) -
    equationOfCenter

  const mst = mod(24 * ((jdTt - 2451549.5) / 1.0274912517 + 44796.0 - 0.0009626), 24)
  const lmstHours = mod(mst - lonWestDeg / 15, 24)
  const declination =
    (Math.asin(0.42565 * sinDeg(ls)) * 180) / Math.PI + 0.25 * sinDeg(ls)
  const suggestedSeason = seasonFromLs(ls)
  const now = sunGeometry(lmstHours, latDeg, lonWestDeg, declination, eotDeg, suggestedSeason)
  const presets = CLOCK_HOURS.map((clock) => ({
    id: clock.id,
    lmst: formatMarsClock(clock.hours),
    ...sunGeometry(clock.hours, latDeg, lonWestDeg, declination, eotDeg, suggestedSeason),
  }))

  return {
    lmst: formatMarsClock(lmstHours),
    elevationDeg: now.elevationDeg,
    zenithDeg: now.zenithDeg,
    lsDeg: ls,
    sunUp: now.sunUp,
    suggestedTilt: now.suggestedTilt,
    suggestedSeason,
    presets,
  }
}

/** Solar time for the Missão 01 site in Arcadia Planitia. */
export function marsSolarAtArcadia(date = new Date()): MarsSolarReading {
  return marsSolarAt(date, ARCADIA_LAT_DEG, ARCADIA_LON_WEST_DEG)
}
