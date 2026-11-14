import type { WeatherKind, WeatherState } from '../types/game'
import type { DonkiBundle } from '../types/nasa'

function flareIntensity(classType: string): number {
  const letter = classType.trim().charAt(0).toUpperCase()
  const magnitude = Number.parseFloat(classType.trim().slice(1)) || 1
  if (letter === 'X') return Math.min(95, 72 + magnitude * 2)
  if (letter === 'M') return Math.min(75, 48 + magnitude * 3)
  return 28
}

/** Pick today's weather from DONKI bundle, rotating by Sol index. */
export function weatherForSol(bundle: DonkiBundle, sol: number): WeatherState {
  const strongFlares = bundle.flares.filter((f) => /^[MX]/i.test(f.classType.trim()))
  const marsCmes = bundle.cmes.filter((c) => c.impactList?.some((i) => /mars/i.test(i.location)))
  const seps = bundle.seps

  const pool: WeatherState[] = [
    {
      kind: 'calm',
      label: 'Sol calmo em Arcadia',
      intensity: 10,
      eventLabel: 'Sem alerta severo',
      sourceMode: bundle.mode,
    },
  ]

  for (const flare of strongFlares.slice(0, 3)) {
    pool.push({
      kind: 'flare',
      label: `Flare solar ${flare.classType}`,
      intensity: flareIntensity(flare.classType),
      eventLabel: flare.flrID,
      eventLink: flare.link,
      sourceMode: bundle.mode,
    })
  }

  for (const cme of marsCmes.slice(0, 2)) {
    const speed = cme.speed ?? 900
    pool.push({
      kind: 'cme',
      label: `CME a ${speed} km/s rumo a Marte`,
      intensity: Math.min(90, 50 + speed / 40),
      eventLabel: cme.activityID,
      eventLink: cme.link,
      sourceMode: bundle.mode,
    })
  }

  for (const sep of seps.slice(0, 2)) {
    pool.push({
      kind: 'sep',
      label: 'Tempestade de prótons (SEP)',
      intensity: 88,
      eventLabel: sep.sepID,
      eventLink: sep.link,
      sourceMode: bundle.mode,
    })
  }

  // Sol 1 tends calm; later sols rotate through pool for variety.
  if (sol <= 1) return pool[0]!
  return pool[sol % pool.length]!
}

export function isStorm(kind: WeatherKind): boolean {
  return kind === 'flare' || kind === 'cme' || kind === 'sep'
}

export function weatherEmoji(kind: WeatherKind): string {
  switch (kind) {
    case 'calm':
      return '🌤️'
    case 'flare':
      return '☀️'
    case 'cme':
      return '💨'
    case 'sep':
      return '☢️'
  }
}
