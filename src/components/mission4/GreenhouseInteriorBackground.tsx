interface Props {
  leds?: boolean
  mist?: boolean
  growth?: 0 | 1 | 2
}

/** Pressurized dome over the Arcadia horizon. Lights, mist and plants appear only after the crew installs them. */
export function GreenhouseInteriorBackground({ leds = false, mist = false, growth = 0 }: Props) {
  const plantH = growth === 0 ? 8 : growth === 1 ? 18 : 28
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#1a0d08]" aria-hidden>
      <svg className="h-full w-full" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="m4-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a120c" />
            <stop offset="55%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#ff9a3c" />
          </linearGradient>
          <linearGradient id="m4-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dffe0" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#4ecbff" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <rect width="800" height="480" fill="url(#m4-sky)" />
        <path d="M0 300 Q200 250 400 280 T800 250 V480 H0 Z" fill="#9a3412" />
        <path d="M0 340 Q240 300 480 330 T800 310 V480 H0 Z" fill="#7c2d12" />
        <ellipse cx="400" cy="430" rx="360" ry="40" fill="#3b140c" />
        <path d="M80 430 Q400 40 720 430" fill="url(#m4-glass)" stroke="#d7fff4" strokeWidth="4" />
        <path d="M400 70 V430 M180 250 H620 M250 150 H550" stroke="#fff4d2" strokeWidth="2" opacity="0.45" />
        {leds
          ? [220, 320, 420, 520].map((x) => (
              <rect key={x} x={x} y="118" width="28" height="10" rx="2" fill="#ff8ad4" opacity="0.9" />
            ))
          : null}
        {mist ? <ellipse cx="400" cy="340" rx="180" ry="28" fill="#d7f6ff" opacity="0.35" /> : null}
        {growth > 0
          ? [240, 330, 430, 520].map((x) => (
              <g key={x}>
                <rect x={x} y={400 - plantH} width="10" height={plantH} fill="#7dffb0" />
                <ellipse cx={x + 5} cy={400 - plantH} rx="12" ry="8" fill="#3d9a62" />
              </g>
            ))
          : null}
      </svg>
    </div>
  )
}
