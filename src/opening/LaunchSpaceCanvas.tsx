import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  z: number
  pz: number
}

interface LaunchSpaceCanvasProps {
  /** 0 = cruise, 1 = full warp */
  warp?: number
  /** Show pulsing hologram light in cockpit center */
  hologramActive?: boolean
  /** Cockpit frame overlay (off for full-bleed title space) */
  cockpit?: boolean
  className?: string
}

function RealisticCockpit({ hologramActive }: { hologramActive: boolean }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="steelTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a5560" />
          <stop offset="35%" stopColor="#2c333c" />
          <stop offset="100%" stopColor="#14181e" />
        </linearGradient>
        <linearGradient id="steelSide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a1e24" />
          <stop offset="40%" stopColor="#3a4450" />
          <stop offset="100%" stopColor="#12161c" />
        </linearGradient>
        <linearGradient id="consoleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d4652" />
          <stop offset="20%" stopColor="#232a33" />
          <stop offset="100%" stopColor="#0c0f13" />
        </linearGradient>
        <linearGradient id="screenGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a3a28" />
          <stop offset="100%" stopColor="#0a1610" />
        </linearGradient>
        <radialGradient id="glassSheen" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="rgba(180,210,255,0.12)" />
          <stop offset="55%" stopColor="rgba(80,100,140,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer hull shadow */}
      <rect x="0" y="0" width="100" height="100" fill="#05070a" opacity="0.15" />

      {/* Top structural beam */}
      <path d="M0 0 H100 V11 L88 16 H12 L0 11 Z" fill="url(#steelTop)" />
      <path d="M0 0 H100 V3.2 H0 Z" fill="#6a7582" opacity="0.35" />
      <path d="M12 16 H88 L86 18 H14 Z" fill="#0a0c10" opacity="0.7" />
      {/* Rivets top */}
      {[8, 18, 28, 38, 50, 62, 72, 82, 92].map((x) => (
        <circle key={`tr-${x}`} cx={x} cy="5.5" r="0.55" fill="#1a1e24" stroke="#7a8694" strokeWidth="0.15" />
      ))}

      {/* Left pillar */}
      <path d="M0 0 V100 H9 L14 78 V18 L9 11 Z" fill="url(#steelSide)" />
      <path d="M0 0 V100 H2.2 V0 Z" fill="#0a0c10" opacity="0.5" />
      <path d="M9 18 V78 L11 76 V20 Z" fill="#5a6570" opacity="0.25" />
      {[22, 34, 46, 58, 70].map((y) => (
        <circle key={`lr-${y}`} cx="4.2" cy={y} r="0.5" fill="#1a1e24" stroke="#7a8694" strokeWidth="0.12" />
      ))}

      {/* Right pillar */}
      <path d="M100 0 V100 H91 L86 78 V18 L91 11 Z" fill="url(#steelSide)" />
      <path d="M100 0 V100 H97.8 V0 Z" fill="#0a0c10" opacity="0.5" />
      <path d="M91 18 V78 L89 76 V20 Z" fill="#5a6570" opacity="0.25" />
      {[22, 34, 46, 58, 70].map((y) => (
        <circle key={`rr-${y}`} cx="95.8" cy={y} r="0.5" fill="#1a1e24" stroke="#7a8694" strokeWidth="0.12" />
      ))}

      {/* Window bevel */}
      <path
        d="M14 18 H86 V78 H14 Z"
        fill="none"
        stroke="#8a95a2"
        strokeWidth="0.35"
        opacity="0.55"
      />
      <path
        d="M15.2 19.2 H84.8 V76.8 H15.2 Z"
        fill="none"
        stroke="#1a1e24"
        strokeWidth="0.55"
        opacity="0.85"
      />
      <rect x="15.2" y="19.2" width="69.6" height="57.6" fill="url(#glassSheen)" />

      {/* Corner instrument pods */}
      <rect x="15.8" y="19.8" width="9" height="6.5" rx="0.4" fill="#1a222c" stroke="#5a6570" strokeWidth="0.2" />
      <rect x="16.4" y="20.4" width="7.8" height="3.2" rx="0.2" fill="url(#screenGlow)" />
      <rect x="16.4" y="24.2" width="2.2" height="1.2" rx="0.15" fill="#2ecc71" opacity="0.7">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.8s" repeatCount="indefinite" />
      </rect>
      <rect x="19.2" y="24.2" width="2.2" height="1.2" rx="0.15" fill="#f0b429" opacity="0.65" />
      <rect x="22" y="24.2" width="2.2" height="1.2" rx="0.15" fill="#4ea1ff" opacity="0.55" />

      <rect x="75.2" y="19.8" width="9" height="6.5" rx="0.4" fill="#1a222c" stroke="#5a6570" strokeWidth="0.2" />
      <rect x="75.8" y="20.4" width="7.8" height="5.2" rx="0.2" fill="#121820" stroke="#2a3540" strokeWidth="0.15" />
      <circle cx="79.7" cy="23" r="1.8" fill="none" stroke="#5ee7ff" strokeWidth="0.25" opacity="0.7">
        <animateTransform attributeName="transform" type="rotate" from="0 79.7 23" to="360 79.7 23" dur="8s" repeatCount="indefinite" />
      </circle>
      <circle cx="79.7" cy="23" r="0.35" fill="#5ee7ff" opacity="0.8" />

      {/* Bottom command console */}
      <path d="M0 100 H100 V76 Q50 71 0 76 Z" fill="url(#consoleGrad)" />
      <path d="M9 78 H91 L88 100 H12 Z" fill="#161b22" opacity="0.55" />
      <path d="M0 76 H100 V78 H0 Z" fill="#6a7582" opacity="0.28" />

      {/* Console deck plate */}
      <rect x="12" y="80" width="76" height="16" rx="0.6" fill="#1c232c" stroke="#4a5560" strokeWidth="0.25" />
      <rect x="13" y="81" width="74" height="0.35" fill="#6a7582" opacity="0.3" />

      {/* Left mini screen */}
      <rect x="14.5" y="82.2" width="14" height="9.5" rx="0.35" fill="#0a1014" stroke="#3a4450" strokeWidth="0.25" />
      <rect x="15.1" y="82.8" width="12.8" height="7" rx="0.2" fill="url(#screenGlow)" />
      <polyline
        points="16,88 18,85.5 20,86.5 22,83.5 24,85 26.5,84"
        fill="none"
        stroke="#2ecc71"
        strokeWidth="0.22"
        opacity="0.85"
      >
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
      </polyline>
      <text x="15.5" y="91" fill="#5a9a6a" fontSize="1.1" fontFamily="monospace">
        NAV
      </text>

      {/* Center telemetry bars */}
      <rect x="31" y="82.5" width="18" height="10" rx="0.35" fill="#121820" stroke="#3a4450" strokeWidth="0.2" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={`bar-${i}`}>
          <rect x={32.2 + i * 3.2} y="83.5" width="2.4" height="7.5" rx="0.15" fill="#0a0e12" />
          <rect
            x={32.2 + i * 3.2}
            y={83.5 + (5 - i) * 0.9}
            width="2.4"
            height={2.5 + i * 1.1}
            rx="0.15"
            fill={i < 2 ? '#2ecc71' : i < 4 ? '#f0b429' : '#e67a2e'}
            opacity="0.85"
          >
            <animate
              attributeName="height"
              values={`${2.5 + i * 1.1};${3.5 + i * 1.1};${2.5 + i * 1.1}`}
              dur={`${1.4 + i * 0.25}s`}
              repeatCount="indefinite"
            />
          </rect>
        </g>
      ))}

      {/* Central hologram / status lamp */}
      <circle
        cx="55.5"
        cy="87.5"
        r={hologramActive ? 3.2 : 2.2}
        fill={hologramActive ? '#5ee7ff' : '#2a4058'}
        opacity={hologramActive ? 0.95 : 0.55}
        filter="url(#softGlow)"
      >
        {hologramActive && (
          <>
            <animate attributeName="r" values="2.6;3.6;2.6" dur="1.1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.55;1;0.55" dur="1.1s" repeatCount="indefinite" />
          </>
        )}
      </circle>
      <circle cx="55.5" cy="87.5" r="1.1" fill="#0a1018" opacity="0.45" />

      {/* Toggle switches */}
      {[62, 66, 70, 74].map((x, i) => (
        <g key={`sw-${x}`}>
          <rect x={x} y="83" width="3.2" height="5.5" rx="0.25" fill="#0e1318" stroke="#4a5560" strokeWidth="0.15" />
          <rect
            x={x + 0.45}
            y={i % 2 === 0 ? 83.4 : 85.8}
            width="2.3"
            height="2.2"
            rx="0.2"
            fill={i % 2 === 0 ? '#e67a2e' : '#4a5560'}
          />
        </g>
      ))}

      {/* Right status LEDs + small screen */}
      <rect x="79" y="82.2" width="14" height="9.5" rx="0.35" fill="#0a1014" stroke="#3a4450" strokeWidth="0.25" />
      <rect x="79.6" y="82.8" width="12.8" height="5.5" rx="0.2" fill="#101820" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={`led-${i}`} cx={81.2 + i * 2} cy="85.5" r="0.55" fill={['#2ecc71', '#2ecc71', '#f0b429', '#4ea1ff', '#e67a2e', '#5ee7ff'][i]}>
          <animate attributeName="opacity" values="0.35;1;0.35" dur={`${1.1 + i * 0.2}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <text x="80.2" y="90.5" fill="#7a8694" fontSize="1.05" fontFamily="monospace">
        CMD DECK
      </text>

      {/* Bottom rivets on console lip */}
      {[14, 26, 38, 50, 62, 74, 86].map((x) => (
        <circle key={`br-${x}`} cx={x} cy="79.2" r="0.4" fill="#1a1e24" stroke="#6a7582" strokeWidth="0.12" />
      ))}
    </svg>
  )
}

export function LaunchSpaceCanvas({
  warp = 0.55,
  hologramActive = false,
  cockpit = true,
  className = '',
}: LaunchSpaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const warpRef = useRef(warp)
  const rafRef = useRef(0)

  useEffect(() => {
    warpRef.current = warp
  }, [warp])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    const stars: Star[] = []
    const STAR_COUNT = 180

    const resize = () => {
      const parent = canvas.parentElement
      const rect = parent?.getBoundingClientRect()
      w = Math.max(1, Math.floor(rect?.width || parent?.clientWidth || window.innerWidth))
      h = Math.max(1, Math.floor(rect?.height || parent?.clientHeight || window.innerHeight))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const resetStar = (s: Star, randomZ = true) => {
      s.x = (Math.random() - 0.5) * w * 2
      s.y = (Math.random() - 0.5) * h * 2
      s.z = randomZ ? Math.random() * w : w
      s.pz = s.z
    }

    for (let i = 0; i < STAR_COUNT; i++) {
      const s: Star = { x: 0, y: 0, z: 0, pz: 0 }
      resetStar(s)
      stars.push(s)
    }

    resize()
    const onResize = () => resize()
    window.addEventListener('resize', onResize)

    let earthY = h * 0.92
    const t0 = performance.now()

    const draw = (now: number) => {
      const t = (now - t0) / 1000
      const speed = 4 + warpRef.current * 28
      ctx.fillStyle = '#05030c'
      ctx.fillRect(0, 0, w, h)

      const neb = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, w * 0.6)
      neb.addColorStop(0, 'rgba(40,80,160,0.2)')
      neb.addColorStop(1, 'transparent')
      ctx.fillStyle = neb
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2

      for (const s of stars) {
        s.pz = s.z
        s.z -= speed
        if (s.z <= 1) {
          resetStar(s, false)
          continue
        }
        const sx = cx + (s.x / s.z) * w * 0.5
        const sy = cy + (s.y / s.z) * h * 0.5
        const px = cx + (s.x / s.pz) * w * 0.5
        const py = cy + (s.y / s.pz) * h * 0.5
        const alpha = Math.min(1, (1 - s.z / w) * 1.4)
        ctx.strokeStyle = `rgba(200,220,255,${alpha})`
        ctx.lineWidth = Math.max(1, (1 - s.z / w) * 2.2)
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(sx, sy)
        ctx.stroke()
      }

      earthY = h * (0.78 + 0.18 * (1 - Math.min(1, warpRef.current)))
      const earthR = w * 1.4
      const earthGrad = ctx.createRadialGradient(cx, earthY + earthR * 0.55, earthR * 0.4, cx, earthY + earthR * 0.55, earthR)
      earthGrad.addColorStop(0, '#1a6bb5')
      earthGrad.addColorStop(0.45, '#0d3d6e')
      earthGrad.addColorStop(0.7, 'rgba(40,120,200,0.35)')
      earthGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = earthGrad
      ctx.beginPath()
      ctx.arc(cx, earthY + earthR * 0.55, earthR, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = `rgba(94,231,255,${0.35 + Math.sin(t * 2) * 0.1})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(cx, earthY + earthR * 0.55, earthR * 0.72, Math.PI * 1.05, Math.PI * 1.95)
      ctx.stroke()

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className={`absolute inset-0 h-full w-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      {cockpit ? <RealisticCockpit hologramActive={hologramActive} /> : null}
    </div>
  )
}
