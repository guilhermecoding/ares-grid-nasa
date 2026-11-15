import type { CSSProperties, ReactNode } from 'react'
import { Check } from 'lucide-react'
import { McButton } from '../../opening/McButton'

/** Small label chip used on scenes and cards. */
export function Tag({
  children,
  tone = 'accent',
  className = '',
}: {
  children: ReactNode
  tone?: 'accent' | 'ok' | 'energy' | 'water' | 'danger' | 'muted'
  className?: string
}) {
  const color =
    tone === 'energy'
      ? 'border-energy text-energy'
      : tone === 'ok'
        ? 'border-life text-[#7dffb0]'
      : tone === 'water'
        ? 'border-[#38bdf8] text-[#7dd3fc]'
        : tone === 'danger'
          ? 'border-danger text-[#ffc2cf]'
          : tone === 'muted'
            ? 'border-[#30346d] text-[#f4fff4]/60'
            : 'border-(--gk-accent) text-(--gk-accent)'
  return (
    <span
      className={`inline-flex items-center gap-1 border bg-[#04080f]/85 px-2 py-1 font-pixel text-[10px] leading-none tracking-wide uppercase ${color} ${className}`}
    >
      {children}
    </span>
  )
}

/** "DESAFIO 4.1 — …" strip with a live counter on the right. */
export function ChallengeBar({
  code,
  title,
  icon,
  counterLabel,
  value,
  total,
  hint,
}: {
  code: string
  title: string
  icon?: ReactNode
  counterLabel: string
  value: number | string
  total?: number
  hint?: ReactNode
}) {
  const complete = total != null && value === total
  return (
    <div className="gk-panel flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {icon ? <span className="shrink-0 text-(--gk-accent)">{icon}</span> : null}
        <p className="font-pixel text-xs leading-snug text-(--gk-accent) uppercase md:text-sm">
          Desafio {code} — <span className="text-[#f4fff4]">{title}</span>
        </p>
      </div>
      <p
        className={`flex shrink-0 items-center gap-2 border px-2 py-1 font-pixel text-xs uppercase ${
          complete ? 'border-life bg-life/15 text-[#7dffb0]' : 'border-[#30346d] text-[#7dd3fc]'
        }`}
        aria-live="polite"
      >
        {counterLabel}:{' '}
        <span key={String(value)} className="gk-pop inline-block text-sm text-[#f4fff4]">
          {value}
          {total != null ? `/${total}` : ''}
        </span>
      </p>
      {hint ? <p className="w-full text-sm leading-snug text-[#f4fff4]/85 md:text-base">{hint}</p> : null}
    </div>
  )
}

/** Progress strip under the mission title. Past steps keep a check. */
export function StepTabs({ tabs, current }: { tabs: readonly string[]; current: number }) {
  return (
    <ol className="mt-2 flex flex-wrap gap-1.5" aria-label="Etapas da missão">
      {tabs.map((label, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={label}
            aria-current={active ? 'step' : undefined}
            className={`flex items-center gap-1 border px-2 py-1 font-pixel text-[10px] leading-none md:text-xs ${
              active
                ? 'border-(--gk-accent) bg-(--gk-accent) text-[#04130c]'
                : done
                  ? 'border-(--gk-line) bg-[#04080f]/70 text-(--gk-accent)'
                  : 'border-[#262b4d] bg-[#04080f]/50 text-[#f4fff4]/40'
            }`}
          >
            {done ? <Check className="size-3" strokeWidth={3} aria-hidden /> : null}
            {label}
          </li>
        )
      })}
    </ol>
  )
}

/** Big green "next challenge" bar. */
export function GameCta({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <McButton className="mc-btn-green gk-pop min-h-14 w-full px-4 font-pixel text-sm md:text-base" onClick={onClick}>
      {children} ▸
    </McButton>
  )
}

/** Horizontal gauge with a label, a value and a filling bar. */
export function BarMeter({
  label,
  value,
  display,
  color,
  icon,
  className = '',
}: {
  label: string
  /** 0–100 */
  value: number
  display?: string
  color: string
  icon?: ReactNode
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={`min-w-0 ${className}`} role="meter" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <p className="flex items-center justify-between gap-2 font-pixel text-[10px] leading-none text-[#f4fff4]/85 uppercase">
        <span className="flex items-center gap-1">
          {icon}
          {label}
        </span>
        <span style={{ color }}>{display ?? `${Math.round(pct)}%`}</span>
      </p>
      <div className="mt-1 h-2.5 border border-[#30346d] bg-[#04080f]">
        <div
          className="h-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  )
}

/** Row of pips to compare costs at a glance. */
export function PipMeter({
  label,
  filled,
  total,
  color,
  value,
  icon,
}: {
  label: string
  filled: number
  total: number
  color: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div className="flex items-center gap-2" aria-label={`${label}: ${value}`}>
      <span className="flex w-20 shrink-0 items-center gap-1 font-pixel text-[10px] text-[#f4fff4]/85 uppercase">
        {icon}
        {label}
      </span>
      <span className="flex gap-1" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="h-3 w-2.5 border border-[#04080f]"
            style={{ background: i < filled ? color : '#1b2440', boxShadow: i < filled ? `0 0 6px ${color}` : undefined }}
          />
        ))}
      </span>
      <span className="font-pixel text-[10px]" style={{ color }}>
        {value}
      </span>
    </div>
  )
}

const BURST_ANGLES = [0, 40, 85, 130, 170, 215, 260, 305]

/**
 * One-shot spark burst. Mount it with a fresh `key` to replay.
 * The parent needs `position: relative`.
 */
export function Burst({ color = '#f0b429', className = 'left-1/2 top-1/2' }: { color?: string; className?: string }) {
  return (
    <span className={`pointer-events-none absolute z-20 ${className}`} aria-hidden>
      {BURST_ANGLES.map((angle, i) => {
        const distance = 26 + (i % 3) * 12
        const style = {
          background: i % 2 ? color : '#ffffff',
          '--burst-x': `${Math.round(Math.cos((angle * Math.PI) / 180) * distance)}px`,
          '--burst-y': `${Math.round(Math.sin((angle * Math.PI) / 180) * distance)}px`,
          '--confetti-spin': `${angle}deg`,
          animationName: 'confetti-pop',
          animationDuration: '0.6s',
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards',
        } as CSSProperties
        return <span key={angle} className="absolute size-1.5" style={style} />
      })}
    </span>
  )
}

/** "−4% energia" style number that floats up and fades. Mount with a fresh `key`. */
export function FloatDelta({ children, color = '#f0b429', className = '' }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span
      className={`gk-float-up pointer-events-none absolute z-20 font-pixel text-xs whitespace-nowrap ${className}`}
      style={{ color, textShadow: '1px 1px 0 #04080f' }}
      aria-hidden
    >
      {children}
    </span>
  )
}
