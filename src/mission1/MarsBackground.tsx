import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { SeasonId } from '../data/mission1Data'

interface Props {
  hour?: number
  season?: SeasonId
  storm?: boolean
  dustIntensity?: number
  className?: string
}

/** Procedural Arcadia Planitia backdrop — SVG layers + light dust (no heavy canvas loop). */
export function MarsBackground({
  hour = 12,
  season = 'summer_n',
  storm = false,
  dustIntensity = 0.35,
  className = '',
}: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const sunX = 20 + (hour / 24) * 60
  const sunY = season === 'summer_n' ? 18 + Math.abs(hour - 12) * 1.2 : 28 + Math.abs(hour - 12) * 1.6
  const skyTop = storm ? '#5a4030' : hour < 7 || hour > 19 ? '#3a2040' : '#c47848'
  const skyBot = storm ? '#8a5a38' : '#e8a878'

  const motes = useMemo(
    () =>
      Array.from({ length: storm ? 28 : 14 }, (_, i) => ({
        id: i,
        left: `${(i * 17 + 5) % 100}%`,
        top: `${20 + ((i * 29) % 60)}%`,
        delay: (i % 7) * 0.35,
        dur: 4 + (i % 5),
      })),
    [storm],
  )

  return (
    <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`} aria-hidden>
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          background: `linear-gradient(180deg, ${skyTop} 0%, ${skyBot} 48%, #b86a3a 70%, #8a3d22 100%)`,
        }}
      />

      {/* Sun */}
      <motion.div
        className="absolute size-[min(18vw,7rem)] rounded-full bg-[#ffe0a0] shadow-[0_0_40px_rgba(255,200,100,0.55)]"
        style={{ left: `${sunX}%`, top: `${sunY}%`, opacity: storm ? 0.35 : 0.95 }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Far hills */}
      <svg className="absolute inset-x-0 bottom-[28%] h-[22%] w-full" viewBox="0 0 400 80" preserveAspectRatio="none">
        <path d="M0 80 L0 40 Q40 10 80 38 T160 35 T240 42 T320 28 T400 45 L400 80 Z" fill="#9a4a28" opacity="0.85" />
        <path d="M0 80 L0 52 Q50 30 100 50 T200 48 T300 40 T400 55 L400 80 Z" fill="#7a3518" />
      </svg>

      {/* Mid plain */}
      <svg className="absolute inset-x-0 bottom-0 h-[42%] w-full" viewBox="0 0 400 120" preserveAspectRatio="none">
        <path d="M0 120 L0 40 Q60 20 120 38 T220 30 T320 42 T400 28 L400 120 Z" fill="#c46838" />
        <ellipse cx="70" cy="70" rx="28" ry="10" fill="#8a3d22" opacity="0.5" />
        <ellipse cx="300" cy="85" rx="40" ry="12" fill="#8a3d22" opacity="0.4" />
        <path d="M250 55 L262 40 L274 58 Z" fill="#6b2e18" />
        <path d="M40 60 L52 42 L64 62 Z" fill="#6b2e18" />
      </svg>

      {/* Dust motes — CSS/Framer only when tab visible */}
      {visible &&
        motes.map((m) => (
          <motion.span
            key={m.id}
            className="absolute size-1 rounded-full bg-[#f0d0a0]"
            style={{ left: m.left, top: m.top, opacity: dustIntensity * (storm ? 0.9 : 0.45) }}
            animate={{ x: [0, 24, -10, 0], y: [0, -16, 8, 0], opacity: [0.15, dustIntensity, 0.2] }}
            transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}

      {storm && <div className="absolute inset-0 bg-[#a06030]/35 mix-blend-multiply" />}
    </div>
  )
}
