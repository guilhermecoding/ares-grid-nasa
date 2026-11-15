import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Mission3Stage } from '../../components/mission3/Mission3Stage'
import { SciTermM3 } from '../../components/mission3/SciTermM3'
import {
  CAPI_DRILL,
  DRILL_COOL_RATE,
  DRILL_ENERGY_PER_LOG,
  DRILL_LAYERS,
  DRILL_LOG_DEPTHS_M,
  DRILL_OVERHEAT_ENERGY,
  DRILL_OVERHEAT_LOCK_MS,
  DRILL_TARGET_M,
  drillLayerAt,
  formatDepth,
} from '../../data/mission3Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  siteName: string
  energy: number
  waterL: number
  /** 0–1 share of the background cross-section depth. */
  onDepthChange: (fraction: number) => void
  onSpend: (n: number) => void
  onExtract: () => void
}

interface Sim {
  depth: number
  heat: number
  lockedUntil: number
  overheats: number
  logged: number
}

const COLUMN_DEPTH_M = DRILL_LAYERS[DRILL_LAYERS.length - 1]!.to
const START: Sim = { depth: 0, heat: 0, lockedUntil: 0, overheats: 0, logged: 0 }

function heatColor(heat: number) {
  if (heat >= 80) return '#ff6b8a'
  if (heat >= 55) return '#facc15'
  return '#5ecf9a'
}

/** Desafio 3.3 — hold-to-drill with heat management. */
export function DrillingStep({ siteName, energy, waterL, onDepthChange, onSpend, onExtract }: Props) {
  const [sim, setSim] = useState<Sim>(START)
  const [holding, setHolding] = useState(false)
  const [locked, setLocked] = useState(false)
  const simRef = useRef<Sim>(START)
  const holdingRef = useRef(false)
  const callbacksRef = useRef({ onDepthChange, onSpend })

  const done = sim.depth >= DRILL_TARGET_M
  const noEnergy = energy <= 0

  useEffect(() => {
    callbacksRef.current = { onDepthChange, onSpend }
  }, [onDepthChange, onSpend])

  useEffect(() => {
    holdingRef.current = holding
  }, [holding])

  useEffect(() => {
    let raf = 0
    let last = 0
    let noiseAcc = 0
    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
      last = now
      const prev = simRef.current
      const next = { ...prev }
      const isLocked = now < prev.lockedUntil

      if (next.depth >= DRILL_TARGET_M) {
        next.heat = Math.max(0, next.heat - DRILL_COOL_RATE * dt)
      } else if (!isLocked && holdingRef.current) {
        const layer = drillLayerAt(next.depth)
        next.depth = Math.min(DRILL_TARGET_M, next.depth + layer.speed * dt)
        next.heat = Math.min(100, next.heat + layer.heat * dt)
        noiseAcc += dt
        if (noiseAcc > 0.22) {
          noiseAcc = 0
          soundEngine.step()
        }
        if (next.heat >= 100) {
          next.lockedUntil = now + DRILL_OVERHEAT_LOCK_MS
          next.overheats += 1
          holdingRef.current = false
          setHolding(false)
          setLocked(true)
          soundEngine.fail()
          callbacksRef.current.onSpend(DRILL_OVERHEAT_ENERGY)
        }
        while (next.logged < DRILL_LOG_DEPTHS_M.length && next.depth >= DRILL_LOG_DEPTHS_M[next.logged]!) {
          next.logged += 1
          callbacksRef.current.onSpend(DRILL_ENERGY_PER_LOG)
          soundEngine.telemetry()
        }
        if (next.depth >= DRILL_TARGET_M) {
          holdingRef.current = false
          setHolding(false)
          soundEngine.success()
        }
      } else {
        next.heat = Math.max(0, next.heat - DRILL_COOL_RATE * dt)
      }

      if (prev.lockedUntil && !isLocked && now >= prev.lockedUntil) {
        next.lockedUntil = 0
        setLocked(false)
        soundEngine.click()
      }

      if (next.depth !== prev.depth || next.heat !== prev.heat || next.lockedUntil !== prev.lockedUntil) {
        simRef.current = next
        setSim(next)
        if (next.depth !== prev.depth) callbacksRef.current.onDepthChange(next.depth / COLUMN_DEPTH_M)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const canHold = !done && !locked && !noEnergy
  const startHold = () => {
    if (!canHold) return
    holdingRef.current = true
    setHolding(true)
  }
  const stopHold = () => {
    holdingRef.current = false
    setHolding(false)
  }

  const layer = drillLayerAt(sim.depth)
  const capiTip = done
    ? null
    : locked
      ? CAPI_DRILL.overheat
      : layer.id === 'rock' && sim.depth > layer.from
        ? CAPI_DRILL.rock
        : CAPI_DRILL.start
  const depthPct = (sim.depth / COLUMN_DEPTH_M) * 100
  const hot = heatColor(sim.heat)

  return (
    <Mission3Stage
      title="Desafio 3.3 — Perfuração Exploratória"
      subtitle={
        <>
          {siteName}: desça até o gelo a {formatDepth(DRILL_TARGET_M)} atravessando o{' '}
          <SciTermM3 term="Regolito">regolito</SciTermM3> e a rocha sem superaquecer a broca.
        </>
      }
      energy={energy}
      waterL={waterL}
      capiTip={capiTip}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-3 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-4">
        <section
          className={`relative h-[22rem] overflow-hidden rounded border-2 bg-[#0a1628]/92 md:h-[26rem] ${done ? 'border-life' : 'border-cyan-hud/30'}`}
          aria-label="Corte do subsolo"
        >
          {DRILL_LAYERS.map((l) => (
            <div
              key={l.id}
              className="absolute inset-x-0 border-t border-black/30"
              style={{
                top: `${(l.from / COLUMN_DEPTH_M) * 100}%`,
                height: `${((l.to - l.from) / COLUMN_DEPTH_M) * 100}%`,
                background:
                  l.id === 'ice'
                    ? 'linear-gradient(180deg,#7ec8e8,#d6f6ff)'
                    : `repeating-linear-gradient(135deg, ${l.color} 0 10px, color-mix(in srgb, ${l.color} 82%, black) 10px 14px)`,
              }}
            >
              <span className="absolute top-0.5 left-1 font-pixel text-[8px] text-[#f4fff4]/85 drop-shadow">{l.label}</span>
            </div>
          ))}
          <div
            className="absolute inset-x-0 border-t-2 border-dashed border-cyan-hud"
            style={{ top: `${(DRILL_TARGET_M / COLUMN_DEPTH_M) * 100}%` }}
          >
            <span className="absolute -top-4 right-1 font-pixel text-[8px] text-cyan-hud">ALVO {formatDepth(DRILL_TARGET_M)}</span>
          </div>
          <div
            className="absolute left-1/2 w-2 -translate-x-1/2 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500"
            style={{ top: 0, height: `${depthPct}%` }}
          />
          <motion.div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: `calc(${depthPct}% - 2px)` }}
            animate={holding ? { x: ['-52%', '-48%', '-52%'] } : { x: '-50%' }}
            transition={holding ? { duration: 0.08, repeat: Infinity } : { duration: 0.1 }}
          >
            <svg viewBox="0 0 24 28" className="h-8 w-7" aria-hidden>
              <polygon points="2,0 22,0 12,28" fill={sim.heat >= 80 ? '#fb7185' : '#e2e8f0'} />
              <polyline points="4,6 20,6 6,12 18,12 8,18 15,18" fill="none" stroke="#475569" strokeWidth="1.6" />
            </svg>
            {holding ? (
              <div className="absolute top-6 left-1/2 flex -translate-x-1/2 gap-1" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="block size-1.5"
                    style={{ background: layer.id === 'ice' ? '#e0f7ff' : '#fbbf24' }}
                    animate={{ y: [0, -14], x: [(i - 1) * 4, (i - 1) * 12], opacity: [1, 0] }}
                    transition={{ duration: 0.35, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            ) : null}
          </motion.div>
          {sim.heat >= 60 ? (
            <div
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: `inset 0 0 ${sim.heat / 2}px ${hot}` }}
              aria-hidden
            />
          ) : null}
        </section>

        <div className="flex min-w-0 flex-col gap-3">
          <section className="grid gap-3 rounded border-2 border-cyan-hud/30 bg-[#0a1628]/92 p-3 sm:grid-cols-2 md:p-4">
            <div>
              <p className="font-pixel text-[10px] text-cyan-hud">PROFUNDIDADE</p>
              <p className="font-pixel text-3xl text-[#f4fff4] tabular-nums md:text-4xl" aria-live="polite">
                {formatDepth(sim.depth)}
              </p>
              <p className="text-sm text-void-100/80">
                Camada atual: <span className="font-semibold text-[#f4fff4]">{layer.label}</span>
              </p>
            </div>
            <div>
              <p className="flex justify-between font-pixel text-[10px] text-cyan-hud">
                <span>TEMPERATURA DA BROCA</span>
                <span style={{ color: hot }}>{Math.round(sim.heat)}%</span>
              </p>
              <div
                className="mt-2 h-5 border-2 border-black/50 bg-void-900"
                role="progressbar"
                aria-label="Temperatura da broca"
                aria-valuenow={Math.round(sim.heat)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full transition-[background-color]" style={{ width: `${sim.heat}%`, background: hot }} />
              </div>
              <p className={`mt-1 text-sm ${locked ? 'font-semibold text-danger' : 'text-void-100/80'}`}>
                {locked
                  ? 'Broca travada para resfriar…'
                  : holding
                    ? 'Perfurando — solte para esfriar.'
                    : 'Solte o botão para a broca esfriar.'}
              </p>
            </div>
          </section>

          <section className="rounded border-2 border-cyan-hud/30 bg-[#0a1628]/92 p-3 md:p-4">
            <p className="font-pixel text-[10px] text-cyan-hud">REGISTRO DE PROFUNDIDADE</p>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-4">
              {DRILL_LOG_DEPTHS_M.map((d, i) => {
                const ok = i < sim.logged
                return (
                  <li
                    key={d}
                    className={`border-2 px-2 py-1.5 text-sm ${ok ? 'border-life bg-life/10 text-[#f4fff4]' : 'border-void-600 text-void-100/50'}`}
                  >
                    <span className="font-pixel text-xs">{formatDepth(d)}</span>
                    <span className="block text-xs">{ok ? drillLayerAt(Math.max(0, d - 0.01)).label : 'aguardando'}</span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-2 text-xs text-void-100/70">
              Cada registro gasta {DRILL_ENERGY_PER_LOG}% de energia. Superaquecer custa mais {DRILL_OVERHEAT_ENERGY}%.
              {sim.overheats > 0 ? ` Superaquecimentos: ${sim.overheats}.` : ''}
            </p>
          </section>

          {done ? (
            <section className="rounded border-2 border-life bg-[#0a1628]/92 p-3 md:p-4">
              <p className="font-pixel text-xs text-life">GELO SUBTERRÂNEO ALCANÇADO</p>
              {CAPI_DRILL.done.map((line) => (
                <p key={line} className="mt-1 text-sm text-[#f4fff4] md:text-base">
                  {line}
                </p>
              ))}
              <McButton className="mc-btn-green mt-3 min-h-12 px-5 font-pixel" onClick={onExtract}>
                Extrair cilindro de gelo
              </McButton>
            </section>
          ) : (
            <button
              type="button"
              disabled={!canHold}
              className={`mc-btn min-h-16 w-full touch-none font-pixel text-base select-none md:text-lg ${
                holding ? 'mc-btn-green' : ''
              } ${!canHold ? 'opacity-60' : ''}`}
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                startHold()
              }}
              onPointerUp={stopHold}
              onPointerCancel={stopHold}
              onLostPointerCapture={stopHold}
              onContextMenu={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                  e.preventDefault()
                  startHold()
                }
              }}
              onKeyUp={(e) => {
                if (e.key === ' ' || e.key === 'Enter') stopHold()
              }}
              onBlur={stopHold}
            >
              {locked ? '🔥 RESFRIANDO A BROCA…' : '⚙️ SEGURAR PARA PERFURAR'}
            </button>
          )}
        </div>
      </div>
    </Mission3Stage>
  )
}
