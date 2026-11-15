/** Centralized media paths for the opening sequence and shared UI. */

import emblem from '../assets/image/artefacts/arcadia_emblema_capivara.png'
import astronautaCabeca from '../assets/image/artefacts/astronauta_cabeca.png'
import capiDuvida from '../assets/image/artefacts/capi-duvida.png'
import capiExcited2 from '../assets/image/artefacts/capi-excited2.png'
import capiNeutral from '../assets/image/artefacts/capi-neutral.png'
import capiRef from '../assets/image/capi/capi-ref.jpeg'
import pointA from '../assets/image/mission1/point-a.svg'
import pointB from '../assets/image/mission1/point-b.svg'
import pointC from '../assets/image/mission1/point-c.svg'
import siteSlope from '../assets/image/mission1/site-encosta.jpg'
import sitePlain from '../assets/image/mission1/site-planicie.jpg'
import siteVale from '../assets/image/mission1/site-vale.jpg'
import solarPanel from '../assets/image/mission1/solar-panel.svg'

export const MEDIA = {
  player: {
    /** Head portrait used as map marker / hover character */
    head: astronautaCabeca,
  },
  capi: {
    /** Emblem for title / ready gate */
    emblem,
    /** Portrait used in PixelDialogBox / CapiDialog */
    neutral: capiNeutral,
    /** Excited portrait (confirm astronaut / celebration) */
    excited2: capiExcited2,
    /** Doubt / trade-off feedback (e.g. non-ideal panel site) */
    duvida: capiDuvida,
    ref: capiRef,
  },
  opening: {
    pixelDialogFrame: '/art/opening/pixel-dialog-frame.png',
    pixelDialogRef: '/art/opening/pixel-dialog-ref.png',
  },
  mission1: {
    pointA,
    pointB,
    pointC,
    panel: solarPanel,
    sites: {
      A: siteVale,
      B: sitePlain,
      C: siteSlope,
    },
  },
  /** Mission 02 sprites — public paths with SVG/icon UI fallbacks when missing. */
  mission2: {
    treadmill: '/assets/mission2/treadmill.png',
    resistance: '/assets/mission2/resistance.png',
    stretch: '/assets/mission2/stretch.png',
    balance: '/assets/mission2/balance.png',
    tray: '/assets/mission2/food-tray.svg',
    hygiene: '/assets/mission2/hygiene.svg',
    bunk: '/assets/mission2/bunk.svg',
  },
  /** Mission 03 — ice exploration (SVG fallbacks under public/assets/mission3). */
  mission3: {
    drill: '/assets/mission3/drill.svg',
    sample: '/assets/mission3/sample.svg',
    lab: '/assets/mission3/lab.svg',
    radar: '/assets/mission3/radar.svg',
    sectorAlpha: '/assets/mission3/sector-alpha.svg',
    sectorBeta: '/assets/mission3/sector-beta.svg',
    sectorGamma: '/assets/mission3/sector-gamma.svg',
    crater: '/assets/mission3/crater.svg',
    processIdentify: '/assets/mission3/process-identify.svg',
    processSeparate: '/assets/mission3/process-separate.svg',
    processMelt: '/assets/mission3/process-melt.svg',
    processFilter: '/assets/mission3/process-filter.svg',
    processTreat: '/assets/mission3/process-treat.svg',
    processQuality: '/assets/mission3/process-quality.svg',
    waterDrop: '/assets/mission3/water-drop.svg',
    camera: '/assets/mission3/camera.svg',
  },
  mission4: {
    greenhouse: '/assets/mission4/greenhouse.svg',
    cable: '/assets/mission4/cable.svg',
    pipe: '/assets/mission4/pipe.svg',
    mister: '/assets/mission4/mister.svg',
    leaf: '/assets/mission4/leaf.svg',
    berry: '/assets/mission4/berry.svg',
    grain: '/assets/mission4/grain.svg',
    flower: '/assets/mission4/flower.svg',
  },
  mission5: {
    dust: '/assets/mission5/dust.svg',
    hatch: '/assets/mission5/hatch.svg',
    shelter: '/assets/mission5/shelter.svg',
    antenna: '/assets/mission5/antenna.svg',
  },
} as const
