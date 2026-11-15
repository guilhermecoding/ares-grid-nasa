import { motion } from 'framer-motion'
import { useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import { METHODOLOGY_STEPS, NASA_CITATIONS } from '../../../data/mission3Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { Mission3Stage } from '../Mission3Stage'
import { SciTermM3 } from '../SciTermM3'

interface Props {
  energy: number
  waterL: number
  onContinue: () => void
}

const ICONS = [MEDIA.mission3.radar, MEDIA.mission3.lab, MEDIA.mission3.drill] as const

const TIPS = [
  'Toque na primeira etapa: tudo começa pelo radar SHARAD lá da órbita.',
  'Boa! Antes de ir a campo, a NASA confere o que já foi descoberto.',
  'Só no fim a gente perfura — e só um pouquinho, para conferir.',
  'Protocolo completo! Agora sim podemos abrir o mapa científico.',
] as const

/** Desafio 3.1 — unlock the three NASA investigation stages in order. */
export function MethodologyStep({ energy, waterL, onContinue }: Props) {
  const [unlocked, setUnlocked] = useState(0)
  const allDone = unlocked >= METHODOLOGY_STEPS.length

  return (
    <Mission3Stage
      title="Desafio 3.1 — As 3 Etapas da Investigação"
      subtitle={
        <>
          Cientistas reúnem dados antes de perfurar o <SciTermM3 term="Subsolo">subsolo</SciTermM3>. Toque em cada
          etapa na ordem certa.
        </>
      }
      energy={energy}
      waterL={waterL}
      capiTip={TIPS[unlocked]}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-3 md:grid-cols-3 md:gap-4">
        {METHODOLOGY_STEPS.map((step, i) => {
          const open = i < unlocked
          const next = i === unlocked
          return (
            <motion.button
              key={step.id}
              type="button"
              disabled={!next}
              whileTap={next ? { scale: 0.97 } : undefined}
              onClick={() => {
                setUnlocked(i + 1)
                if (i + 1 >= METHODOLOGY_STEPS.length) soundEngine.success()
                else soundEngine.harvest()
              }}
              className={`relative flex min-h-48 flex-col items-start gap-2 rounded border-2 bg-[#0a1628]/92 p-3 text-left md:p-4 ${
                open ? 'border-life' : next ? 'border-energy shadow-[0_0_18px_rgba(250,204,21,0.25)]' : 'border-cyan-hud/20 opacity-60'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="font-pixel text-xs text-cyan-hud">ETAPA {i + 1}</span>
                <span className={`font-pixel text-[10px] ${open ? 'text-life' : next ? 'text-energy' : 'text-void-100/50'}`}>
                  {open ? '✓ DESBLOQUEADA' : next ? 'TOQUE PARA ABRIR' : '🔒 BLOQUEADA'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={ICONS[i]}
                  alt=""
                  className={`size-14 shrink-0 object-contain ${open ? '' : 'grayscale'}`}
                  draggable={false}
                />
                <p className="font-pixel text-sm leading-snug text-[#f4fff4] md:text-base">{step.title}</p>
              </div>
              {open ? (
                <motion.p
                  className="text-sm text-void-100/90 md:text-base"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {step.detail}
                </motion.p>
              ) : null}
            </motion.button>
          )
        })}
      </div>

      <section className="mx-auto w-full max-w-6xl rounded border-2 border-cyan-hud/30 bg-[#0a1628]/92 p-3 md:p-4">
        <p className="font-pixel text-[10px] text-cyan-hud">FONTES NASA</p>
        <p className="mt-1 text-xs text-void-100/80 md:text-sm">{NASA_CITATIONS.iceCores}</p>
        <p className="mt-1 text-xs text-void-100/80 md:text-sm">
          {NASA_CITATIONS.sharad} <SciTermM3 term="Radar SHARAD">O que é o SHARAD?</SciTermM3>
        </p>
        <McButton
          className={`mt-3 min-h-12 px-5 font-pixel ${allDone ? 'mc-btn-green' : 'opacity-50'}`}
          disabled={!allDone}
          onClick={onContinue}
        >
          Abrir mapa científico
        </McButton>
      </section>
    </Mission3Stage>
  )
}
