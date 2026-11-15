import { useCallback } from 'react'
import { updateProgress } from '../services/progressStore'
import type { WorldState } from '../types/game'
import { FloatingControls } from './FloatingControls'
import { MarsMap } from './MarsMap'

interface Props {
  state: WorldState
  muted: boolean
  showControlHints: boolean
  onControlHintsDone: () => void
  onEnterMission: (level: number) => void
  onToggleMute: () => void
  onNasa: () => void
  onHome: () => void
}

export function WorldScreen({
  state,
  muted,
  showControlHints,
  onControlHintsDone,
  onEnterMission,
  onToggleMute,
  onNasa,
  onHome,
}: Props) {
  const handleLabelsDone = useCallback(() => {
    updateProgress({ controlsHintSeen: true })
    onControlHintsDone()
  }, [onControlHintsDone])

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      <MarsMap state={state} onEnterMission={onEnterMission} />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-3 pt-3 sm:pt-4">
        <h1 className="rounded border border-cyan-hud/40 bg-[#0a1628]/88 px-3 py-2 text-center font-pixel text-sm tracking-wide text-cyan-hud shadow-[0_0_18px_rgba(94,231,255,0.25)] sm:px-5 sm:text-lg md:text-xl">
          Missões em Arcadia Planitia
        </h1>
      </header>

      <FloatingControls
        canSleep={false}
        muted={muted}
        showLabels={showControlHints}
        onLabelsDone={handleLabelsDone}
        onMove={() => {}}
        onInteract={() => {}}
        onSleep={() => {}}
        onToggleMute={onToggleMute}
        onNasa={onNasa}
        onHome={onHome}
        mapMode
      />
    </div>
  )
}
