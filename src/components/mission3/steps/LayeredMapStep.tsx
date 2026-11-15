import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import {
  BETA_CONFIRM_LINES,
  MAP_LAYERS,
  NASA_CITATIONS,
  REQUIRED_MAP_LAYERS,
  SITES,
  WRONG_SITE_ENERGY_COST,
  type MapLayerId,
  type SiteId,
  type SiteInfo,
} from '../../../data/mission3Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
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

const RADAR_GLOW: Record<SiteInfo['radar'], string> = {
  Forte: 'rgba(56,189,248,0.75)',
  Moderado: 'rgba(56,189,248,0.38)',
  'Sem sinal': 'transparent',
}

function SiteRow({ label, value, on, good }: { label: string; value: string; on: boolean; good?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-cyan-hud/15 py-1.5 text-sm last:border-0">
      <span className="text-void-100/80">{label}</span>
      {on ? (
        <span className={`font-semibold ${good === undefined ? 'text-[#f4fff4]' : good ? 'text-life' : 'text-danger'}`}>
          {value}
        </span>
      ) : (
        <span className="text-xs text-void-100/45">ligue a camada</span>
      )}
    </div>
  )
}

/** Desafio 3.2 — layered Arcadia map, three candidate sectors. */
export function LayeredMapStep({ energy, waterL, onSpend, onConfirm }: Props) {
  const [layers, setLayers] = useState<LayerMap>({ surface: true, radar: false, studies: false, terrain: false, ice: false })
  const [seen, setSeen] = useState<Set<MapLayerId>>(() => new Set(['surface']))
  const [picked, setPicked] = useState<SiteId | null>(null)
  const [feedback, setFeedback] = useState<{ lines: string[]; ok: boolean } | null>(null)
  const [rejected, setRejected] = useState<Set<SiteId>>(() => new Set())

  const missing = REQUIRED_MAP_LAYERS.filter((id) => !seen.has(id))
  const site = SITES.find((s) => s.id === picked) ?? null

  const toggle = (id: MapLayerId) => {
    soundEngine.click()
    setLayers((prev) => ({ ...prev, [id]: !prev[id] }))
    setSeen((prev) => new Set(prev).add(id))
  }

  const confirm = () => {
    if (!site || missing.length > 0) return
    if (site.ideal) {
      soundEngine.success()
      setFeedback({ lines: [...BETA_CONFIRM_LINES], ok: true })
      return
    }
    soundEngine.fail()
    onSpend(WRONG_SITE_ENERGY_COST)
    setRejected((prev) => new Set(prev).add(site.id))
    setFeedback({
      lines: [...site.rejectReason, `A tentativa gastou ${WRONG_SITE_ENERGY_COST}% de energia. Escolha outro setor.`],
      ok: false,
    })
  }

  const capiTip =
    missing.length > 0
      ? `Ligue as camadas para comparar os setores. Faltam: ${missing.length}.`
      : site
        ? `${site.name} selecionado. Confira radar, estudos e terreno antes de confirmar.`
        : 'Camadas analisadas! Toque no setor que reúne gelo e chão seguro.'

  return (
    <Mission3Stage
      title="Desafio 3.2 — Mapa Científico com Camadas"
      subtitle={
        <>
          Ligue as 5 camadas e compare os setores. O ponto ideal tem sinal forte no{' '}
          <SciTermM3 term="Radar SHARAD">radar SHARAD</SciTermM3>, gelo nos estudos e terreno estável.
        </>
      }
      energy={energy}
      waterL={waterL}
      capiTip={capiTip}
      overlay={
        feedback ? (
          <CapiBridgeM3
            lines={feedback.lines}
            onDone={() => {
              const ok = feedback.ok
              setFeedback(null)
              if (ok) onConfirm(picked!)
              else setPicked(null)
            }}
          />
        ) : null
      }
    >
      <div className="mx-auto grid w-full max-w-6xl gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-4">
        <section className="rounded border-2 border-cyan-hud/30 bg-[#0a1628]/92 p-3 md:p-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Camadas do mapa">
            {MAP_LAYERS.map((layer) => (
              <button
                key={layer.id}
                type="button"
                aria-pressed={layers[layer.id]}
                onClick={() => toggle(layer.id)}
                className={`min-h-12 rounded border-2 px-3 py-2 text-left text-xs font-semibold md:text-sm ${
                  layers[layer.id]
                    ? 'border-cyan-hud bg-cyan-hud/20 text-cyan-hud'
                    : 'border-void-600 bg-void-900/60 text-void-100/75'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {layers[layer.id] ? '● ' : '○ '}
                {layer.label}
              </button>
            ))}
          </div>

          <div className="relative mt-3 aspect-[16/10] w-full overflow-hidden rounded border-2 border-[#6b4228] bg-[#1c1410]">
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${layers.surface ? 'opacity-100' : 'opacity-15'}`}
              style={{
                background:
                  'radial-gradient(ellipse at 20% 60%, #7a3c1f 0 18%, transparent 30%), radial-gradient(ellipse at 76% 64%, #4a2614 0 10%, #8f4a26 11% 16%, transparent 22%), linear-gradient(180deg,#c47848,#a56a3d 55%,#6b4228)',
              }}
            />
            {!layers.surface ? (
              <div
                className="absolute inset-0 opacity-30"
                style={{ backgroundImage: 'linear-gradient(#5ee7ff33 1px, transparent 1px), linear-gradient(90deg,#5ee7ff33 1px, transparent 1px)', backgroundSize: '28px 28px' }}
                aria-hidden
              />
            ) : null}

            <AnimatePresence>
              {layers.terrain
                ? SITES.map((s) => (
                    <motion.div
                      key={`terrain-${s.id}`}
                      className="absolute size-[26%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed"
                      style={{
                        left: `${s.leftPct}%`,
                        top: `${s.topPct}%`,
                        borderColor: s.terrain === 'Instável' ? '#ff6b8a' : '#5ecf9a',
                        background:
                          s.terrain === 'Instável'
                            ? 'repeating-linear-gradient(45deg, rgba(255,107,138,0.22) 0 6px, transparent 6px 12px)'
                            : 'rgba(94,207,154,0.1)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      aria-hidden
                    />
                  ))
                : null}
              {layers.radar
                ? SITES.map((s) => (
                    <motion.div
                      key={`radar-${s.id}`}
                      className="absolute size-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        left: `${s.leftPct}%`,
                        top: `${s.topPct}%`,
                        background: `radial-gradient(circle, ${RADAR_GLOW[s.radar]}, transparent 65%)`,
                      }}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: [0.6, 1, 0.6], scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ opacity: { duration: 2, repeat: Infinity } }}
                      aria-hidden
                    />
                  ))
                : null}
              {layers.ice
                ? SITES.filter((s) => s.iceHint).map((s) => (
                    <motion.div
                      key={`ice-${s.id}`}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[40%] border border-white/60 bg-[#c8f0ff]/45"
                      style={{
                        left: `${s.leftPct}%`,
                        top: `${s.topPct + 6}%`,
                        width: s.ideal ? '22%' : '10%',
                        height: s.ideal ? '12%' : '6%',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      aria-hidden
                    />
                  ))
                : null}
            </AnimatePresence>

            {SITES.map((s) => {
              const isPicked = picked === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={isPicked}
                  onClick={() => {
                    soundEngine.step()
                    setPicked(s.id)
                  }}
                  className={`absolute flex min-h-12 min-w-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded border-2 px-2 py-1 font-pixel text-[9px] md:text-[10px] ${
                    isPicked ? 'scale-110 bg-[#0a1628] text-[#f4fff4]' : 'bg-[#0a1628]/80 text-void-100'
                  } ${rejected.has(s.id) ? 'opacity-60' : ''}`}
                  style={{ left: `${s.leftPct}%`, top: `${s.topPct}%`, borderColor: s.color, touchAction: 'manipulation' }}
                >
                  <span className="text-sm" style={{ color: s.color }}>
                    {rejected.has(s.id) ? '✕' : '◆'}
                  </span>
                  {s.name}
                  {layers.studies ? (
                    <span className={`mt-0.5 text-[8px] ${s.studies === 'Gelo confirmado' ? 'text-life' : 'text-energy'}`}>
                      {s.studies}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-void-100/70">{NASA_CITATIONS.sharad}</p>
        </section>

        <section
          className={`flex flex-col rounded border-2 bg-[#0a1628]/92 p-3 md:p-4 ${site?.ideal && missing.length === 0 ? 'border-life' : 'border-cyan-hud/30'}`}
        >
          <p className="font-pixel text-[10px] text-cyan-hud">FICHA DO SETOR</p>
          {site ? (
            <>
              <p className="mt-1 font-pixel text-sm text-[#f4fff4]">
                {site.name} — {site.short}
              </p>
              <div className="mt-2">
                <SiteRow label="Radar SHARAD" value={site.radar} on={layers.radar} good={site.radar === 'Forte'} />
                <SiteRow label="Estudos NASA" value={site.studies} on={layers.studies} good={site.studies === 'Gelo confirmado'} />
                <SiteRow label="Terreno" value={site.terrain} on={layers.terrain} good={site.terrain !== 'Instável'} />
                <SiteRow label="Depósito de gelo" value={site.iceHint ? 'Possível' : 'Nenhum'} on={layers.ice} good={site.iceHint} />
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-void-100/80">Toque em um setor do mapa para ver os dados.</p>
          )}
          <p className="mt-3 text-xs text-void-100/75">
            Camadas analisadas: {REQUIRED_MAP_LAYERS.length - missing.length}/{REQUIRED_MAP_LAYERS.length}
          </p>
          <McButton
            className={`mt-3 min-h-12 px-5 font-pixel ${site && missing.length === 0 ? '' : 'opacity-50'}`}
            disabled={!site || missing.length > 0}
            onClick={confirm}
          >
            Confirmar setor
          </McButton>
        </section>
      </div>
    </Mission3Stage>
  )
}
