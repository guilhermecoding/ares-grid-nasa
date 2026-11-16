import { motion, useAnimationControls } from 'framer-motion'
import { useMemo, useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import { PROCESS_STEPS, type ProcessStepId } from '../../../data/mission3Data'
import { useI18n } from '../../../i18n/locale'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { CapiBeat } from '../CapiBeat'
import { Mission3Stage } from '../Mission3Stage'
import { SciTermM3 } from '../SciTermM3'

interface Props {
  energy: number
  waterL: number
  initialDone?: number
  onSpend: (n: number) => void
  onProgress: (done: number) => void
  onEnergyShort: () => void
  onContinue: () => void
}

const BENCH_ORDER: readonly ProcessStepId[] = ['melt', 'identify', 'treat', 'separate', 'quality', 'filter']

const MODULE_ICON: Record<ProcessStepId, string> = {
  identify: MEDIA.mission3.processIdentify,
  separate: MEDIA.mission3.processSeparate,
  melt: MEDIA.mission3.processMelt,
  filter: MEDIA.mission3.processFilter,
  treat: MEDIA.mission3.processTreat,
  quality: MEDIA.mission3.processQuality,
}

const WATER_TINT = ['#7a5236', '#8a6a4c', '#6fa0b8', '#7cc6e0', '#a6e6f7', '#cdf5ff', '#e6fbff'] as const

function BenchModule({
  id,
  done,
  next,
  onTap,
}: {
  id: ProcessStepId
  done: boolean
  next: boolean
  onTap: (id: ProcessStepId, shake: () => void) => void
}) {
  const { t } = useI18n()
  const controls = useAnimationControls()
  const step = PROCESS_STEPS.find((s) => s.id === id)!
  return (
    <motion.button
      type="button"
      disabled={done}
      whileTap={done ? undefined : { scale: 0.96 }}
      onClick={() => onTap(id, () => void controls.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.35 } }))}
      animate={next ? { scale: [1, 1.03, 1] } : { scale: 1 }}
      transition={next ? { duration: 1, repeat: Infinity } : { duration: 0.2 }}
      className={`flex min-h-36 flex-col items-start gap-2 rounded border-4 p-3 text-left ${
        done ? 'border-life bg-life/10' : next ? 'border-energy bg-[#0a1628]/92 shadow-[0_0_18px_rgba(250,204,21,0.28)]' : 'border-cyan-hud/30 bg-[#0a1628]/92'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <img src={MODULE_ICON[id]} alt="" className="size-12 object-contain" draggable={false} />
        <span className={`font-pixel text-sm ${done ? 'text-life' : 'text-energy'}`}>
          {done ? t('✓ ON', '✓ ATIVO') : t(`−${step.energyCost}% energy`, `−${step.energyCost}% energia`)}
        </span>
      </span>
      <span className="text-base font-semibold text-[#f4fff4]">{t(step.titleEn, step.title)}</span>
      <span className="text-sm text-void-100/80">{t(step.detailEn, step.detail)}</span>
      {next ? (
        <span className="font-pixel text-base text-energy">
          {t(`TAP THIS · −${step.energyCost}% energy`, `TOQUE NESTE · −${step.energyCost}% energia`)}
        </span>
      ) : null}
    </motion.button>
  )
}

/** Desafio 3.5 — six-module lab pipeline in scientific order. */
export function IceProcessingStep({ energy, waterL, initialDone = 0, onSpend, onProgress, onEnergyShort, onContinue }: Props) {
  const { t } = useI18n()
  const [doneCount, setDoneCount] = useState(initialDone)
  const [beatKind, setBeatKind] = useState<'intro' | 'wrong' | 'done' | null>(initialDone > 0 ? null : 'intro')
  const [wrongCount, setWrongCount] = useState(0)
  const allDone = doneCount >= PROCESS_STEPS.length
  const spent = PROCESS_STEPS.slice(0, doneCount).reduce((sum, s) => sum + s.energyCost, 0)
  const beatLines = useMemo(() => {
    if (beatKind === 'intro') {
      return [
        t('Turn the modules on in order. The card that pulses is next.', 'Ative os módulos na ordem. O card que pulsa é o próximo.'),
        t('Start by identifying the frozen material.', 'Comece identificando o material congelado.'),
      ]
    }
    if (beatKind === 'wrong') {
      const expected = PROCESS_STEPS[doneCount]
      return [
        t(
          `Not yet! The next step is: ${(expected?.titleEn ?? '').toLowerCase()}.`,
          `Ainda não! A próxima etapa é: ${(expected?.title ?? '').toLowerCase()}.`,
        ),
      ]
    }
    if (beatKind === 'done') {
      return [
        t('Clean, clear water!', 'Água limpa e transparente!'),
        t('But does clear mean safe? Let\'s test the potability.', 'Mas transparente é seguro? Vamos testar a potabilidade.'),
      ]
    }
    return []
  }, [beatKind, doneCount, t])
  const beatId = beatKind === 'intro' ? 'm3-lab-intro' : beatKind === 'done' ? 'm3-lab-done' : `m3-lab-wrong-${wrongCount}`

  const tap = (id: ProcessStepId, shake: () => void) => {
    const expected = PROCESS_STEPS[doneCount]
    if (!expected) return
    if (id !== expected.id) {
      soundEngine.fail()
      shake()
      const n = wrongCount + 1
      setWrongCount(n)
      setBeatKind('wrong')
      return
    }
    if (energy < expected.energyCost) {
      soundEngine.fail()
      onEnergyShort()
      return
    }
    onSpend(expected.energyCost)
    soundEngine.harvest()
    const next = doneCount + 1
    setDoneCount(next)
    onProgress(next)
    if (next >= PROCESS_STEPS.length) {
      setBeatKind('done')
    }
  }

  return (
    <Mission3Stage
      title={t('Challenge 3.5 — Turning Ice into Water', 'Desafio 3.5 — Transformando Gelo em Água')}
      subtitle={
        <>
          {t(
            'Build the lab steps: each module uses energy from the base. The wrong order does not move the',
            'Monte o pipeline do laboratório: cada módulo gasta energia da base. Ordem errada não avança a',
          )}{' '}
          <SciTermM3 term={t('Sample', 'Amostra')} />.
        </>
      }
      energy={energy}
      waterL={waterL}
      overlay={beatKind ? <CapiBeat id={beatId} lines={beatLines} onDone={() => setBeatKind(null)} /> : null}
    >
      <section className="mx-auto w-full max-w-6xl rounded border-2 border-cyan-hud/30 bg-[#0a1628]/92 p-3 md:p-4">
        <div className="flex items-center justify-between gap-2">
            <p className="font-pixel text-sm text-cyan-hud">
              {t('STEPS', 'PIPELINE')} · {doneCount}/{PROCESS_STEPS.length}
            </p>
            <p className="font-pixel text-sm text-energy">
              {t('Energy used', 'Energia usada')}: {spent}%
            </p>
        </div>
        <ol className="mt-2 grid grid-cols-6 gap-1.5">
          {PROCESS_STEPS.map((s, i) => (
            <li
              key={s.id}
              className={`flex min-h-12 flex-col items-center justify-center border-2 text-center ${
                i < doneCount ? 'border-life bg-life/15' : i === doneCount ? 'border-energy' : 'border-void-600'
              }`}
              title={t(s.titleEn, s.title)}
            >
              {i < doneCount ? (
                <img src={MODULE_ICON[s.id]} alt="" className="size-8 object-contain" draggable={false} />
              ) : (
                <span className="font-pixel text-sm text-void-100/70">{i + 1}</span>
              )}
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
          <p className="text-base text-void-100/90">
            {allDone
              ? t('Sample ready for the quality test.', 'Amostra pronta para o teste de qualidade.')
              : t('Ice with regolith at the lab door.', 'Gelo com regolito na entrada do laboratório.')}
          </p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BENCH_ORDER.map((id) => (
          <BenchModule
            key={id}
            id={id}
            done={PROCESS_STEPS.findIndex((s) => s.id === id) < doneCount}
            next={PROCESS_STEPS[doneCount]?.id === id}
            onTap={tap}
          />
        ))}
      </div>

      {allDone ? (
        <div className="mx-auto w-full max-w-6xl">
          <McButton className="mc-btn-green min-h-12 px-5 font-pixel" onClick={onContinue}>
            {t('Take the water to the potability test', 'Levar água ao teste de potabilidade')}
          </McButton>
        </div>
      ) : null}
    </Mission3Stage>
  )
}
