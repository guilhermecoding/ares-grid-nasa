import { getLevelDef } from '../data/levels'
import type { WorldState } from '../types/game'
import { MarsGrid } from './MarsGrid'
import { StardewHud } from './StardewHud'
import { TopStatusBar } from './TopStatusBar'

interface Props {
  state: WorldState
  muted: boolean
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

  const hudProps = {
    state,
    muted,
    canSleep,
    onMove,
    onInteract,
    onSleep,
    onToggleMute,
    onNasa,
    onHome,
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden p-1.5 sm:gap-2 sm:p-2"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 0%, rgba(88,40,140,0.35), transparent 45%), radial-gradient(ellipse at 80% 100%, rgba(20,40,90,0.4), transparent 40%)',
      }}
    >
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

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 landscape:flex-row landscape:gap-2">
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <MarsGrid state={state} onCellTap={onCellTap} />
        </div>

        <div className="shrink-0 landscape:hidden">
          <StardewHud {...hudProps} variant="bottom" />
        </div>

        <div className="hidden min-h-0 w-[min(240px,34%)] shrink-0 landscape:flex">
          <StardewHud {...hudProps} variant="lateral" />
        </div>
      </div>
    </div>
  )
}
