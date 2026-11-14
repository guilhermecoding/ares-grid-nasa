import { weatherEmoji } from '../services/weatherService'
import type { BaseStats, QuestProgress, WeatherState } from '../types/game'

interface Props {
  level: number
  levelTitle: string
  quest: QuestProgress
  stats: BaseStats
  sol: number
  hour: number
  weather: WeatherState
  message: string | null
  cargo: 'none' | 'ice' | 'regolith'
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="min-w-[4.5rem] flex-1 sm:min-w-[5.5rem]">
      <div className="mb-0.5 flex justify-between text-[9px] font-bold leading-none text-void-300">
        <span>{label}</span>
        <span className="tabular-nums text-void-100">{Math.round(value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-void-950">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
        />
      </div>
    </div>
  )
}

export function TopStatusBar({
  level,
  levelTitle,
  quest,
  stats,
  sol,
  hour,
  weather,
  message,
  cargo,
}: Props) {
  const pct = Math.round((quest.current / Math.max(1, quest.target)) * 100)

  return (
    <header className="glass-panel shrink-0 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-[1.4]">
          <div className="flex items-baseline gap-2">
            <p className="truncate font-pixel text-[11px] leading-tight text-star sm:text-xs">
              Nv.{level} · {levelTitle}
            </p>
            <span className="shrink-0 text-[10px] font-bold tabular-nums text-void-300">
              {quest.current}/{quest.target}
            </span>
          </div>
          <p className="truncate text-[11px] font-bold leading-tight text-void-100 sm:text-xs">{quest.label}</p>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-void-950">
            <div className="h-full rounded-full bg-life" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          <MiniStat label="Energia" value={stats.energy} color="var(--color-energy)" />
          <MiniStat label="Base" value={stats.lifeSupport} color="var(--color-life)" />
          <MiniStat label="Escudo" value={stats.shield} color="var(--color-shield)" />
        </div>
      </div>

      <div className="mt-1 flex min-w-0 items-center gap-1.5 overflow-hidden text-[10px] text-void-300 sm:text-[11px]">
        <span className="shrink-0 font-pixel text-cyan-hud">Sol {sol}</span>
        <span className="shrink-0">{String(hour).padStart(2, '0')}:00</span>
        <span className="shrink-0 truncate">
          {weatherEmoji(weather.kind)} {weather.label}
        </span>
        {cargo !== 'none' && (
          <span className="shrink-0 rounded bg-nebula/25 px-1 font-bold text-void-100">
            {cargo === 'ice' ? '🧊' : '🪨'}
          </span>
        )}
        {message && <span className="min-w-0 truncate text-void-200">· {message}</span>}
      </div>
    </header>
  )
}
