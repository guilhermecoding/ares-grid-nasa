import { useCallback } from 'react'
import { getLevelDef } from '../data/levels'
import { updateProgress } from '../services/progressStore'
import type { WorldState } from '../types/game'
import { FloatingControls } from './FloatingControls'
import { MarsMap } from './MarsMap'
import { TopStatusBar } from './TopStatusBar'

interface Props {
  state: WorldState
  muted: boolean
  showControlHints: boolean
  onControlHintsDone: () => void
  onMove: (dx: number, dy: number) => void
  onInteract: () => void
  onSleep: () => void
  onCellTap: (x: number, y: number) => void
  onToggleMute: () => void
  onNasa: () => void
  onHome: () => void
}

export function WorldScreen({
  state,
  muted,
  showControlHints,
  onControlHintsDone,
  onMove,
  onInteract,
  onSleep,
  onCellTap,
  onToggleMute,
  onNasa,
  onHome,
}: Props) {
  const levelDef = getLevelDef(state.level)
  const canSleep = state.grid[state.rover.y]![state.rover.x]!.type === 'HABITAT'

  const handleLabelsDone = useCallback(() => {
    updateProgress({ controlsHintSeen: true })
    onControlHintsDone()
  }, [onControlHintsDone])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="relative z-30 shrink-0 p-1.5 sm:p-2">
        <TopStatusBar
          level={state.level}
          levelTitle={levelDef.title}
          quest={state.quest}
          stats={state.stats}
          sol={state.sol}
          hour={state.hour}
          weather={state.weather}
          message={state.message}
          cargo={state.rover.cargo}
        />
      </div>

      <div className="relative min-h-0 flex-1">
        <MarsMap state={state} onCellTap={onCellTap} />
        <FloatingControls
          canSleep={canSleep}
          muted={muted}
          showLabels={showControlHints}
          onLabelsDone={handleLabelsDone}
          onMove={onMove}
          onInteract={onInteract}
          onSleep={onSleep}
          onToggleMute={onToggleMute}
          onNasa={onNasa}
          onHome={onHome}
        />
      </div>
    </div>
  )
}
