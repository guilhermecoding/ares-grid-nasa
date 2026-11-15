import type { BaseStats } from '../types/game'
import { IndicatorIcon } from './IndicatorIcon'
import { INDICATOR_META } from './indicatorIcons'

function StatPip({
  label,
  value,
  color,
  path,
}: {
  label: string
  value: number
  color: string
  path: string
}) {
  const shown = Math.round(Math.max(0, Math.min(100, value)))
  return (
    <div className="flex w-7 flex-col items-center gap-0.5 sm:w-8" title={`${label}: ${shown}%`}>
      <span className="sr-only">
        {label} {shown}%
      </span>
      <IndicatorIcon color={color} path={path} fill={shown / 100} />
      <span
        className="font-pixel text-[9px] leading-none tabular-nums text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)] sm:text-[10px]"
        aria-hidden
      >
        {shown}
      </span>
    </div>
  )
}

interface Props {
  stats: BaseStats
  className?: string
}

/** Energy / water / wellbeing — one icon each, fill level + value under the icon. */
export function ResourcePips({ stats, className = '' }: Props) {
  return (
    <div
      className={`flex flex-row flex-nowrap items-end gap-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] sm:gap-2.5 ${className}`}
    >
      <StatPip
        label={INDICATOR_META.energy.label}
        value={stats.energy}
        color={INDICATOR_META.energy.color}
        path={INDICATOR_META.energy.path}
      />
      <StatPip
        label={INDICATOR_META.water.label}
        value={stats.water}
        color={INDICATOR_META.water.color}
        path={INDICATOR_META.water.path}
      />
      <StatPip
        label={INDICATOR_META.wellbeing.label}
        value={stats.wellbeing}
        color={INDICATOR_META.wellbeing.color}
        path={INDICATOR_META.wellbeing.path}
      />
    </div>
  )
}
