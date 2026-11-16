import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import { METHODOLOGY_STEPS, NASA_CITATIONS, NASA_CITATIONS_EN } from '../../../data/mission3Data'
import { useI18n } from '../../../i18n/locale'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { CapiBeat } from '../CapiBeat'
import { Mission3Stage } from '../Mission3Stage'
import { SciTermM3 } from '../SciTermM3'

interface Props {
  energy: number
  waterL: number
  onContinue: () => void
}

const ICONS = [MEDIA.mission3.radar, MEDIA.mission3.lab, MEDIA.mission3.drill] as const

const BEATS = [
  ['Toque no card grande que pulsa.', 'A primeira etapa é o radar SHARAD, lá da órbita.'],
  ['Boa! Agora a etapa 2.', 'Antes de ir a campo, a NASA confere o que já foi descoberto.'],
  ['Última etapa do protocolo.', 'Só no fim a gente perfura — e só um pouquinho, para conferir.'],
  ['Protocolo completo!', 'Agora sim podemos abrir o mapa científico.'],
] as const

const BEATS_EN = [
  ['Tap the big card that pulses.', 'Step 1 is the SHARAD radar, from up in orbit.'],
  ['Nice! Now step 2.', 'Before we go outside, NASA checks what scientists already found.'],
  ['Last step of the plan.', 'We drill only at the end — and just a little, to check.'],
  ['Plan complete!', 'Now we can open the science map.'],
] as const

function StepArrow({ vertical }: { vertical: boolean }) {
  return (
    <motion.div
      className={`flex items-center justify-center text-energy ${vertical ? 'py-1' : 'px-1'}`}
      animate={{ y: vertical ? [0, 6, 0] : 0, x: vertical ? 0 : [0, 6, 0] }}
      transition={{ duration: 0.9, repeat: Infinity }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className={`text-energy ${vertical ? 'h-8 w-8' : 'h-8 w-8 rotate-90 lg:rotate-0'}`}>
        <path d="M5 12h12M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    </motion.div>
  )
}

/** Desafio 3.1 — unlock the three NASA investigation stages in order. */
export function MethodologyStep({ energy, waterL, onContinue }: Props) {
  const { t, locale } = useI18n()
  const [unlocked, setUnlocked] = useState(0)
  const [beat, setBeat] = useState(0)
  const allDone = unlocked >= METHODOLOGY_STEPS.length
  const beatLines = useMemo(() => {
    const beats = locale === 'en' ? BEATS_EN : BEATS
    return beats[beat] ?? beats[beats.length - 1]!
  }, [beat, locale])

  return (
    <Mission3Stage
      title={t('Challenge 3.1 — The 3 Investigation Steps', 'Desafio 3.1 — As 3 Etapas da Investigação')}
      subtitle={
        <>
          {t(
            'Follow the order 1, 2, and 3. Tap only the card that pulses to learn about the',
            'Siga a ordem 1, 2 e 3. Toque só no card que pulsa para entender o',
          )}{' '}
          <SciTermM3 term={t('Subsurface', 'Subsolo')} />.
        </>
      }
      energy={energy}
      waterL={waterL}
      overlay={
        beat <= METHODOLOGY_STEPS.length ? (
          <CapiBeat id={`m3-method-${beat}`} lines={beatLines} onDone={() => setBeat(METHODOLOGY_STEPS.length + 1)} />
        ) : null
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 lg:flex-row lg:items-stretch">
        {METHODOLOGY_STEPS.map((step, i) => {
          const open = i < unlocked
          const next = i === unlocked && !allDone
          return (
            <div key={step.id} className="flex flex-1 flex-col gap-2 lg:flex-row lg:items-stretch">
              <motion.button
                type="button"
                disabled={!next}
                whileTap={next ? { scale: 0.98 } : undefined}
                animate={next ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                transition={next ? { duration: 1.1, repeat: Infinity } : { duration: 0.2 }}
                onClick={() => {
                  const n = i + 1
                  setUnlocked(n)
                  setBeat(n)
                  if (n >= METHODOLOGY_STEPS.length) soundEngine.success()
                  else soundEngine.harvest()
                }}
                className={`relative flex min-h-64 w-full flex-col items-start gap-3 rounded border-4 bg-[#0a1628]/92 p-4 text-left ${
                  open ? 'border-life' : next ? 'border-energy shadow-[0_0_22px_rgba(250,204,21,0.35)]' : 'border-cyan-hud/25'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <span className="flex size-12 items-center justify-center rounded-full border-2 border-cyan-hud font-pixel text-xl text-cyan-hud">
                  {open ? '✓' : i + 1}
                </span>
                <img src={ICONS[i]} alt="" className={`size-16 object-contain ${open || next ? '' : 'opacity-70'}`} draggable={false} />
                <p className="font-pixel text-base leading-snug text-[#f4fff4] md:text-lg">{t(step.titleEn, step.title)}</p>
                {open ? (
                  <p className="text-base text-void-100/90">{t(step.detailEn, step.detail)}</p>
                ) : next ? (
                  <p className="font-pixel text-lg text-energy">{t('TAP HERE', 'TOQUE AQUI')}</p>
                ) : (
                  <p className="text-base text-void-100/80">{t(`After step ${i}`, `Depois da etapa ${i}`)}</p>
                )}
              </motion.button>
              {i < METHODOLOGY_STEPS.length - 1 ? <StepArrow vertical /> : null}
            </div>
          )
        })}
      </div>

      <section className="mx-auto w-full max-w-6xl rounded border-2 border-cyan-hud/30 bg-[#0a1628]/92 p-4">
        <p className="font-pixel text-xs text-cyan-hud md:text-sm">{t('NASA SOURCES', 'FONTES NASA')}</p>
        <p className="mt-2 text-sm text-void-100/85 md:text-base">
          {locale === 'en' ? NASA_CITATIONS_EN.iceCores : NASA_CITATIONS.iceCores}
        </p>
        <p className="mt-1 text-sm text-void-100/85 md:text-base">
          {locale === 'en' ? NASA_CITATIONS_EN.sharad : NASA_CITATIONS.sharad}{' '}
          <SciTermM3 term={t('SHARAD radar', 'Radar SHARAD')} />
        </p>
        <McButton className={`mt-4 min-h-14 px-5 font-pixel text-base ${allDone ? 'mc-btn-green' : 'opacity-50'}`} disabled={!allDone} onClick={onContinue}>
          {t('Open the science map', 'Abrir mapa científico')}
        </McButton>
      </section>
    </Mission3Stage>
  )
}
