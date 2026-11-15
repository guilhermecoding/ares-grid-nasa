import { motion, useAnimationControls } from 'framer-motion'
import { useState } from 'react'
import { PROCESS_STEPS, type ProcessStepId } from '../../../data/mission3Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { Mission3Stage } from '../Mission3Stage'
import { SciTermM3 } from '../SciTermM3'

interface Props {
  energy: number
  waterL: number
  onSpend: (n: number) => void
  onContinue: () => void
}

const BENCH_ORDER: readonly ProcessStepId[] = ['melt', 'identify', 'treat', 'separate', 'quality', 'filter']

const MODULE_ICON: Record<ProcessStepId, string> = {
  identify: '🔍',
  separate: '⛏️',
  melt: '🔥',
  filter: '🧪',
  treat: '⚗️',
  quality: '📋',
}

const WATER_TINT = ['#7a5236', '#8a6a4c', '#6fa0b8', '#7cc6e0', '#a6e6f7', '#cdf5ff', '#e6fbff'] as const

function BenchModule({
  id,
  done,
  onTap,
}: {
  id: ProcessStepId
  done: boolean
  onTap: (id: ProcessStepId, shake: () => void) => void
}) {
  const controls = useAnimationControls()
  const step = PROCESS_STEPS.find((s) => s.id === id)!
  return (
    <motion.button
      type="button"
      animate={controls}
      disabled={done}
      whileTap={done ? undefined : { scale: 0.96 }}
      onClick={() => onTap(id, () => void controls.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.35 } }))}
      className={`flex min-h-28 flex-col items-start gap-1 rounded border-2 p-3 text-left ${
        done ? 'border-life bg-life/10' : 'border-cyan-hud/30 bg-[#0a1628]/92 hover:border-cyan-hud'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="text-2xl" aria-hidden>
          {MODULE_ICON[id]}
        </span>
        <span className={`font-pixel text-[10px] ${done ? 'text-life' : 'text-energy'}`}>
          {done ? '✓ ATIVO' : `−${step.energyCost}% ⚡`}
        </span>
      </span>
      <span className="text-sm font-semibold text-[#f4fff4] md:text-base">{step.title}</span>
      <span className="text-xs text-void-100/75">{step.detail}</span>
    </motion.button>
  )
}

/** Desafio 3.5 — six-module lab pipeline in scientific order. */
export function IceProcessingStep({ energy, waterL, onSpend, onContinue }: Props) {
  const [doneCount, setDoneCount] = useState(0)
  const [tip, setTip] = useState('Ative os módulos da bancada na ordem certa. Comece identificando o material.')
  const allDone = doneCount >= PROCESS_STEPS.length
  const spent = PROCESS_STEPS.slice(0, doneCount).reduce((sum, s) => sum + s.energyCost, 0)

  const tap = (id: ProcessStepId, shake: () => void) => {
    const expected = PROCESS_STEPS[doneCount]
    if (!expected) return
    if (id !== expected.id) {
      soundEngine.fail()
      shake()
      setTip(`Ainda não! A próxima etapa é: ${expected.title.toLowerCase()}.`)
      return
    }
    if (energy < expected.energyCost) {
      soundEngine.fail()
      setTip(`Energia insuficiente: este módulo precisa de ${expected.energyCost}%.`)
      return
    }
    onSpend(expected.energyCost)
    soundEngine.harvest()
    const next = doneCount + 1
    setDoneCount(next)
    setTip(
      next >= PROCESS_STEPS.length
        ? 'Água limpa e transparente! Mas transparente é seguro? Vamos testar.'
        : `${expected.title} ✓. Próximo módulo!`,
    )
  }

  return (
    <Mission3Stage
      title="Desafio 3.5 — Transformando Gelo em Água"
      subtitle={
        <>
          Monte o pipeline do laboratório: cada módulo gasta energia da base. Ordem errada não avança a{' '}
          <SciTermM3 term="Amostra">amostra</SciTermM3>.
        </>
      }
      energy={energy}
      waterL={waterL}
      capiTip={tip}
    >
      <section className="mx-auto w-full max-w-6xl rounded border-2 border-cyan-hud/30 bg-[#0a1628]/92 p-3 md:p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-pixel text-[10px] text-cyan-hud">PIPELINE · {doneCount}/{PROCESS_STEPS.length}</p>
          <p className="font-pixel text-[10px] text-energy">Energia usada: {spent}%</p>
        </div>
        <ol className="mt-2 grid grid-cols-6 gap-1.5">
          {PROCESS_STEPS.map((s, i) => (
            <li
              key={s.id}
              className={`flex min-h-12 flex-col items-center justify-center border-2 text-center ${
                i < doneCount ? 'border-life bg-life/15' : i === doneCount ? 'border-energy' : 'border-void-600'
              }`}
              title={s.title}
            >
              <span className="text-lg" aria-hidden>
                {i < doneCount ? MODULE_ICON[s.id] : '·'}
              </span>
              <span className="font-pixel text-[8px] text-void-100/70">{i + 1}</span>
            </li>
          ))}
        </ol>
        <div className="mt-3 flex items-center gap-3">
          <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-b-lg border-2 border-cyan-hud/50 bg-void-900" aria-hidden>
            <motion.div
              className="absolute inset-x-0 bottom-0"
              animate={{ height: `${20 + doneCount * 13}%`, backgroundColor: WATER_TINT[doneCount] }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-void-100/85">
            {allDone ? 'Amostra pronta para o teste de qualidade.' : 'Gelo com regolito na entrada do laboratório.'}
          </p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BENCH_ORDER.map((id) => (
          <BenchModule key={id} id={id} done={PROCESS_STEPS.findIndex((s) => s.id === id) < doneCount} onTap={tap} />
        ))}
      </div>

      {allDone ? (
        <div className="mx-auto w-full max-w-6xl">
          <McButton className="mc-btn-green min-h-12 px-5 font-pixel" onClick={onContinue}>
            Levar água ao teste de potabilidade
          </McButton>
        </div>
      ) : null}
    </Mission3Stage>
  )
}
