import type { CSSProperties } from 'react'

/** Colour tokens read by the kit classes (`gk-panel`, `Tag`, `StepTabs`…). */
export const MISSION_THEMES = {
  greenhouse: {
    '--gk-line': '#1f6b66',
    '--gk-accent': '#5ecf9a',
    '--gk-panel': 'rgba(9, 20, 34, 0.94)',
    '--gk-glow': 'rgba(94, 207, 154, 0.6)',
  } as CSSProperties,
  alert: {
    '--gk-line': '#8a4a1c',
    '--gk-accent': '#ffb15a',
    '--gk-panel': 'rgba(20, 11, 12, 0.94)',
    '--gk-glow': 'rgba(255, 177, 90, 0.6)',
  } as CSSProperties,
  comms: {
    '--gk-line': '#2b5fa8',
    '--gk-accent': '#7dd3fc',
    '--gk-panel': 'rgba(6, 14, 30, 0.95)',
    '--gk-glow': 'rgba(125, 211, 252, 0.6)',
  } as CSSProperties,
} as const

export type MissionTheme = keyof typeof MISSION_THEMES
