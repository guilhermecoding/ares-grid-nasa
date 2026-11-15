import { motion } from 'framer-motion'
import { useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import { METHODOLOGY_STEPS, NASA_CITATIONS } from '../../../data/mission3Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { SciTermM3 } from '../SciTermM3'

interface Props {
  onContinue: () => void
}

/** Challenge 3.1 — unlock the 3 NASA investigation steps. */
export function MethodologyStep({ onContinue }: Props) {
  const [unlocked, setUnlocked] = useState<string[]>([])

  const ready = unlocked.length >= METHODOLOGY_STEPS.length

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ touchAction: 'manipulation' }}>
      <div className="pointer-events-none h-14 shrink-0 sm:h-16" />

      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col overflow-y-auto px-3 pb-28 sm:px-4">
        <h2 className="font-pixel text-sm text-cyan-hud sm:text-base">As 3 etapas da investigação</h2>
        <p className="mt-1 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
          Toque em cada etapa para entender o protocolo antes do mapa. Fonte:{' '}
          <SciTermM3 term="Radar SHARAD">Radar SHARAD</SciTermM3>.
        </p>

        <div className="mt-4 space-y-2">
          {METHODOLOGY_STEPS.map((step, i) => {
            const done = unlocked.includes(step.id)
            const canOpen = i === 0 || unlocked.includes(METHODOLOGY_STEPS[i - 1]!.id)
            return (
              <motion.button
                key={step.id}
                type="button"
                whileTap={canOpen && !done ? { scale: 0.98 } : undefined}
                disabled={!canOpen}
                onClick={() => {
                  if (!canOpen || done) return
                  soundEngine.step()
                  setUnlocked((u) => (u.includes(step.id) ? u : [...u, step.id]))
                }}
                className={`flex min-h-14 w-full items-start gap-3 rounded-lg border-2 p-3 text-left ${
                  done
                    ? 'border-[#1f8a52]/80 bg-[#0a1628]/9'
                    : canOpen
                      ? 'border-cyan-hud/50 bg-[#0a1628]/95'
                      : 'border-void-600/40 bg-[#0a1628]/50 opacity-50'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-md font-pixel text-sm ${
                    done ? 'bg-[#1f8a52] text-[#e8ffe8]' : 'bg-cyan-hud/20 text-cyan-hud'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-pixel text-xs text-[#f4fff4] sm:text-sm">{step.title}</span>
                  {done ? (
                    <span className="mt-1 block font-pixel text-[10px] leading-snug text-void-200">
                      {step.detail}
                    </span>
                  ) : (
                    <span className="mt-1 block font-pixel text-[10px] text-void-400">Toque para revelar</span>
                  )}
                </span>
              </motion.button>
            )
          })}
        </div>

        <p className="mt-3 font-pixel text-[9px] leading-snug text-void-300">{NASA_CITATIONS.sharad}</p>
        <img src={MEDIA.mission3.radar} alt="" className="mt-2 size-12 object-contain opacity-80" draggable={false} />
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
          Abrir mapa
        </McButton>
      </div>
    </div>
  )
}
