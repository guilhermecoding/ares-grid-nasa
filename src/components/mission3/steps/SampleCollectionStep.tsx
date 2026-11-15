import { motion } from 'framer-motion'
import { useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import { SAMPLE_STEPS } from '../../../data/mission3Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { SciTermM3 } from '../SciTermM3'

interface Props {
  siteLabel: string
  depthsLabel: string
  onContinue: () => void
}

/** Challenge 3.4 — sequential sample handling touches. */
export function SampleCollectionStep({ siteLabel, depthsLabel, onContinue }: Props) {
  const [done, setDone] = useState<string[]>([])

  const next = SAMPLE_STEPS.find((s) => !done.includes(s.id))
  const ready = done.length >= SAMPLE_STEPS.length

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ touchAction: 'manipulation' }}>
      <div className="pointer-events-none h-14 shrink-0 sm:h-16" />

      <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col overflow-y-auto px-3 pb-28 sm:px-4">
        <h2 className="font-pixel text-sm text-cyan-hud sm:text-base">Coleta da amostra</h2>
        <p className="mt-1 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
          Toque nas 3 etapas na ordem. Local: {siteLabel}. Profundidades: {depthsLabel}.
        </p>

        <div className="mt-3 flex justify-center">
          <img src={MEDIA.mission3.sample} alt="" className="size-16 object-contain" draggable={false} />
        </div>

        <div className="mt-4 space-y-2">
          {SAMPLE_STEPS.map((step, i) => {
            const isDone = done.includes(step.id)
            const isNext = next?.id === step.id
            return (
              <motion.button
                key={step.id}
                type="button"
                whileTap={isNext ? { scale: 0.98 } : undefined}
                disabled={!isNext}
                onClick={() => {
                  if (!isNext) return
                  soundEngine.step()
                  setDone((d) => [...d, step.id])
                  soundEngine.success()
                }}
                className={`flex min-h-14 w-full items-start gap-3 rounded-lg border-2 p-3 text-left ${
                  isDone
                    ? 'border-[#1f8a52]/80 bg-[#0a1628]/9'
                    : isNext
                      ? 'border-cyan-hud/60 bg-[#0a1628]/95'
                      : 'border-void-600/40 bg-[#0a1628]/45 opacity-50'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-md font-pixel text-sm ${
                    isDone ? 'bg-[#1f8a52] text-[#e8ffe8]' : 'bg-cyan-hud/20 text-cyan-hud'
                  }`}
                >
                  {isDone ? '✓' : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-pixel text-xs text-[#f4fff4] sm:text-sm">{step.title}</span>
                  <span className="mt-1 block font-pixel text-[10px] leading-snug text-void-200">
                    {step.id === 'register' ? (
                      <>
                        {step.detail}{' '}
                        <SciTermM3 term="Amostra">Amostra</SciTermM3> em {siteLabel}, {depthsLabel}.
                      </>
                    ) : (
                      step.detail
                    )}
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
          Levar ao laboratório
        </McButton>
      </div>
    </div>
  )
}
