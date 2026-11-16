import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import {
  BETA_CONFIRM_LINES,
  BETA_CONFIRM_LINES_EN,
  MAP_LAYERS,
  NASA_CITATIONS,
  NASA_CITATIONS_EN,
  REQUIRED_MAP_LAYERS,
  SITES,
  WRONG_SITE_ENERGY_COST,
  type MapLayerId,
  type SiteId,
  type SiteInfo,
} from '../../../data/mission3Data'
import { useI18n } from '../../../i18n/locale'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { ArcadiaSiteMap } from '../ArcadiaSiteMap'
import { CapiBeat } from '../CapiBeat'
import { CapiBridgeM3 } from '../CapiBridgeM3'
import { Mission3Stage } from '../Mission3Stage'
import { SciTermM3 } from '../SciTermM3'

interface Props {
  energy: number
  waterL: number
  onSpend: (n: number) => void
  onConfirm: (site: SiteId) => void
}

type LayerMap = Record<MapLayerId, boolean>

const SECTOR_ICON: Record<SiteId, string> = {
  alpha: MEDIA.mission3.sectorAlpha,
  beta: MEDIA.mission3.sectorBeta,
  gamma: MEDIA.mission3.sectorGamma,
}

const RADAR_GLOW: Record<SiteInfo['radar'], string> = {
  Forte: 'rgba(56,189,248,0.75)',
  Moderado: 'rgba(56,189,248,0.38)',
  'Sem sinal': 'transparent',
}

const INTRO_LINES = [
  'Primeiro ligue as camadas do mapa. O botão que pulsa é o próximo.',
  'Depois toque no setor. O certo tem gelo, radar forte e chão plano.',
] as const

const INTRO_LINES_EN = [
  'First, turn on the map layers. The button that pulses is next.',
  'Then tap a sector. The right one has ice, a strong radar signal, and flat ground.',
] as const

function SiteRow({ label, value, on, good }: { label: string; value: string; on: boolean; good?: boolean }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center justify-between gap-2 border-b border-cyan-hud/15 py-2 text-base last:border-0">
      <span className="text-void-100/85">{label}</span>
      {on ? (
        <span className={`font-semibold ${good === undefined ? 'text-[#f4fff4]' : good ? 'text-life' : 'text-danger'}`}>{value}</span>
      ) : (
        <span className="text-sm text-void-100/55">{t('turn the layer on', 'ligue a camada')}</span>
      )}
    </div>
  )
}

/** Desafio 3.2 — layered Arcadia map, three candidate sectors. */
export function LayeredMapStep({ energy, waterL, onSpend, onConfirm }: Props) {
  const { t, locale } = useI18n()
  const [layers, setLayers] = useState<LayerMap>({ surface: true, radar: false, studies: false, terrain: false, ice: false })
  const [seen, setSeen] = useState<Set<MapLayerId>>(() => new Set(['surface']))
  const [picked, setPicked] = useState<SiteId | null>(null)
  const [feedback, setFeedback] = useState<{ siteId: SiteId; ok: boolean } | null>(null)
  const [rejected, setRejected] = useState<Set<SiteId>>(() => new Set())
  const [introOpen, setIntroOpen] = useState(true)

  const missing = REQUIRED_MAP_LAYERS.filter((id) => !seen.has(id))
  const nextLayer = missing[0] ?? null
  const site = SITES.find((s) => s.id === picked) ?? null
  const guide = missing.length > 0 ? 1 : !picked ? 2 : 3

  const toggle = (id: MapLayerId) => {
    soundEngine.click()
    setLayers((prev) => ({ ...prev, [id]: !prev[id] }))
    setSeen((prev) => new Set(prev).add(id))
  }

  const confirm = () => {
    if (!site || missing.length > 0) return
    if (site.ideal) {
      soundEngine.success()
      setFeedback({ siteId: site.id, ok: true })
      return
    }
    soundEngine.fail()
    onSpend(WRONG_SITE_ENERGY_COST)
    setRejected((prev) => new Set(prev).add(site.id))
    setFeedback({ siteId: site.id, ok: false })
  }

  const introLines = useMemo(() => (locale === 'en' ? INTRO_LINES_EN : INTRO_LINES), [locale])
  const feedbackLines = useMemo(() => {
    if (!feedback) return []
    if (feedback.ok) return locale === 'en' ? [...BETA_CONFIRM_LINES_EN] : [...BETA_CONFIRM_LINES]
    const chosen = SITES.find((item) => item.id === feedback.siteId)
    const reasons = chosen ? (locale === 'en' ? chosen.rejectReasonEn : chosen.rejectReason) : []
    return [
      ...reasons,
      t(
        `That try used ${WRONG_SITE_ENERGY_COST}% energy. Pick another sector.`,
        `A tentativa gastou ${WRONG_SITE_ENERGY_COST}% de energia. Escolha outro setor.`,
      ),
    ]
  }, [feedback, locale, t])

  const activeLayers = MAP_LAYERS.filter((layer) => layers[layer.id])

  return (
    <Mission3Stage
      title={t('Challenge 3.2 — Science Map with Layers', 'Desafio 3.2 — Mapa Científico com Camadas')}
      subtitle={
        <>
          {t(
            'Follow the 3 steps. The best spot has a strong signal on the',
            'Siga os 3 passos. O ponto ideal tem sinal forte no',
          )}{' '}
          <SciTermM3 term={t('SHARAD radar', 'Radar SHARAD')} />
          {t(', ice in the studies, and stable ground.', ', gelo nos estudos e terreno estável.')}
        </>
      }
      energy={energy}
      waterL={waterL}
      overlay={
        introOpen ? (
          <CapiBeat id="m3-map-intro" lines={introLines} onDone={() => setIntroOpen(false)} />
        ) : feedback ? (
          <CapiBridgeM3
            dialogId={feedback.ok ? 'm3-map-beta' : `m3-map-reject-${feedback.siteId}`}
            lines={feedbackLines}
            onDone={() => {
              const ok = feedback.ok
              const chosen = feedback.siteId
              setFeedback(null)
              if (ok) onConfirm(chosen)
              else setPicked(null)
            }}
          />
        ) : null
      }
    >
      <ol className="mx-auto grid w-full max-w-6xl gap-2 sm:grid-cols-3">
        {[
          ['1', t('Turn on the layers', 'Ligue as camadas')],
          ['2', t('Tap a sector', 'Toque no setor')],
          ['3', t('Confirm', 'Confirme')],
        ].map(([n, label], i) => {
          const current = guide === i + 1
          const done = guide > i + 1
          return (
            <li
              key={n}
              className={`flex min-h-14 items-center gap-3 rounded border-2 px-3 py-2 text-base ${
                done ? 'border-life bg-life/10 text-life' : current ? 'border-energy text-energy shadow-[0_0_16px_rgba(250,204,21,0.25)]' : 'border-void-600 text-void-100/70'
              }`}
            >
              <span className="font-pixel text-lg">{done ? '✓' : n}</span>
              <span className="font-semibold">{label}</span>
            </li>
          )
        })}
      </ol>

      <div className="mx-auto grid w-full max-w-6xl gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-4">
        <section className="rounded border-2 border-cyan-hud/30 bg-[#0a1628]/92 p-3 md:p-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('Map layers', 'Camadas do mapa')}>
            {MAP_LAYERS.map((layer) => {
              const pulse = layer.id === nextLayer
              return (
                <motion.button
                  key={layer.id}
                  type="button"
                  aria-pressed={layers[layer.id]}
                  animate={pulse ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                  transition={pulse ? { duration: 1, repeat: Infinity } : { duration: 0.2 }}
                  onClick={() => toggle(layer.id)}
                  className={`min-h-14 rounded border-2 px-3 py-2 text-left text-sm font-semibold md:text-base ${
                    layers[layer.id]
                      ? 'border-cyan-hud bg-cyan-hud/20 text-cyan-hud'
                      : pulse
                        ? 'border-energy text-energy'
                        : 'border-void-600 bg-void-900/60 text-void-100/80'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {layers[layer.id] ? '● ' : pulse ? '→ ' : '○ '}
                  {t(layer.labelEn, layer.label)}
                  {pulse ? <span className="mt-0.5 block font-pixel text-xs">{t('TAP HERE', 'TOQUE AQUI')}</span> : null}
                </motion.button>
              )
            })}
          </div>

          <div className="relative mt-3 aspect-[16/10] w-full overflow-hidden rounded border-2 border-[#6b4228]">
            <ArcadiaSiteMap />
            <img
              src={MEDIA.mission3.crater}
              alt=""
              className="pointer-events-none absolute w-[58%] max-w-none -translate-x-1/2 -translate-y-1/2"
              style={{ left: '76%', top: '64%' }}
              draggable={false}
            />
            <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
              {activeLayers.map((layer, i) =>
                SITES.filter((s) => layer.id !== 'ice' || s.iceHint).map((s) => (
                  <motion.line
                    key={`${layer.id}-${s.id}`}
                    x1={`${8 + i * 16}%`}
                    y1="2%"
                    x2={`${s.leftPct}%`}
                    y2={`${s.topPct}%`}
                    stroke={s.color}
                    strokeWidth="2"
                    strokeDasharray="7 6"
                    initial={{ strokeDashoffset: 48, opacity: 0 }}
                    animate={{ strokeDashoffset: 0, opacity: 0.9 }}
                    transition={{ duration: 0.6 }}
                  />
                )),
              )}
            </svg>

            <AnimatePresence>
              {layers.terrain
                ? SITES.map((s) => (
                    <motion.div
                      key={`terrain-${s.id}`}
                      className="pointer-events-none absolute size-[26%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed"
                      style={{
                        left: `${s.leftPct}%`,
                        top: `${s.topPct}%`,
                        borderColor: s.terrain === 'Instável' ? '#ff6b8a' : '#5ecf9a',
                        background: s.terrain === 'Instável' ? 'repeating-linear-gradient(45deg, rgba(255,107,138,0.22) 0 6px, transparent 6px 12px)' : 'rgba(94,207,154,0.12)',
                      }}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  ))
                : null}
              {layers.radar
                ? SITES.map((s) => (
                    <motion.div
                      key={`radar-${s.id}`}
                      className="pointer-events-none absolute size-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{ left: `${s.leftPct}%`, top: `${s.topPct}%`, background: `radial-gradient(circle, ${RADAR_GLOW[s.radar]}, transparent 65%)` }}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: [0.55, 1, 0.55], scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ opacity: { duration: 2, repeat: Infinity } }}
                    />
                  ))
                : null}
              {layers.ice
                ? SITES.filter((s) => s.iceHint).map((s) => (
                    <motion.div
                      key={`ice-${s.id}`}
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-[40%] border border-white/70 bg-[#c8f0ff]/50"
                      style={{ left: `${s.leftPct}%`, top: `${s.topPct + 8}%`, width: s.ideal ? '18%' : '9%', height: s.ideal ? '10%' : '6%' }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    />
                  ))
                : null}
            </AnimatePresence>

            {SITES.map((s) => {
              const isPicked = picked === s.id
              const canPick = missing.length === 0
              return (
                <motion.button
                  key={s.id}
                  type="button"
                  aria-pressed={isPicked}
                  animate={!canPick ? { scale: 1 } : isPicked ? { scale: 1.08 } : { scale: [1, 1.05, 1] }}
                  transition={!canPick || isPicked ? { duration: 0.2 } : { duration: 1.3, repeat: Infinity }}
                  onClick={() => {
                    if (!canPick) {
                      soundEngine.fail()
                      return
                    }
                    soundEngine.step()
                    setPicked(s.id)
                  }}
                  className={`absolute flex min-h-16 min-w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded border-2 bg-[#0a1628]/90 px-2 py-1 text-center ${
                    rejected.has(s.id) ? 'opacity-70' : ''
                  }`}
                  style={{ left: `${s.leftPct}%`, top: `${s.topPct}%`, borderColor: s.color, touchAction: 'manipulation' }}
                >
                  <img src={SECTOR_ICON[s.id]} alt="" className="size-10 object-contain" draggable={false} />
                  <span className="font-pixel text-[11px] text-[#f4fff4] md:text-xs">{t(s.nameEn, s.name)}</span>
                  {layers.studies ? (
                    <span className={`text-[11px] md:text-xs ${s.studies === 'Gelo confirmado' ? 'text-life' : 'text-energy'}`}>
                      {t(s.studiesEn, s.studies)}
                    </span>
                  ) : null}
                </motion.button>
              )
            })}
            {guide === 2 ? (
              <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-[#0a1628]/90 px-3 py-1 font-pixel text-sm text-energy">
                {t('Tap a sector', 'Toque no setor')}
              </p>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-void-100/75">{locale === 'en' ? NASA_CITATIONS_EN.sharad : NASA_CITATIONS.sharad}</p>
        </section>

        <section className={`flex flex-col rounded border-2 bg-[#0a1628]/92 p-4 ${site?.ideal && missing.length === 0 ? 'border-life' : 'border-cyan-hud/30'}`}>
          <p className="font-pixel text-xs text-cyan-hud md:text-sm">{t('SECTOR CARD', 'FICHA DO SETOR')}</p>
          {site ? (
            <>
              <div className="mt-2 flex items-center gap-3">
                <img src={SECTOR_ICON[site.id]} alt="" className="size-14 object-contain" draggable={false} />
                <p className="font-pixel text-base text-[#f4fff4]">
                  {t(site.nameEn, site.name)}
                  <span className="mt-1 block text-sm font-sans font-normal text-void-100/80">{t(site.shortEn, site.short)}</span>
                </p>
              </div>
              <div className="mt-2">
                <SiteRow label={t('SHARAD radar', 'Radar SHARAD')} value={t(site.radarEn, site.radar)} on={layers.radar} good={site.radar === 'Forte'} />
                <SiteRow label={t('NASA studies', 'Estudos NASA')} value={t(site.studiesEn, site.studies)} on={layers.studies} good={site.studies === 'Gelo confirmado'} />
                <SiteRow label={t('Ground', 'Terreno')} value={t(site.terrainEn, site.terrain)} on={layers.terrain} good={site.terrain !== 'Instável'} />
                <SiteRow
                  label={t('Ice deposit', 'Depósito de gelo')}
                  value={site.iceHint ? t('Possible', 'Possível') : t('None', 'Nenhum')}
                  on={layers.ice}
                  good={site.iceHint}
                />
              </div>
            </>
          ) : (
            <p className="mt-3 text-base text-void-100/85">
              {missing.length > 0
                ? t('Turn on the layers that pulse. Then the map unlocks the sectors.', 'Ligue as camadas que pulsam. Depois o mapa libera os setores.')
                : t('Tap a sector on the map.', 'Toque em um setor do mapa.')}
            </p>
          )}
          <p className="mt-3 text-sm text-void-100/80">
            {t(
              `Layers checked: ${REQUIRED_MAP_LAYERS.length - missing.length}/${REQUIRED_MAP_LAYERS.length}`,
              `Camadas analisadas: ${REQUIRED_MAP_LAYERS.length - missing.length}/${REQUIRED_MAP_LAYERS.length}`,
            )}
          </p>
          <motion.div animate={guide === 3 ? { scale: [1, 1.03, 1] } : { scale: 1 }} transition={guide === 3 ? { duration: 1, repeat: Infinity } : { duration: 0.2 }}>
            <McButton className={`mt-3 min-h-14 w-full px-5 font-pixel text-base ${site && missing.length === 0 ? '' : 'opacity-50'}`} disabled={!site || missing.length > 0} onClick={confirm}>
              {guide === 3 ? t('Confirm this sector', 'Confirme este setor') : t('Confirm sector', 'Confirmar setor')}
            </McButton>
          </motion.div>
        </section>
      </div>
    </Mission3Stage>
  )
}
