/** Shared SVG paths + colors for base indicator icons (HUD + result cards). */

export const INDICATOR_PATHS = {
  energy: 'M9 1 L4 9 H8 L7 15 L12 7 H8 Z',
  water: 'M8 1 C8 1 3 7 3 10 C3 13 5.2 15 8 15 C10.8 15 13 13 13 10 C13 7 8 1 8 1 Z',
  wellbeing:
    'M8 14.2 L2.4 8.4 C0.4 6.4 0.5 3.4 2.6 1.9 C4.3 0.7 6.5 1.1 8 2.6 C9.5 1.1 11.7 0.7 13.4 1.9 C15.5 3.4 15.6 6.4 13.6 8.4 Z',
} as const

export type IndicatorKind = keyof typeof INDICATOR_PATHS

export const INDICATOR_META: Record<
  IndicatorKind,
  { label: string; color: string; path: string }
> = {
  energy: { label: 'Energia', color: 'var(--color-energy)', path: INDICATOR_PATHS.energy },
  water: { label: 'Água', color: 'var(--color-life)', path: INDICATOR_PATHS.water },
  wellbeing: { label: 'Saúde', color: 'var(--color-wellbeing)', path: INDICATOR_PATHS.wellbeing },
}
