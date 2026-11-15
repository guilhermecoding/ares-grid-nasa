/** Centralized media paths for the opening sequence and shared UI. */

export const MEDIA = {
  capi: {
    /** Emblem for title / ready gate */
    emblem: '/assets/artefacts/arcadia_emblema_capivara.png',
    /** Portrait used in PixelDialogBox / CapiDialog */
    neutral: '/assets/artefacts/capi-neutral.png',
    /** Excited portrait (confirm astronaut / celebration) */
    excited2: '/assets/artefacts/capi-excited2.png',
    ref: '/assets/capi/capi-ref.jpeg',
  },
  opening: {
    pixelDialogFrame: '/art/opening/pixel-dialog-frame.png',
    pixelDialogRef: '/art/opening/pixel-dialog-ref.png',
  },
  mission1: {
    pointA: '/assets/mission1/point-a.svg',
    pointB: '/assets/mission1/point-b.svg',
    pointC: '/assets/mission1/point-c.svg',
    panel: '/assets/mission1/solar-panel.svg',
  },
} as const
