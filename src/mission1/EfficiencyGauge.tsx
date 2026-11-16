import { useI18n } from '../i18n/locale'

const SIZE = 112
const STROKE = 10
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/** Low → red, mid → orange, high → green (continuous blend). */
export function efficiencyColor(pct: number): string {
  const t = Math.min(1, Math.max(0, (pct - 18) / (98 - 18)))
  const red = hexToRgb('#ff6b8a')
  const orange = hexToRgb('#ffb020')
  const green = hexToRgb('#5ecf9a')

  if (t < 0.45) {
    const u = t / 0.45
    return rgbToHex(lerp(red.r, orange.r, u), lerp(red.g, orange.g, u), lerp(red.b, orange.b, u))
  }
  const u = (t - 0.45) / 0.55
  return rgbToHex(lerp(orange.r, green.r, u), lerp(orange.g, green.g, u), lerp(orange.b, green.b, u))
}

interface Props {
  value: number
  active?: boolean
  className?: string
}

export function EfficiencyGauge({ value, active = false, className = '' }: Props) {
  const { t } = useI18n()
  const pct = Math.min(100, Math.max(0, value))
  const color = efficiencyColor(pct)
  const offset = CIRCUMFERENCE * (1 - pct / 100)

  return (
    <div
      className={`relative flex size-[5.25rem] flex-col items-center justify-center sm:size-[6.5rem] ${className}`}
      role="img"
      aria-label={t(`Predicted efficiency ${pct} percent`, `Eficiência prevista ${pct} por cento`)}
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(94,231,255,0.18)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.45s ease-out, stroke 0.35s ease' }}
        />
      </svg>
      <div className="relative z-[1] flex flex-col items-center leading-none">
        <span className="font-pixel text-lg text-[#f4fff4] sm:text-2xl" style={{ color }}>
          {pct}%
        </span>
        <span className="mt-0.5 text-[9px] tracking-wide text-cyan-hud/80 sm:text-[10px]">{t('Efficiency', 'Eficiência')}</span>
        {active ? <span className="mt-0.5 text-[8px] text-life">{t('Active', 'Ativo')}</span> : null}
      </div>
    </div>
  )
}
