import type { ReactNode } from 'react'
import type { BaseStats } from '../types/game'

const PIP_COUNT = 5

function fillAmount(value: number, index: number): number {
  const units = Math.max(0, Math.min(100, value)) / 20
  const full = Math.floor(units)
  if (index < full) return 1
  if (index > full) return 0
  return Math.max(0, Math.min(1, units - full))
}

function PixelPip({
  fill,
  color,
  path,
}: {
  fill: number
  color: string
  path: string
}) {
  return (
    <svg viewBox="0 0 16 16" className="size-4 sm:size-[1.15rem]" aria-hidden>
      <path d={path} fill="none" stroke="#1a1028" strokeWidth="1.45" strokeLinejoin="round" />
      <path
        d={path}
        fill={color}
        opacity={fill <= 0 ? 0.22 : 1}
        style={
          fill > 0 && fill < 1 ? { clipPath: `inset(${(1 - fill) * 100}% 0 0 0)` } : undefined
        }
      />
    </svg>
  )
}

const BOLT = 'M9 1 L4 9 H8 L7 15 L12 7 H8 Z'
const LEAF = 'M8 2 C12 3 14 7 13 11 C11 14 8 15 8 15 C8 15 5 14 3 11 C2 7 4 3 8 2 Z'
const SHIELD = 'M8 1 L14 4 V8 C14 12 10 15 8 15 C6 15 2 12 2 8 V4 Z'

function PipRow({
  label,
  value,
  color,
  path,
  extra,
}: {
  label: string
  value: number
  color: string
  path: string
  extra?: ReactNode
}) {
  return (
    <div className="flex items-center gap-0.5" title={`${label}: ${Math.round(value)}%`}>
      <span className="sr-only">
        {label} {Math.round(value)}%
      </span>
      {Array.from({ length: PIP_COUNT }, (_, i) => (
        <span key={i} className="relative">
          <PixelPip fill={fillAmount(value, i)} color={color} path={path} />
          {extra}
        </span>
      ))}
    </div>
  )
}

export function ResourcePips({ stats }: { stats: BaseStats }) {
  return (
    <div className="flex flex-col gap-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
      <PipRow label="Energia" value={stats.energy} color="var(--color-energy)" path={BOLT} />
      <PipRow label="Base" value={stats.lifeSupport} color="var(--color-life)" path={LEAF} />
      <PipRow label="Escudo" value={stats.shield} color="var(--color-shield)" path={SHIELD} />
    </div>
  )
}
