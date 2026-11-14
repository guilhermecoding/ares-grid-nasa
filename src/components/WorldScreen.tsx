import { useCallback } from 'react'
import { getLevelDef } from '../data/levels'
import { updateProgress } from '../services/progressStore'
import type { WorldState } from '../types/game'
import { FloatingControls } from './FloatingControls'
import { MarsMap } from './MarsMap'
import { MessageBadge } from './MessageBadge'
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
    <div className="relative h-full min-h-0 overflow-hidden">
      <MarsMap state={state} onCellTap={onCellTap} />

      <TopStatusBar
        level={state.level}
        levelTitle={levelDef.title}
        quest={state.quest}
        stats={state.stats}
        sol={state.sol}
        hour={state.hour}
        weather={state.weather}
        cargo={state.rover.cargo}
      />

      <MessageBadge message={state.message} />

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
  )
}
