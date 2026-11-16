export interface OsdrCrop {
  id: string
  name: string
  nasaRef: string
  growthTicks: number
  ledCostPerTick: number
  lifeSupportReturn: number
  radiationSensitivity: number
  tacticalRole: string
}

/** Calibrated from NASA OSDR / Veggie / Plant Habitat references in the GDD. */
export const OSDR_CROPS: Record<string, OsdrCrop> = {
  radish: {
    id: 'radish',
    name: 'Rabanete',
    nasaRef: 'OSDR-295 / Plant Habitat-02',
    growthTicks: 4,
    ledCostPerTick: 1.2,
    lifeSupportReturn: 14,
    radiationSensitivity: 0.25,
    tacticalRole: 'Recuperação rápida em emergências de comida/O₂.',
  },
  spirulina: {
    id: 'spirulina',
    name: 'Spirulina',
    nasaRef: 'MELiSSA / Fotobiorreator',
    growthTicks: 3,
    ledCostPerTick: 2.0,
    lifeSupportReturn: 18,
    radiationSensitivity: 0.1,
    tacticalRole: 'Boa durante tempestades se houver bateria sobrando.',
  },
  romaine: {
    id: 'romaine',
    name: 'Alface-Romana',
    nasaRef: 'ISS Veggie VEG-01 / OSDR',
    growthTicks: 6,
    ledCostPerTick: 1.5,
    lifeSupportReturn: 26,
    radiationSensitivity: 0.45,
    tacticalRole: 'Alto rendimento em Sols calmos com escudo acima de 75%.',
  },
}

export function getCrop(cropId: string | null): OsdrCrop | null {
  if (!cropId) return null
  return OSDR_CROPS[cropId] ?? null
}
