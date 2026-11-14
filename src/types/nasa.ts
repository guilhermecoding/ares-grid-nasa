/** Interfaces aligned with CCMC DONKI-API JSON payloads. */

export type FlareClass = 'A' | 'B' | 'C' | 'M' | 'X' | string

export interface DonkiFlare {
  flrID: string
  beginTime: string
  peakTime: string | null
  endTime: string | null
  classType: FlareClass
  sourceLocation: string | null
  activeRegionNum: number | null
  link: string
}

export interface DonkiCmeImpact {
  location: string
  arrivalTime: string
  isGlancingBlow?: boolean
}

export interface DonkiCme {
  activityID: string
  startTime: string
  sourceLocation?: string | null
  speed?: number | null
  type?: string | null
  link: string
  impactList?: DonkiCmeImpact[] | null
}

export interface DonkiSep {
  sepID: string
  eventTime: string
  link: string
  instruments?: { displayName: string }[]
}

export type DonkiSourceMode = 'live' | 'cached' | 'curated'

export interface DonkiBundle {
  flares: DonkiFlare[]
  cmes: DonkiCme[]
  seps: DonkiSep[]
  fetchedAt: string
  mode: DonkiSourceMode
}
