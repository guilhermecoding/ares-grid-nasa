export type StormScene = 'dust' | 'shelter' | 'clear' | 'future'

interface Props {
  mode: StormScene
}

/** Sky and habitat change with the alert: dust wall, shielded cutaway, clear sky, finished base. */
export function MarsStormBackground({ mode }: Props) {
  const sky = mode === 'clear' || mode === 'future' ? '#ff9a3c' : mode === 'shelter' ? '#3a1a10' : '#7c2d12'
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg className="h-full w-full" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid slice">
        <rect width="800" height="480" fill={sky} />
        {mode === 'dust' ? (
          <>
            <path d="M0 180 Q200 80 400 160 T800 60 V480 H0 Z" fill="#9a3412" opacity="0.85" />
            <path d="M-40 80 Q180 200 420 90 T860 220" fill="none" stroke="#ffb15a" strokeWidth="18" opacity="0.55" />
            <rect x="520" y="250" width="180" height="90" fill="#1a2840" stroke="#7dffe0" strokeWidth="3" />
          </>
        ) : null}
        {mode === 'shelter' ? (
          <>
            <path d="M80 420 L180 220 H620 L720 420 Z" fill="#c2410c" />
            <rect x="220" y="250" width="360" height="150" fill="#0a1628" stroke="#7dffe0" strokeWidth="4" />
            <rect x="250" y="280" width="70" height="90" fill="#4ecbff" opacity="0.8" />
            <rect x="340" y="280" width="70" height="90" fill="#4ecbff" opacity="0.8" />
            {[120, 200, 600, 680].map((x) => (
              <circle key={x} cx={x} cy="200" r="6" fill="#fff4d2" opacity="0.7" />
            ))}
          </>
        ) : null}
        {mode === 'clear' || mode === 'future' ? (
          <>
            <path d="M0 300 Q200 250 400 280 T800 250 V480 H0 Z" fill="#e25812" />
            <path d="M0 360 Q240 320 480 350 T800 330 V480 H0 Z" fill="#9a3412" />
            <rect x="300" y="250" width="200" height="80" fill="#1a2840" stroke="#7dffe0" strokeWidth="3" />
            <path d="M180 330 Q260 180 340 330" fill="none" stroke="#d7fff4" strokeWidth="3" />
            {mode === 'future' ? <path d="M560 300 V180 M530 200 L560 170 L590 200" fill="none" stroke="#ffb15a" strokeWidth="4" /> : null}
          </>
        ) : null}
      </svg>
    </div>
  )
}
