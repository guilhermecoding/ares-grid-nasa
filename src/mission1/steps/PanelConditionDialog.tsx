import { animate, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ScrollHintArea } from '../../components/ScrollHintArea'
import { MEDIA } from '../../constants/mediaAssets'
import {
  CLEAN_RESULT_PARTS,
  DUST_DROP_PARTS,
  DUST_HIGHLIGHT_WORDS,
  PANEL_CLEAN_EFFICIENCY_CAP,
  PANEL_CLEAN_EFFICIENCY_GAIN,
  PANEL_TEST_DUST_EFFICIENCY_FACTOR,
  PANEL_TEST_OPTIONS,
  type PanelTestChoice,
} from '../../data/mission1Data'
import { useI18n } from '../../i18n/locale'
import { McButton } from '../../opening/McButton'
import { PixelDialogBox } from '../../opening/PixelDialogBox'
import { soundEngine } from '../../services/soundEngine'
import { isDialogGroupSkipped } from '../../services/progressStore'

function sentence(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`
}

function pointsLines(
  option: (typeof PANEL_TEST_OPTIONS)[number],
  t: (en: string, pt: string) => string,
): string[] {
  const favorEn = option.pros.map((item) => sentence(item.en)).join(' ')
  const favorPt = option.pros.map((item) => sentence(item.pt)).join(' ')
  const contraEn = option.cons.map((item) => sentence(item.en)).join(' ')
  const contraPt = option.cons.map((item) => sentence(item.pt)).join(' ')
  return [
    t(`You picked ${option.name.en}.`, `Você escolheu ${option.name.pt}.`),
    t(`Points for: ${favorEn}`, `Pontos a favor: ${favorPt}`),
    t(`Points against: ${contraEn}`, `Pontos contra: ${contraPt}`),
    t('Confirm this choice?', 'Confirma essa opção?'),
  ]
}

interface Props {
  baseEfficiency: number
  onDone: (choice: PanelTestChoice) => void
}

type Phase = 'choose' | 'dust-fall' | 'dust-ask' | 'dust-why' | 'clean-note'

/** Central dialog that tests the panel: aging plus dust, or a cleaning. */
export function PanelConditionDialog({ baseEfficiency, onDone }: Props) {
  const { t, locale } = useI18n()
  const [phase, setPhase] = useState<Phase>('choose')
  const [selected, setSelected] = useState<PanelTestChoice | null>(null)
  const [capiOpen, setCapiOpen] = useState(false)
  const [pendingAdvance, setPendingAdvance] = useState(false)
  const [askReady, setAskReady] = useState(false)
  const [whyReady, setWhyReady] = useState(false)
  const [cleanReady, setCleanReady] = useState(false)
  const [effLabel, setEffLabel] = useState(baseEfficiency)

  const dustEff = Math.max(8, Math.round(baseEfficiency * PANEL_TEST_DUST_EFFICIENCY_FACTOR))
  const effMv = useMotionValue(baseEfficiency)
  const effDisplay = useTransform(effMv, (v) => Math.round(v))

  useEffect(() => {
    const unsub = effDisplay.on('change', (v) => setEffLabel(v))
    return unsub
  }, [effDisplay])

  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    if (!isDialogGroupSkipped('m1')) return
    if (phase === 'dust-ask' || phase === 'dust-why') onDoneRef.current('dust')
    else if (phase === 'clean-note') onDoneRef.current('clean')
  }, [phase])

  useEffect(() => {
    if (phase !== 'dust-fall') return
    soundEngine.storm()
    const controls = animate(effMv, dustEff, {
      duration: 1.6,
      ease: 'easeInOut',
      onComplete: () => {
        setAskReady(false)
        setPhase('dust-ask')
      },
    })
    return () => controls.stop()
  }, [dustEff, effMv, phase])

  const selectedOption = PANEL_TEST_OPTIONS.find((item) => item.id === selected) ?? null
  const capiLines = useMemo(
    () => (selectedOption ? pointsLines(selectedOption, t) : []),
    [selectedOption, t],
  )
  const coloredPhrases = useMemo(
    () => [
      { phrase: t('Points for', 'Pontos a favor'), className: 'text-life' },
      { phrase: t('Points against', 'Pontos contra'), className: 'text-danger' },
    ],
    [t],
  )
  const dustAskLines = useMemo(() => DUST_DROP_PARTS[0].map((line) => t(line.en, line.pt)), [t])
  const dustWhyLines = useMemo(() => DUST_DROP_PARTS[1].map((line) => t(line.en, line.pt)), [t])
  const cleanLines = useMemo(
    () => [...CLEAN_RESULT_PARTS[0], ...CLEAN_RESULT_PARTS[1]].map((line) => t(line.en, line.pt)),
    [t],
  )

  const askCapi = (id: PanelTestChoice) => {
    const option = PANEL_TEST_OPTIONS.find((item) => item.id === id)
    if (!option) return
    setSelected(id)
    setPendingAdvance(true)
    setCapiOpen(true)
  }

  const pick = (choice: PanelTestChoice) => {
    soundEngine.click()
    if (choice === 'dust') {
      setPhase('dust-fall')
      return
    }
    const next = Math.min(PANEL_CLEAN_EFFICIENCY_CAP, baseEfficiency + PANEL_CLEAN_EFFICIENCY_GAIN)
    effMv.set(next)
    setEffLabel(next)
    setCleanReady(false)
    setPhase('clean-note')
  }

  const dusting = phase === 'dust-fall' || phase === 'dust-ask' || phase === 'dust-why'

  return (
    <div className={`relative flex h-full min-h-0 flex-col ${capiOpen ? 'z-[60]' : 'z-10'}`}>
      {dusting && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#a06030]/45 via-[#c47848]/15 to-transparent" aria-hidden />
      )}

      {phase === 'choose' ? (
        <ScrollHintArea
          variant="dark"
          frameClassName="h-full min-h-0 flex-1"
          className="flex h-full flex-col gap-3 px-3 pt-16 pb-4 sm:px-4 md:gap-4 md:px-6 lg:gap-5 lg:px-8"
        >
          <div className="mx-auto w-full max-w-lg md:max-w-5xl lg:max-w-6xl">
            <p className="font-pixel text-sm text-cyan-hud drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] md:text-base lg:text-lg">
              {t('Test the panel', 'Testar o painel')}
            </p>
            <p className="mt-1 text-sm text-void-100 md:text-base">
              {t(
                'Tap a condition. Capi shows the points before you confirm.',
                'Toque no botão da condição. A Capi mostra os pontos antes de confirmar.',
              )}
            </p>
          </div>

          <div className="mx-auto grid w-full max-w-lg grid-cols-1 gap-3 md:max-w-5xl md:grid-cols-2 md:gap-5 lg:max-w-6xl lg:gap-6">
            {PANEL_TEST_OPTIONS.map((option, index) => {
              const active = selected === option.id
              const tone = index === 0 ? 'mc-btn-purple' : 'mc-btn-green'
              return (
                <div
                  key={option.id}
                  className={`flex min-h-64 flex-col border-2 bg-[#0a1628]/92 p-4 text-left shadow-[0_8px_20px_rgba(0,0,0,0.35)] md:min-h-80 md:p-5 lg:min-h-96 lg:p-6 ${
                    active ? 'border-cyan-hud' : 'border-cyan-hud/30'
                  }`}
                >
                  <p className="font-pixel text-base text-cyan-hud md:text-lg lg:text-xl">{t(option.name.en, option.name.pt)}</p>
                  <div className="mt-3 md:mt-4">
                    <p className="text-xs font-bold tracking-wide text-life md:text-sm">{t('Pros', 'Prós')}</p>
                    <ul className="mt-1 space-y-1 text-sm leading-snug text-void-100 md:text-base lg:text-lg">
                      {option.pros.map((pro) => (
                        <li key={pro.en}>+ {t(pro.en, pro.pt)}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-3 md:mt-4">
                    <p className="text-xs font-bold tracking-wide text-danger md:text-sm">{t('Cons', 'Contras')}</p>
                    <ul className="mt-1 space-y-1 text-sm leading-snug text-void-100 md:text-base lg:text-lg">
                      {option.cons.map((con) => (
                        <li key={con.en}>− {t(con.en, con.pt)}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto pt-4">
                    <McButton
                      className={`${tone} min-h-12 w-full font-pixel text-base font-bold sm:text-lg`}
                      onClick={() => askCapi(option.id)}
                    >
                      {t('Confirm', 'Confirmar')}
                    </McButton>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollHintArea>
      ) : (
        <div className="flex h-full min-h-0 items-center justify-center overflow-hidden p-3 pt-16 sm:p-4">
          <div className="relative w-full max-w-3xl border-2 border-cyan-hud/50 bg-[#0a1628]/94 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.45)] md:p-6">
            <p className="font-pixel text-sm text-cyan-hud md:text-base">{t('Test the panel', 'Testar o painel')}</p>
            <div className="mt-3 flex items-center gap-3 md:gap-4">
              <img
                src={MEDIA.mission1.panel}
                alt=""
                draggable={false}
                className="h-20 w-32 object-contain md:h-28 md:w-44"
                style={{ imageRendering: 'pixelated', opacity: dusting ? 0.72 : 1 }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-pixel text-sm text-[#f4fff4] md:text-base">
                  {t(`Efficiency ${effLabel}%`, `Eficiência ${effLabel}%`)}
                </p>
                <div className="mt-2 h-3 bg-void-800">
                  <div className="h-full bg-energy" style={{ width: `${Math.min(100, effLabel)}%` }} />
                </div>
              </div>
            </div>
            {phase === 'dust-fall' && (
              <p className="mt-4 font-pixel text-sm text-energy md:text-base">
                {t('Dust is covering the panel. Efficiency is dropping.', 'A poeira cobre o painel. A eficiência está caindo.')}
              </p>
            )}
          </div>
        </div>
      )}

      <PixelDialogBox
        key={selected ? `m1-panel-pick-${selected}` : 'panel-pick'}
        open={capiOpen}
        position="center"
        title="Capi"
        lines={capiLines}
        coloredPhrases={coloredPhrases}
        characterSrc={MEDIA.capi.duvida}
        onClosed={() => {
          if (pendingAdvance && selected) {
            setPendingAdvance(false)
            pick(selected)
          }
        }}
        footer={
          <div className="flex flex-wrap justify-center gap-2">
            <McButton
              className="min-h-12 px-4 font-pixel"
              onClick={() => {
                setPendingAdvance(false)
                setCapiOpen(false)
              }}
            >
              {t('Pick another', 'Escolher outro')}
            </McButton>
            <McButton className="min-h-12 px-4 font-pixel font-bold" onClick={() => setCapiOpen(false)}>
              {t('Confirm', 'Confirmar')}
            </McButton>
          </div>
        }
      />

      <PixelDialogBox
        open={phase === 'dust-ask'}
        position="center"
        title="Capi"
        dialogId="m1-dust-ask"
        onSkip={() => onDoneRef.current('dust')}
        lines={dustAskLines}
        characterSrc={MEDIA.capi.duvida}
        onTypingComplete={() => setAskReady(true)}
        footer={
          askReady ? (
            <McButton className="min-h-12 px-5 font-pixel font-bold" onClick={() => setPhase('dust-why')}>
              {t('What happened?', 'O que aconteceu?')}
            </McButton>
          ) : null
        }
      />

      <PixelDialogBox
        open={phase === 'dust-why'}
        position="center"
        title="Capi"
        dialogId="m1-dust-why"
        onSkip={() => onDone('dust')}
        lines={dustWhyLines}
        characterSrc={MEDIA.capi.neutral}
        highlightWords={DUST_HIGHLIGHT_WORDS[locale]}
        onTypingComplete={() => setWhyReady(true)}
        footer={
          whyReady ? (
            <McButton className="min-h-12 px-5 font-pixel font-bold" onClick={() => onDone('dust')}>
              {t('Got it', 'Entendi')}
            </McButton>
          ) : null
        }
      />

      <PixelDialogBox
        open={phase === 'clean-note'}
        position="center"
        title="Capi"
        dialogId="m1-clean-note"
        onSkip={() => onDone('clean')}
        lines={cleanLines}
        characterSrc={MEDIA.capi.excited2}
        onTypingComplete={() => setCleanReady(true)}
        footer={
          cleanReady ? (
            <McButton className="min-h-12 px-5 font-pixel font-bold" onClick={() => onDone('clean')}>
              {t('Next', 'Seguir')}
            </McButton>
          ) : null
        }
      />
    </div>
  )
}
