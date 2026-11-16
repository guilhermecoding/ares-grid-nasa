import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useMemo, useRef, useState } from 'react'
import { DustScrubCanvas } from '../../components/DustScrubCanvas'
import { CapiBeat } from '../../components/mission3/CapiBeat'
import { Mission3Stage } from '../../components/mission3/Mission3Stage'
import { SciTermM3 } from '../../components/mission3/SciTermM3'
import {
  CAPI_SAMPLE,
  CAPI_SAMPLE_EN,
  CRYO_SEAL_C,
  DRILL_TARGET_M,
  MISSION3_META,
  SCRUB_CLEAN_GOAL,
  formatDepth,
} from '../../data/mission3Data'
import { useI18n } from '../../i18n/locale'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  siteName: string
  energy: number
  waterL: number
  onContinue: () => void
}

type Phase = 'scrub' | 'store' | 'sealed'

const CRYSTALS = [
  [8, 30],
  [18, 62],
  [27, 40],
  [36, 70],
  [45, 26],
  [55, 58],
  [64, 36],
  [73, 66],
  [82, 30],
  [90, 54],
] as const

function IceCore({ sparkle }: { sparkle: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[999px] border-4 border-[#0e3a52] bg-gradient-to-b from-[#bdf0ff] via-[#7fd4f2] to-[#3d9cc4]">
      <div className="absolute inset-x-6 top-2 h-2 rounded-full bg-white/60" aria-hidden />
      {[22, 48, 74].map((x) => (
        <div key={x} className="absolute inset-y-0 w-0.5 bg-[#0e3a52]/30" style={{ left: `${x}%` }} aria-hidden />
      ))}
      {CRYSTALS.map(([x, y], i) => (
        <motion.span
          key={`${x}-${y}`}
          className="absolute block size-2.5 rotate-45 bg-white shadow-[0_0_8px_#e0f7ff]"
          style={{ left: `${x}%`, top: `${y}%` }}
          animate={sparkle ? { opacity: [0.3, 1, 0.3], scale: [0.7, 1.15, 0.7] } : { opacity: 0.85 }}
          transition={sparkle ? { duration: 1.3, repeat: Infinity, delay: i * 0.12 } : undefined}
          aria-hidden
        />
      ))}
    </div>
  )
}

/** Desafio 3.4 — scrub the regolith crust, then seal the ice core cryogenically. */
export function SampleCollectionStep({ siteName, energy, waterL, onContinue }: Props) {
  const { t, locale } = useI18n()
  const [phase, setPhase] = useState<Phase>('scrub')
  const [beat, setBeat] = useState<keyof typeof CAPI_SAMPLE | null>('scrub')
  const [cleanPct, setCleanPct] = useState(0)
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const [selected, setSelected] = useState(false)
  const [hoverTarget, setHoverTarget] = useState(false)
  const originRef = useRef<{ x: number; y: number } | null>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLButtonElement>(null)

  const handleProgress = useCallback((f: number) => setCleanPct(Math.round(f * 100)), [])
  const handleClean = useCallback(() => {
    setCleanPct(100)
    setPhase('store')
    setBeat('drag')
    soundEngine.harvest()
  }, [])

  const overContainer = () => {
    const core = coreRef.current?.getBoundingClientRect()
    const box = containerRef.current?.getBoundingClientRect()
    if (!core || !box) return false
    const cx = core.left + core.width / 2
    const cy = core.top + core.height / 2
    return cx > box.left && cx < box.right && cy > box.top && cy < box.bottom
  }

  const seal = () => {
    setDrag(null)
    setSelected(false)
    setHoverTarget(false)
    setPhase('sealed')
    setBeat('sealed')
    soundEngine.success()
  }

  const beatLines = useMemo(() => {
    if (!beat) return []
    const copy = locale === 'en' ? CAPI_SAMPLE_EN : CAPI_SAMPLE
    return [copy[beat]]
  }, [beat, locale])

  return (
    <Mission3Stage
      title={t('Challenge 3.4 — Collect the Sample', 'Desafio 3.4 — Coleta da Amostra')}
      subtitle={
        <>
          {t('Clean the', 'Limpe o')} <SciTermM3 term={t('Ice core', 'Ice Core')} />{' '}
          {t('and store it in the', 'e guarde-o no recipiente')} <SciTermM3 term={t('Cryogenic', 'Criogênico')} />{' '}
          {t('container without contaminating the', 'sem contaminar a')} <SciTermM3 term={t('Sample', 'Amostra')} />.
        </>
      }
      energy={energy}
      waterL={waterL}
      overlay={
        beat ? (
          <CapiBeat
            id={`m3-sample-${beat}`}
            lines={beatLines}
            onDone={() => setBeat(null)}
          />
        ) : null
      }
    >
      <div className="mx-auto grid w-full max-w-6xl gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] md:gap-4">
        <section
          className={`rounded border-2 bg-[#0a1628]/92 p-3 md:p-4 ${phase === 'scrub' ? 'border-cyan-hud/30' : 'border-life'}`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-pixel text-sm text-cyan-hud md:text-base">{t('1 · Rub here', '1 · Esfregue aqui')}</p>
            <span className={`font-pixel text-sm ${cleanPct >= 100 ? 'text-life' : 'text-energy'}`}>{cleanPct}%</span>
          </div>
          <div
            className="mt-2 h-3 border-2 border-black/50 bg-void-900"
            role="progressbar"
            aria-label={t('Cylinder cleaning', 'Limpeza do cilindro')}
            aria-valuenow={cleanPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-cyan-hud transition-[width]" style={{ width: `${cleanPct}%` }} />
          </div>
          <p className="mt-2 text-sm text-void-100/85">
            {phase === 'scrub'
              ? t(
                  `Rub with the cursor or your finger until ${Math.round(SCRUB_CLEAN_GOAL * 100)}% of the dust is gone.`,
                  `Esfregue com o cursor ou o dedo até ${Math.round(SCRUB_CLEAN_GOAL * 100)}% da poeira sair.`,
                )
              : t('Ice crystals are showing! Drag the cylinder to the container.', 'Cristais de gelo à mostra! Arraste o cilindro até o recipiente.')}
          </p>

          <div className="relative mt-3 flex min-h-44 items-center justify-center rounded border border-cyan-hud/20 bg-[#050b14] p-4 md:min-h-56">
            {phase === 'scrub' ? (
              <DustScrubCanvas
                className="h-28 w-full max-w-xl rounded-[999px] md:h-36"
                goal={SCRUB_CLEAN_GOAL}
                onProgress={handleProgress}
                onClean={handleClean}
                ariaLabel={t('Ice cylinder covered in regolith', 'Cilindro de gelo coberto de regolito')}
              >
                <IceCore sparkle={false} />
              </DustScrubCanvas>
            ) : phase === 'store' ? (
              <motion.div
                ref={coreRef}
                role="button"
                tabIndex={0}
                aria-label={t('Clean ice cylinder — drag it to the container', 'Cilindro de gelo limpo — arraste até o recipiente')}
                aria-pressed={selected}
                className={`relative h-28 w-full max-w-xl cursor-grab touch-none select-none md:h-36 ${
                  selected ? 'outline-4 outline-offset-4 outline-cyan-hud' : ''
                } ${drag ? 'z-50 cursor-grabbing' : ''}`}
                style={{ touchAction: 'none', x: drag?.x ?? 0, y: drag?.y ?? 0, scale: drag ? 0.55 : 1 }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ opacity: 1 }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId)
                  originRef.current = { x: e.clientX, y: e.clientY }
                }}
                onPointerMove={(e) => {
                  const o = originRef.current
                  if (!o || !e.currentTarget.hasPointerCapture(e.pointerId)) return
                  const d = { x: e.clientX - o.x, y: e.clientY - o.y }
                  if (!drag && Math.hypot(d.x, d.y) < 6) return
                  setDrag(d)
                  setHoverTarget(overContainer())
                }}
                onPointerUp={() => {
                  originRef.current = null
                  if (!drag) {
                    setSelected((s) => !s)
                    soundEngine.click()
                    return
                  }
                  if (overContainer()) seal()
                  else {
                    setDrag(null)
                    setHoverTarget(false)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelected((s) => !s)
                  }
                }}
              >
                <IceCore sparkle />
              </motion.div>
            ) : (
              <p className="font-pixel text-sm text-life">{t('Cylinder stored in the container →', 'Cilindro guardado no recipiente →')}</p>
            )}
          </div>
        </section>

        <section
          className={`flex flex-col rounded border-2 bg-[#0a1628]/92 p-3 md:p-4 ${phase === 'sealed' ? 'border-life' : 'border-cyan-hud/30'}`}
        >
          <p className="font-pixel text-sm text-cyan-hud md:text-base">{t('2 · Drag it here', '2 · Arraste até aqui')}</p>
          <button
            ref={containerRef}
            type="button"
            disabled={phase !== 'store'}
            aria-label={t('Cryogenic container', 'Recipiente criogênico')}
            className={`relative mx-auto mt-3 flex h-48 w-36 flex-col items-center justify-end overflow-hidden rounded-t-[2rem] rounded-b-md border-4 transition-colors ${
              phase === 'sealed'
                ? 'border-life bg-[#0b2a3a]'
                : hoverTarget || selected
                  ? 'border-cyan-hud bg-[#0b2a3a] shadow-[0_0_24px_rgba(94,231,255,0.55)]'
                  : 'border-[#3b5b78] bg-[#0b1b2a]'
            }`}
            onClick={() => {
              if (selected) seal()
            }}
          >
            <div className="absolute inset-x-3 top-3 h-4 rounded-sm bg-[#3b5b78]" aria-hidden />
            <AnimatePresence>
              {phase === 'sealed' ? (
                <motion.div
                  key="core"
                  className="mb-3 h-28 w-14"
                  initial={{ y: -80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 160, damping: 14 }}
                >
                  <div className="h-full w-full rounded-[999px] border-2 border-[#0e3a52] bg-gradient-to-r from-[#bdf0ff] via-[#7fd4f2] to-[#3d9cc4]" />
                </motion.div>
              ) : (
                <span className="mb-6 px-2 text-center text-sm text-void-100/80">
                  {phase === 'store' ? t('Drop here', 'Solte aqui') : t('Waiting for the sample', 'Aguardando amostra')}
                </span>
              )}
            </AnimatePresence>
            {phase === 'sealed' ? (
              <>
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/35 via-cyan-hud/15 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.6] }}
                  transition={{ duration: 1.2 }}
                  aria-hidden
                />
                <motion.div
                  className="absolute inset-x-1 top-1 h-6 rounded-t-[1.6rem] border-b-4 border-life bg-[#1f4560]"
                  initial={{ y: -40 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.35, type: 'spring', stiffness: 220, damping: 16 }}
                  aria-hidden
                />
              </>
            ) : null}
          </button>
          <p className={`mt-3 text-center font-pixel text-lg ${phase === 'sealed' ? 'text-cyan-hud' : 'text-void-100/50'}`}>
            {phase === 'sealed' ? `${CRYO_SEAL_C} °C` : '-- °C'}
          </p>
          <p className="text-center text-sm text-void-100/80">
            {phase === 'sealed' ? t('Cryogenic seal on', 'Selo criogênico ativado') : t('Cryogenic seal off', 'Selo criogênico desligado')}
          </p>
        </section>
      </div>

      {phase === 'sealed' ? (
        <motion.section
          className="mx-auto w-full max-w-6xl rounded border-2 border-life bg-[#0a1628]/92 p-3 md:p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-pixel text-xs text-life md:text-sm">{t('SAMPLE LOGGED', 'AMOSTRA REGISTRADA')}</p>
          <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-cyan-hud/25 px-2 py-1.5">
              <dt className="font-pixel text-xs text-cyan-hud">{t('PLACE', 'LOCAL')}</dt>
              <dd className="text-[#f4fff4]">{siteName}</dd>
            </div>
            <div className="border border-cyan-hud/25 px-2 py-1.5">
              <dt className="font-pixel text-xs text-cyan-hud">{t('COORDINATES', 'COORDENADAS')}</dt>
              <dd className="text-[#f4fff4]">
                {MISSION3_META.lat} · {MISSION3_META.lon}
              </dd>
            </div>
            <div className="border border-cyan-hud/25 px-2 py-1.5">
              <dt className="font-pixel text-xs text-cyan-hud">{t('DEPTH', 'PROFUNDIDADE')}</dt>
              <dd className="text-[#f4fff4]">{formatDepth(DRILL_TARGET_M, locale)}</dd>
            </div>
            <div className="border border-cyan-hud/25 px-2 py-1.5">
              <dt className="font-pixel text-xs text-cyan-hud">{t('DESTINATION', 'DESTINO')}</dt>
              <dd className="text-[#f4fff4]">{t('Part A → base · Part B → Earth', 'Fração A → base · Fração B → Terra')}</dd>
            </div>
          </dl>
          <p className="mt-2 text-sm text-void-100/85">
            {t(
              'Part A becomes water in the lab. Part B stays sealed for scientists on Earth to study later.',
              'A fração A vira água no laboratório. A fração B fica guardada e selada para cientistas na Terra estudarem depois.',
            )}
          </p>
          <McButton className="mc-btn-green mt-3 min-h-12 px-5 font-pixel" onClick={onContinue}>
            {t('Take the sample to the lab (3.5)', 'Levar Amostra ao Laboratório (3.5)')}
          </McButton>
        </motion.section>
      ) : null}
    </Mission3Stage>
  )
}
