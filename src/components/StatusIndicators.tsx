import type { BaseStats } from '../types/game'
import { ResourcePips } from './ResourcePips'

interface Props {
  stats: BaseStats
  /** Screen corner / placement — world map vs mission HUD. */
  placement?: 'world' | 'mission' | 'inline'
  className?: string
}

/** Compact top HUD strip for mission map and in-mission screens. */
export function StatusIndicators({ stats, placement = 'world', className = '' }: Props) {
  const position =
    placement === 'inline'
      ? ''
      : placement === 'mission'
        ? 'absolute top-3 left-3 z-40'
        : 'absolute top-3 right-3 z-30 sm:top-4 sm:right-4'

  return (
    <div
      className={`pointer-events-none ${position} ${className}`.trim()}
      role="status"
      aria-label="Indicadores da base"
    >
      <div className="pointer-events-auto rounded-md border border-cyan-hud/25 bg-[#0a1628]/35 px-2 py-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.22)] backdrop-blur-[2px] sm:px-2.5 sm:py-2">
        <ResourcePips stats={stats} />
      </div>
    </div>
  )
}
