import { useEffect, useRef, useState } from 'react'
import { Home, Radiation, ShieldHalf, Sprout, type LucideIcon } from 'lucide-react'
import { ChallengeBar } from '../../components/missionKit/kit'
import { MEDIA } from '../../constants/mediaAssets'
import { SHELTERS, type ShelterId } from '../../data/mission5Data'
import { useI18n } from '../../i18n/locale'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  /** The run waits while Capi is talking. */
  paused?: boolean
  onFail: (reason: string) => void
  onSafe: () => void
}

/** Field coordinates run 0–100 on both axes. */
const ROCKS = [
  { x: 36, y: 30 },
  { x: 55, y: 68 },
]
const ROCK_RADIUS = 9
const DOOR_X = 80
/** Field units per second. */
const SPEED = 62
/** Dose points per second: about 12 s from the start to the limit. */
const DOSE_RATE = 7

const DOOR_ICONS: Record<ShelterId, LucideIcon> = {
  greenhouse: Sprout,
  surface: Home,
  shield: ShieldHalf,
}

function blocked(x: number, y: number) {
  return ROCKS.some((rock) => Math.hypot(x - rock.x, y - rock.y) < ROCK_RADIUS)
}

function doorAt(y: number): ShelterId {
  return y < 34 ? 'greenhouse' : y < 67 ? 'surface' : 'shield'
}

export function RadiationRun({ paused = false, onFail, onSafe }: Props) {
  const { t, locale } = useI18n()
  const [pos, setPos] = useState({ x: 8, y: 50 })
  const [dose, setDose] = useState(12)
  const [goal, setGoal] = useState<{ x: number; y: number } | null>(null)
  const [facingLeft, setFacingLeft] = useState(false)
  const target = useRef<{ x: number; y: number } | null>(null)
  const posRef = useRef(pos)
  const doseRef = useRef(12)
  const ended = useRef(false)
  const failRef = useRef(onFail)
  const safeRef = useRef(onSafe)
  const pausedRef = useRef(paused)

  useEffect(() => {
    failRef.current = onFail
    safeRef.current = onSafe
    pausedRef.current = paused
  })

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => soundEngine.siren(), 1400)
    return () => window.clearInterval(id)
  }, [paused])

  useEffect(() => {
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (pausedRef.current) {
        frame = window.requestAnimationFrame(tick)
        return
      }
      if (!ended.current) {
        doseRef.current = Math.min(100, doseRef.current + DOSE_RATE * dt)
        setDose(doseRef.current)
        if (Math.random() < (1.2 + (doseRef.current / 100) * 10) * dt) soundEngine.geiger()
        if (doseRef.current >= 100) {
          ended.current = true
          failRef.current('dose')
        }
      }
      const aim = target.current
      if (aim && !ended.current) {
        const current = posRef.current
        const dx = aim.x - current.x
        const dy = aim.y - current.y
        const dist = Math.hypot(dx, dy)
        if (dist < 0.6) {
          target.current = null
          setGoal(null)
        } else {
          const reach = SPEED * dt
          const stride = Math.min(reach, dist)
          let x = current.x + (dx / dist) * stride
          let y = current.y + (dy / dist) * stride
          if (blocked(x, y)) {
            // Slide around the rock instead of stopping against it.
            const side = dy >= 0 ? 1 : -1
            x = current.x
            y = current.y + side * reach
            if (blocked(x, y)) y = current.y - side * reach
            if (blocked(x, y)) y = current.y
          }
          const next = { x: Math.max(4, Math.min(92, x)), y: Math.max(10, Math.min(90, y)) }
          posRef.current = next
          setPos(next)
          if (next.x > DOOR_X) {
            ended.current = true
            if (doorAt(next.y) === 'shield') safeRef.current()
            else failRef.current('door')
          }
        }
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const aimAt = (next: { x: number; y: number }) => {
    target.current = next
    setGoal(next)
    setFacingLeft(next.x < posRef.current.x)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const current = posRef.current
      const next = { ...current }
      if (e.key === 'ArrowLeft') next.x -= 8
      if (e.key === 'ArrowRight') next.x += 8
      if (e.key === 'ArrowUp') next.y -= 10
      if (e.key === 'ArrowDown') next.y += 10
      if (next.x !== current.x || next.y !== current.y) {
        e.preventDefault()
        target.current = next
        setGoal(next)
        setFacingLeft(next.x < current.x)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const doseColor = dose < 50 ? '#f0b429' : dose < 80 ? '#ff8a3c' : '#ff3b5c'
  const nearDoor = pos.x > 62 ? doorAt(pos.y) : null

  return (
    <>
      <ChallengeBar
        code="5.3"
        title={t('Run to the right shelter', 'Corra para o abrigo certo')}
        icon={<Radiation className="gk-blink size-5" aria-hidden />}
        counterLabel={t('Dose', 'Dose')}
        value={`${Math.round(dose)}%`}
        hint={t(
          'Tap the path or use the arrow keys. Go around the rocks and enter the shelter that stops solar radiation.',
          'Toque no caminho ou use as setas. Desvie das rochas e entre no abrigo que segura a radiação solar.',
        )}
      />

      <div className="gk-panel p-3">
        <div className="flex items-center gap-2" role="meter" aria-label={t('Radiation dose', 'Dose de radiação')} aria-valuenow={Math.round(dose)} aria-valuemin={0} aria-valuemax={100}>
          <Radiation className="size-5 shrink-0" style={{ color: doseColor }} aria-hidden />
          <div className="h-4 flex-1 border-2 border-[#30346d] bg-[#04080f]">
            <div className="h-full" style={{ width: `${dose}%`, background: doseColor, boxShadow: `0 0 10px ${doseColor}` }} />
          </div>
        </div>

        <div
          className="relative mt-3 h-[clamp(15rem,46dvh,26rem)] w-full touch-none overflow-hidden border-4 border-[#8a4a1c] bg-[linear-gradient(180deg,#6a2c16,#3b140c)] select-none"
          style={{ touchAction: 'none' }}
          role="application"
          aria-label={t('Running field to the shelters', 'Campo de corrida até os abrigos')}
          onPointerDown={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            aimAt({
              x: ((e.clientX - rect.left) / rect.width) * 100,
              y: ((e.clientY - rect.top) / rect.height) * 100,
            })
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.25)_1px,transparent_1.5px)] bg-[length:18px_18px]" aria-hidden />
          <div className="gk-rays absolute inset-0" aria-hidden />
          <div className="gk-alarm absolute inset-0 bg-danger" aria-hidden />

          {ROCKS.map((rock) => (
            <span
              key={`${rock.x}-${rock.y}`}
              className="absolute h-[19%] w-[15%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[4px_6px_0_rgba(0,0,0,0.4)]"
              style={{ left: `${rock.x}%`, top: `${rock.y}%` }}
              aria-hidden
            >
              <span className="absolute inset-0 bg-[#2a0f0c] [clip-path:polygon(16%_6%,58%_0,92%_18%,100%_62%,80%_96%,32%_100%,4%_78%,0_32%)]" />
              <span className="absolute inset-[5px] bg-[linear-gradient(150deg,#c9774a,#8a4424_45%,#4a1f10)] [clip-path:polygon(16%_6%,58%_0,92%_18%,100%_62%,80%_96%,32%_100%,4%_78%,0_32%)]" />
            </span>
          ))}

          {SHELTERS.map((door, index) => {
            const Icon = DOOR_ICONS[door.id]
            const near = nearDoor === door.id
            return (
              <div
                key={door.id}
                className={`absolute right-0 flex h-[31%] w-[19%] flex-col items-center justify-center gap-1 border-4 border-r-0 px-1 text-center transition-colors ${
                  near ? 'border-[#f4fff4] bg-[#2a3142]' : 'border-[#8f9bb3] bg-[#1b2233]'
                }`}
                style={{ top: `${1.5 + index * 33}%` }}
              >
                <Icon className="size-6 text-[#f4fff4] md:size-8" aria-hidden />
                <span className="font-pixel text-[9px] leading-tight text-[#f4fff4] uppercase sm:text-xs">{door.title[locale]}</span>
              </div>
            )
          })}

          {goal ? (
            <span
              className="pointer-events-none absolute size-8 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${goal.x}%`, top: `${goal.y}%` }}
              aria-hidden
            >
              <span className="gk-ping absolute inset-0 rounded-full border-2 border-[#f4fff4]" />
              <span className="absolute inset-[38%] rounded-full bg-[#f4fff4]" />
            </span>
          ) : null}

          <img
            src={MEDIA.mission4.astronaut}
            alt={t('Astronaut', 'Astronauta')}
            draggable={false}
            className={`gk-pixelated pointer-events-none absolute h-[24%] ${goal ? 'gk-walk' : ''}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              translate: '-50% -60%',
              scale: facingLeft ? '-1 1' : undefined,
              filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.4))',
            }}
          />
        </div>
      </div>
    </>
  )
}
