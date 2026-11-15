import type { PlantGroupId } from '../../data/mission4Data'

/** Tray art is 984×702. Each bed is one diamond of the isometric tray. */
export const TRAY_VIEWBOX = '0 0 984 702'

export const TRAY_BEDS: Record<PlantGroupId, { points: string; cx: number; cy: number; color: string }> = {
  fruit: { points: '296,152 480,36 696,150 498,282', cx: 50.1, cy: 22.1, color: '#ff6b8a' },
  veggie: { points: '50,312 262,168 470,300 262,442', cx: 26.5, cy: 43.5, color: '#5ecf9a' },
  flower: { points: '532,300 742,166 938,290 722,428', cx: 74.5, cy: 42.2, color: '#b78bff' },
  grain: { points: '302,456 482,318 684,446 500,588', cx: 50, cy: 64.4, color: '#f0b429' },
}

export const TRAY_ORDER: readonly PlantGroupId[] = ['fruit', 'veggie', 'flower', 'grain']

/** Plant size for each growth stage: seedling, sprout, full plant. */
export const GROWTH_SCALE = [0.36, 0.64, 1] as const
