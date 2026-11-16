import { useMemo } from 'react'
import { createPortal } from 'react-dom'

const COLORS = ['#5eead4', '#fbbf24', '#f472b6', '#4ade80', '#fb923c', '#a78bfa', '#f87171', '#38bdf8', '#fff7ae']

interface Piece {
  id: number
  left: string
  delay: string
  duration: string
  drift: string
  spin: string
  color: string
  w: number
  h: number
  radius: number
}

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => {
    const shape = i % 4
    return {
      id: i,
      left: `${(i * 41 + 7) % 100}%`,
      delay: `${(i % 14) * 0.06}s`,
      duration: `${2.2 + (i % 6) * 0.25}s`,
      drift: `${((i % 11) - 5) * 36}px`,
      spin: `${((i % 2 === 0 ? 1 : -1) * (280 + (i % 5) * 90))}deg`,
      color: COLORS[i % COLORS.length]!,
      w: shape === 0 ? 14 : shape === 1 ? 10 : shape === 2 ? 8 : 6,
      h: shape === 0 ? 8 : shape === 1 ? 10 : shape === 2 ? 16 : 6,
      radius: shape === 1 ? 999 : 2,
    }
  })
}

interface Props {
  count?: number
  className?: string
}

/** Full-viewport confetti via portal — escapes mission overflow/transform clipping. */
export function ConfettiBurst({ count = 80, className = '' }: Props) {
  const pieces = useMemo(() => makePieces(count), [count])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className={`confetti-layer ${className}`.trim()} aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            width: p.w,
            height: p.h,
            borderRadius: p.radius,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            ['--confetti-drift' as string]: p.drift,
            ['--confetti-spin' as string]: p.spin,
          }}
        />
      ))}
      {pieces.slice(0, 28).map((p) => (
        <span
          key={`burst-${p.id}`}
          className="confetti-burst"
          style={{
            width: Math.max(6, p.w - 2),
            height: Math.max(6, p.h - 2),
            borderRadius: p.radius,
            backgroundColor: COLORS[(p.id + 4) % COLORS.length],
            animationDelay: `${0.04 + (p.id % 10) * 0.03}s`,
            ['--burst-x' as string]: `${((p.id % 13) - 6) * 48}px`,
            ['--burst-y' as string]: `${-90 + (p.id % 7) * 55}px`,
            ['--confetti-spin' as string]: p.spin,
          }}
        />
      ))}
    </div>,
    document.body,
  )
}
