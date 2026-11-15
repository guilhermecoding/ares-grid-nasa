import { motion } from 'framer-motion'
import { useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import { PROCESS_STEPS, type ProcessStepId } from '../../../data/mission3Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { CapiBridgeM3 } from '../CapiBridgeM3'
import { SciTermM3 } from '../SciTermM3'

interface Props {
  energyPct: number
  onSpend: (energy: number) => void
  onContinue: () => void
}

/** Challenge 3.5 — ordered ice→water lab pipeline. */
export function IceProcessingStep({ energyPct, onSpend, onContinue }: Props) {
  const [done, setDone] = useState<ProcessStepId[]>([])
  const [warn, setWarn] = useState<string[] | null>(null)

  const nextIndex = done.length
  const ready = done.length >= PROCESS_STEPS.length
  const next = PROCESS_STEPS[nextIndex]

  const tryRun = (id: ProcessStepId) => {
    const idx = PROCESS_STEPS.findIndex((s) => s.id === id)
    const step = PROCESS_STEPS[idx]
    if (!step || ready) return

    if (idx !== nextIndex) {
      soundEngine.fail()
      setWarn(['Ordem errada!', 'Siga a bancada na sequência — cada módulo depende do anterior.'])
      return
    }
    if (energyPct < step.energyCost) {
      soundEngine.fail()
      setWarn(['Energia baixa.', `Esta etapa precisa de ${step.energyCost}% de energia da base.`])
      return
    }

    soundEngine.step()
    onSpend(step.energyCost)
    setDone((d) => [...d, id])
    soundEngine.success()
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ touchAction: 'manipulation' }}>
      <div className="pointer-events-none h-14 shrink-0 sm:h-16" />

      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col overflow-y-auto px-3 pb-28 sm:px-4">
        <h2 className="font-pixel text-sm text-cyan-hud sm:text-base">Bancada de processamento</h2>
        <p className="mt-1 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
          Transforme gelo em água limpa — toque os 6 módulos na ordem. Remova{' '}
          <SciTermM3 term="Percloratos">percloratos</SciTermM3> e{' '}
          <SciTermM3 term="Regolito">regolito</SciTermM3>.
        </p>

        <div className="mt-2 flex justify-center">
          <img src={MEDIA.mission3.lab} alt="" className="size-12 object-contain opacity-90" draggable={false} />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PROCESS_STEPS.map((step, i) => {
            const isDone = done.includes(step.id)
            const isNext = next?.id === step.id
            return (
              <motion.button
                key={step.id}
                type="button"
                whileTap={!isDone ? { scale: 0.98 } : undefined}
                onClick={() => tryRun(step.id)}
                className={`flex min-h-14 items-start gap-2 rounded-lg border-2 p-3 text-left ${
                  isDone
                    ? 'border-[#1f8a52]/80 bg-[#0a1628]/9'
                    : isNext
                      ? 'border-cyan-hud/60 bg-[#0a1628]/95'
                      : 'border-void-500/50 bg-[#0a1628]/7'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded font-pixel text-xs ${
                    isDone ? 'bg-[#1f8a52] text-[#e8ffe8]' : 'bg-void-800 text-cyan-hud'
                  }`}
                >
                  {isDone ? '✓' : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-pixel text-[11px] text-[#f4fff4] sm:text-xs">{step.title}</span>
                  <span className="mt-0.5 block font-pixel text-[9px] text-void-300">
                    −{step.energyCost}% energia · {step.detail}
                  </span>
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex justify-end px-3 sm:px-4">
        <McButton
          className="min-h-12 min-w-[10rem] font-pixel text-lg font-bold disabled:opacity-40"
          disabled={!ready}
          onClick={() => {
            soundEngine.harvest()
            onContinue()
          }}
        >
          Testar potabilidade
        </McButton>
      </div>

      {warn ? <CapiBridgeM3 lines={warn} onDone={() => setWarn(null)} /> : null}
    </div>
  )
}
