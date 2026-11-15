import type { BaseStats } from '../types/game'

function PixelIcon({ color, path }: { color: string; path: string }) {
  return (
    <svg viewBox="0 0 16 16" className="size-5 sm:size-[1.35rem]" aria-hidden style={{ imageRendering: 'pixelated' }}>
      <path d={path} fill="none" stroke="#1a1028" strokeWidth="1.45" strokeLinejoin="round" />
      <path d={path} fill={color} />
    </svg>
  )
}

const BOLT = 'M9 1 L4 9 H8 L7 15 L12 7 H8 Z'
const LEAF = 'M8 2 C12 3 14 7 13 11 C11 14 8 15 8 15 C8 15 5 14 3 11 C2 7 4 3 8 2 Z'
const SHIELD = 'M8 1 L14 4 V8 C14 12 10 15 8 15 C6 15 2 12 2 8 V4 Z'

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
      <PixelIcon color={color} path={path} />
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

/** Energy / life / shield — one icon each, value under the icon. */
export function ResourcePips({ stats, className = '' }: Props) {
  return (
    <div
      className={`flex flex-row flex-nowrap items-end gap-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] sm:gap-2.5 ${className}`}
    >
      <StatPip label="Energia" value={stats.energy} color="var(--color-energy)" path={BOLT} />
      <StatPip label="Vida" value={stats.lifeSupport} color="var(--color-life)" path={LEAF} />
      <StatPip label="Escudo" value={stats.shield} color="var(--color-shield)" path={SHIELD} />
    </div>
  )
}
