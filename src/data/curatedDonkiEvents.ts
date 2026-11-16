import type { DonkiBundle, DonkiCme, DonkiFlare, DonkiSep } from '../types/nasa'

/** Verified historical events that impacted Mars — used when live API fails or is quiet. */

export const CURATED_FLARES: DonkiFlare[] = [
  {
    flrID: '2017-09-10T15:35:00-FLR-001',
    beginTime: '2017-09-10T15:35Z',
    peakTime: '2017-09-10T16:06Z',
    endTime: '2017-09-10T16:31Z',
    classType: 'X8.2',
    sourceLocation: 'S08W88',
    activeRegionNum: 12673,
    link: 'https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/12673/1',
  },
  {
    flrID: '2024-05-10T06:27:00-FLR-001',
    beginTime: '2024-05-10T06:27Z',
    peakTime: '2024-05-10T06:54Z',
    endTime: '2024-05-10T07:22Z',
    classType: 'X3.9',
    sourceLocation: 'S20W00',
    activeRegionNum: 13664,
    link: 'https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/13664/1',
  },
  {
    flrID: '2024-05-11T01:10:00-FLR-001',
    beginTime: '2024-05-11T01:10Z',
    peakTime: '2024-05-11T01:23Z',
    endTime: '2024-05-11T01:39Z',
    classType: 'X5.8',
    sourceLocation: 'S18W18',
    activeRegionNum: 13664,
    link: 'https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/13664/2',
  },
]

export const CURATED_CMES: DonkiCme[] = [
  {
    activityID: '2017-09-10T16:00:00-CME-001',
    startTime: '2017-09-10T16:00Z',
    speed: 2650,
    type: 'C',
    link: 'https://ccmc.gsfc.nasa.gov/DONKI/view/CME/12674/1',
    impactList: [
      {
        location: 'Mars',
        arrivalTime: '2017-09-13T02:00Z',
        isGlancingBlow: false,
      },
    ],
  },
  {
    activityID: '2024-05-08T05:36:00-CME-001',
    startTime: '2024-05-08T05:36Z',
    speed: 1750,
    type: 'O',
    link: 'https://ccmc.gsfc.nasa.gov/DONKI/view/CME/13650/1',
    impactList: [
      {
        location: 'Mars',
        arrivalTime: '2024-05-10T18:00Z',
        isGlancingBlow: false,
      },
    ],
  },
]

export const CURATED_SEPS: DonkiSep[] = [
  {
    sepID: '2024-05-10T12:00:00-SEP-001',
    eventTime: '2024-05-10T12:00Z',
    link: 'https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/13660/1',
    instruments: [{ displayName: 'Curiosity RAD (Mars)' }],
  },
  {
    sepID: '2017-09-10T16:25:00-SEP-001',
    eventTime: '2017-09-10T16:25Z',
    link: 'https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/12675/1',
    instruments: [{ displayName: 'GOES-15 >10 MeV' }],
  },
]

export function getCuratedDonkiBundle(): DonkiBundle {
  return {
    flares: CURATED_FLARES,
    cmes: CURATED_CMES,
    seps: CURATED_SEPS,
    fetchedAt: new Date().toISOString(),
    mode: 'curated',
  }
}
