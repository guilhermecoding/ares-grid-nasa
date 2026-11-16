import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import {
  CAPI_POTABILITY,
  POTABILITY_INDICATORS,
  RETREAT_ENERGY_COST,
  WATER_REWARD_L,
  type PotabilityId,
} from '../../../data/mission3Data'
import { MEDIA } from '../../../constants/mediaAssets'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { CapiBeat } from '../CapiBeat'
import { Mission3Stage } from '../Mission3Stage'
import { SciTermM3 } from '../SciTermM3'

interface Props {
  energy: number
  waterL: number
  initialTreated?: boolean
  initialAnalyzed?: readonly PotabilityId[]
  onSpend: (n: number) => void
  onApprove: (liters: number) => void
  onProgress: (treated: boolean, analyzed: PotabilityId[]) => void
  onEnergyShort: () => void
  onContinue: () => void
}

const SCAN_MS = 650

function AssayIcon({ id }: { id: PotabilityId }) {
  const stroke = '#5ee7ff'
  return (
    <svg viewBox="0 0 64 64" className="size-12 shrink-0" aria-hidden>
      <rect width="64" height="64" rx="8" fill="#1a2840" />
      {id === 'ph' ? (
        <>
          <path d="M26 14h12M32 14v10" stroke="#f4fff4" strokeWidth="3" />
          <path d="M22 28h20l-4 22a8 8 0 0 1-12 0L22 28z" stroke={stroke} strokeWidth="3" fill="#0b3a4a" />
          <path d="M24 40h16" stroke="#7dd3fc" strokeWidth="3" />
        </>
      ) : null}
      {id === 'conductivity' ? (
        <path d="M10 34h10l6-14 8 24 6-14h14" stroke={stroke} strokeWidth="3" fill="none" strokeLinejoin="round" />
      ) : null}
      {id === 'chemicals' ? (
        <>
          <circle cx="24" cy="28" r="8" stroke="#f4fff4" strokeWidth="3" />
          <circle cx="40" cy="36" r="10" stroke={stroke} strokeWidth="3" />
        </>
      ) : null}
      {id === 'metals' ? (
        <path d="M32 12l16 8v16L32 52 16 36V20l16-8z" stroke="#f4fff4" strokeWidth="3" fill="#3a2a12" />
      ) : null}
      {id === 'microbes' ? (
        <>
          <circle cx="32" cy="32" r="12" stroke={stroke} strokeWidth="3" />
          <circle cx="32" cy="32" r="4" fill="#5ee7ff" />
          <path d="M32 14v6M32 44v6M14 32h6M44 32h6" stroke="#f4fff4" strokeWidth="3" />
        </>
      ) : null}
      {id === 'treatment' ? (
        <>
          <path d="M18 16h28v8L34 36v14h-4V36L18 24v-8z" stroke={stroke} strokeWidth="3" fill="#0b3a4a" />
          <path d="M24 20h16" stroke="#f4fff4" strokeWidth="3" />
        </>
      ) : null}
    </svg>
  )
}

function AssayCard({
  id,
  label,
  done,
  ok,
  busy,
  waiting,
  safe,
  unsafe,
  onAnalyze,
}: {
  id: PotabilityId
  label: string
  done: boolean
  ok: boolean
  busy: boolean
  waiting: boolean
  safe: string
  unsafe?: string
  onAnalyze: () => void
}) {
  return (
    <motion.button
      type="button"
      disabled={!waiting && !busy}
      whileTap={waiting ? { scale: 0.97 } : undefined}
      animate={busy ? { scale: [1, 1.04, 1] } : waiting ? { scale: [1, 1.03, 1] } : done && !ok ? { x: [0, -8, 8, -5, 0] } : { scale: 1, x: 0 }}
      transition={busy || waiting ? { duration: busy ? 0.45 : 1.15, repeat: Infinity } : { duration: 0.35 }}
      onClick={onAnalyze}
      className={`relative flex min-h-36 flex-col items-start gap-2 overflow-hidden rounded border-4 bg-[#0a1628]/92 p-3 text-left ${
        busy ? 'border-cyan-hud shadow-[0_0_18px_rgba(94,231,255,0.35)]' : done && ok ? 'border-life' : done ? 'border-danger' : 'border-energy shadow-[0_0_16px_rgba(250,204,21,0.28)]'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      {busy ? (
        <motion.span
          className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-hud/45 to-transparent"
          initial={{ left: '-50%' }}
          animate={{ left: '110%' }}
          transition={{ duration: SCAN_MS / 1000, ease: 'linear' }}
          aria-hidden
        />
      ) : null}
      <span className="flex w-full items-center justify-between gap-2">
        <AssayIcon id={id} />
        <span className={`font-pixel text-sm ${done && ok ? 'text-life' : done ? 'text-danger' : 'text-energy'}`}>
          {busy ? 'LENDO…' : done && ok ? '✓ OK' : done ? '✕ FORA' : 'ABERTO'}
        </span>
      </span>
      <span className="text-base font-semibold text-[#f4fff4]">
        {id === 'conductivity' ? <SciTermM3 term="Condutividade Elétrica">{label}</SciTermM3> : label}
      </span>
      {waiting ? <span className="font-pixel text-base text-energy">TOQUE AQUI</span> : null}
      {done ? <span className={`text-sm ${ok ? 'text-life' : 'text-danger'}`}>{ok ? safe : unsafe ?? 'fora do padrão'}</span> : null}
    </motion.button>
  )
}

/** Desafio 3.6 — six lab indicators, first round fails on salts. */
export function PotabilityStep({
  energy,
  waterL,
  initialTreated = false,
  initialAnalyzed = [],
  onSpend,
  onApprove,
  onProgress,
  onEnergyShort,
  onContinue,
}: Props) {
  const [treated, setTreated] = useState(initialTreated)
  const [analyzed, setAnalyzed] = useState<Set<PotabilityId>>(() => new Set(initialAnalyzed))
  const [scanning, setScanning] = useState<PotabilityId | null>(null)
  const alreadyOk =
    initialAnalyzed.length === POTABILITY_INDICATORS.length &&
    POTABILITY_INDICATORS.every((ind) => initialTreated || !ind.failsInitially)
  const [approved, setApproved] = useState(alreadyOk)
  const [beat, setBeat] = useState<{ id: string; lines: readonly string[] } | null>(
    alreadyOk || initialAnalyzed.length > 0
      ? null
      : { id: 'm3-pot-intro', lines: ['Toque em cada indicador para analisar a água.', 'Água transparente ainda pode esconder sal.'] },
  )
  const timerRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
  }, [])

  const passes = (id: PotabilityId) => treated || !POTABILITY_INDICATORS.find((i) => i.id === id)!.failsInitially
  const roundDone = analyzed.size === POTABILITY_INDICATORS.length
  const failing = roundDone && POTABILITY_INDICATORS.some((i) => !passes(i.id))
  const allGreen = roundDone && !failing

  const analyze = (id: PotabilityId) => {
    if (scanning || analyzed.has(id) || approved) return
    soundEngine.telemetry()
    setScanning(id)
    timerRef.current = window.setTimeout(() => {
      setScanning(null)
      const next = new Set(analyzed).add(id)
      setAnalyzed(next)
      onProgress(treated, [...next])
      const ok = passes(id)
      if (ok) soundEngine.click()
      else soundEngine.fail()
      if (next.size < POTABILITY_INDICATORS.length) return
      const anyFail = POTABILITY_INDICATORS.some((i) => !passes(i.id))
      if (anyFail) {
        setBeat({ id: 'm3-pot-fail', lines: CAPI_POTABILITY.fail })
      } else {
        setApproved(true)
        onApprove(WATER_REWARD_L)
        soundEngine.success()
        setBeat({ id: 'm3-pot-pass', lines: CAPI_POTABILITY.pass })
      }
    }, SCAN_MS)
  }

  const retreat = () => {
    if (energy < RETREAT_ENERGY_COST) {
      soundEngine.fail()
      onEnergyShort()
      return
    }
    onSpend(RETREAT_ENERGY_COST)
    soundEngine.harvest()
    setTreated(true)
    setAnalyzed(new Set())
    onProgress(true, [])
    setBeat({ id: 'm3-pot-retry', lines: ['Tratamento refeito!', 'Agora repita a análise dos 6 indicadores.'] })
  }

  return (
    <Mission3Stage
      title="Desafio 3.6 — Testando a Potabilidade"
      subtitle={
        <>
          Água transparente pode esconder sais e <SciTermM3 term="Percloratos">percloratos</SciTermM3>. Analise os 6
          indicadores de <SciTermM3 term="Potabilidade">potabilidade</SciTermM3>.
        </>
      }
      energy={energy}
      waterL={waterL}
      overlay={beat ? <CapiBeat id={beat.id} lines={beat.lines} onDone={() => setBeat(null)} /> : null}
    >
      <section
        className={`mx-auto w-full max-w-6xl rounded border-2 bg-[#0a1628]/92 p-3 md:p-4 ${
          allGreen ? 'border-life' : failing ? 'border-danger' : 'border-cyan-hud/30'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-pixel text-sm text-cyan-hud">
            {treated ? 'ANÁLISE 2 · APÓS NOVO TRATAMENTO' : 'ANÁLISE 1'} · {analyzed.size}/{POTABILITY_INDICATORS.length}
          </p>
          <p
            className={`font-pixel text-xs md:text-sm ${allGreen ? 'text-life' : failing ? 'text-danger' : 'text-void-100/70'}`}
            aria-live="polite"
          >
            {allGreen ? 'APROVADO PARA CONSUMO' : failing ? 'CONSUMO BLOQUEADO' : 'EM ANÁLISE'}
          </p>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POTABILITY_INDICATORS.map((ind) => {
            const done = analyzed.has(ind.id)
            const busy = scanning === ind.id
            return (
              <AssayCard
                key={ind.id}
                id={ind.id}
                label={ind.label}
                done={done}
                ok={passes(ind.id)}
                busy={busy}
                waiting={!done && !scanning && !approved}
                safe={ind.safe}
                unsafe={ind.unsafe}
                onAnalyze={() => analyze(ind.id)}
              />
            )
          })}
        </div>

        {failing ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={retreat}
            className="mc-btn mt-3 min-h-14 w-full font-pixel text-sm md:text-base"
            style={{ touchAction: 'manipulation' }}
          >
            Executar Novo Tratamento e Repetir Análise (−{RETREAT_ENERGY_COST}% de energia)
          </motion.button>
        ) : null}
      </section>

      {approved ? (
        <motion.section
          className="mx-auto w-full max-w-6xl rounded border-2 border-life bg-[#0a1628]/92 p-3 md:p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="flex items-center gap-2 font-pixel text-sm text-life md:text-base">
            <img src={MEDIA.mission3.waterDrop} alt="" className="size-10 object-contain" draggable={false} />
            +{WATER_REWARD_L} L na reserva da base!
          </p>
          <p className="mt-1 text-sm text-void-100/85">Reserva atual: {Math.round(waterL)} L de água potável.</p>
          <McButton className="mc-btn-green mt-3 min-h-12 px-5 font-pixel" onClick={onContinue}>
            Abrir Diário de Bordo
          </McButton>
        </motion.section>
      ) : null}
    </Mission3Stage>
  )
}
