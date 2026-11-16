import { weatherEmoji } from '../services/weatherService'
import type { BaseStats, QuestProgress, WeatherState } from '../types/game'
import { ResourcePips } from './ResourcePips'

interface Props {
  level: number
  levelTitle: string
  quest: QuestProgress
  stats: BaseStats
  sol: number
  hour: number
  weather: WeatherState
  cargo: 'none' | 'ice' | 'regolith'
}

export function TopStatusBar({
  level,
  levelTitle,
  quest,
  stats,
  sol,
  hour,
  weather,
  cargo,
}: Props) {
  const pct = Math.round((quest.current / Math.max(1, quest.target)) * 100)

  return (
    <header className="pointer-events-none absolute right-2 top-2 z-30 max-w-[min(280px,58vw)] sm:right-3 sm:top-3">
      <div className="pointer-events-auto rounded-xl bg-void-950/70 px-2.5 py-2 shadow-[0_4px_18px_rgba(0,0,0,0.4)] ring-1 ring-nebula/35 backdrop-blur-md">
        <div className="flex items-baseline gap-2">
          <p className="truncate font-pixel text-[11px] leading-tight text-star sm:text-xs">
            Nv.{level} · {levelTitle}
          </p>
          <span className="shrink-0 text-[10px] font-bold tabular-nums text-void-300">
            {quest.current}/{quest.target}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[11px] font-bold leading-tight text-void-100">{quest.label}</p>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-void-900">
          <div className="h-full rounded-full bg-life" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-2 overflow-x-auto">
          <ResourcePips stats={stats} />
        </div>

        <div className="mt-2 flex min-w-0 items-center gap-1.5 overflow-hidden text-[10px] text-void-300">
          <span className="shrink-0 font-pixel text-cyan-hud">Sol {sol}</span>
          <span className="shrink-0">{String(hour).padStart(2, '0')}:00</span>
          <span className="min-w-0 truncate">
            {weatherEmoji(weather.kind)} {weather.label}
          </span>
          {cargo !== 'none' && (
            <span className="shrink-0 rounded bg-nebula/25 px-1 font-bold text-void-100">
              {cargo === 'ice' ? '🧊' : '🪨'}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
