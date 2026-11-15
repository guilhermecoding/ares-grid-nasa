/** Shared SVG paths + colors for base indicator icons (HUD + result cards). */

export const INDICATOR_PATHS = {
  energy: 'M9 1 L4 9 H8 L7 15 L12 7 H8 Z',
  water: 'M8 1 C8 1 3 7 3 10 C3 13 5.2 15 8 15 C10.8 15 13 13 13 10 C13 7 8 1 8 1 Z',
  wellbeing: 'M8 1 L14 4 V8 C14 12 10 15 8 15 C6 15 2 12 2 8 V4 Z',
} as const

export type IndicatorKind = keyof typeof INDICATOR_PATHS

export const INDICATOR_META: Record<
  IndicatorKind,
  { label: string; color: string; path: string }
> = {
  energy: { label: 'Energia', color: 'var(--color-energy)', path: INDICATOR_PATHS.energy },
  water: { label: 'Água', color: 'var(--color-life)', path: INDICATOR_PATHS.water },
  wellbeing: { label: 'Bem-estar', color: 'var(--color-shield)', path: INDICATOR_PATHS.wellbeing },
}
