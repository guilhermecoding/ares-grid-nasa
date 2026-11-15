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

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {POTABILITY_INDICATORS.map((ind) => {
            const done = analyzed.has(ind.id)
            const ok = passes(ind.id)
            const busy = scanning === ind.id
            return (
              <motion.button
                key={ind.id}
                type="button"
                disabled={done || Boolean(scanning) || approved}
                whileTap={{ scale: 0.97 }}
                onClick={() => analyze(ind.id)}
                className={`relative flex min-h-20 flex-col justify-center overflow-hidden rounded border-2 px-3 py-2 text-left ${
                  !done ? 'border-cyan-hud/40 bg-void-900/60' : ok ? 'border-life bg-life/10' : 'border-danger bg-danger/10'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {busy ? (
                  <motion.span
                    className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-hud/40 to-transparent"
                    initial={{ left: '-35%' }}
                    animate={{ left: '105%' }}
                    transition={{ duration: SCAN_MS / 1000, ease: 'linear' }}
                    aria-hidden
                  />
                ) : null}
                <span className="text-sm font-semibold text-[#f4fff4]">
                  {ind.id === 'conductivity' ? (
                    <SciTermM3 term="Condutividade Elétrica">{ind.label}</SciTermM3>
                  ) : (
                    ind.label
                  )}
                </span>
                <span className={`mt-1 font-pixel text-xs ${!done ? 'text-cyan-hud' : ok ? 'text-life' : 'text-danger'}`}>
                  {busy ? 'ANALISANDO…' : !done ? 'TOQUE PARA ANALISAR' : ok ? `● ${ind.safe}` : `● ${ind.unsafe ?? 'fora do padrão'}`}
                </span>
              </motion.button>
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
