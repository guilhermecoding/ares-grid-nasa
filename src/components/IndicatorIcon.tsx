interface Props {
  path: string
  color: string
  /** 0–1 vertical fill from the bottom. */
  fill: number
  className?: string
}

/** Pixel-style indicator glyph with bottom-up fill. */
export function IndicatorIcon({ path, color, fill, className = 'size-5 sm:size-[1.35rem]' }: Props) {
  const amount = Math.max(0, Math.min(1, fill))
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden
      style={{ imageRendering: 'pixelated' }}
    >
      <path d={path} fill="none" stroke="#1a1028" strokeWidth="1.45" strokeLinejoin="round" />
      <path d={path} fill={color} opacity={0.22} />
      <path
        d={path}
        fill={color}
        opacity={amount <= 0 ? 0 : 1}
        style={amount > 0 && amount < 1 ? { clipPath: `inset(${(1 - amount) * 100}% 0 0 0)` } : undefined}
      />
    </svg>
  )
}
