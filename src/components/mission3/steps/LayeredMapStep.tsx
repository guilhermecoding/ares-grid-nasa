import { useState } from 'react'
import {
  IDEAL_SITE,
  MAP_LAYERS,
  NASA_CITATIONS,
  SITES,
  WRONG_SITE_ENERGY_COST,
  type MapLayerId,
  type SiteId,
} from '../../../data/mission3Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { CapiBridgeM3 } from '../CapiBridgeM3'
import { SciTermM3 } from '../SciTermM3'

interface Props {
  energyPct: number
  onConfirm: (site: SiteId, energySpent: number) => void
}

/** Challenge 3.2 — layered Arcadia map with 3 candidate sites. */
export function LayeredMapStep({ energyPct, onConfirm }: Props) {
  const [layers, setLayers] = useState<Record<MapLayerId, boolean>>({
    surface: true,
    radar: false,
    studies: false,
    terrain: false,
    ice: false,
  })
  const [picked, setPicked] = useState<SiteId | null>(null)
  const [rejectLines, setRejectLines] = useState<string[] | null>(null)
  const [wrongTax, setWrongTax] = useState(0)

  const site = SITES.find((s) => s.id === picked)

  const toggle = (id: MapLayerId) => {
    soundEngine.step()
    setLayers((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const tryPick = (id: SiteId) => {
    soundEngine.step()
    const info = SITES.find((s) => s.id === id)!
    setPicked(id)
    if (!info.ideal) {
      setRejectLines([info.rejectReason, 'Escolha outro setor com as camadas ligadas.'])
      if (id === 'alpha' && energyPct >= WRONG_SITE_ENERGY_COST) {
        setWrongTax((t) => t + WRONG_SITE_ENERGY_COST)
      }
    }
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ touchAction: 'manipulation' }}>
      <div className="pointer-events-none h-14 shrink-0 sm:h-16" />

      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-y-auto px-3 pb-28 sm:px-4">
        <h2 className="font-pixel text-sm text-cyan-hud sm:text-base">Mapa científico — camadas</h2>
        <p className="mt-1 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
          Ligue as camadas e escolha o melhor ponto. Ideal: forte sinal de{' '}
          <SciTermM3 term="Radar SHARAD">radar</SciTermM3> + terreno estável.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {MAP_LAYERS.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => toggle(layer.id)}
              className={`min-h-12 rounded border-2 px-3 py-2 font-pixel text-[10px] sm:text-xs ${
                layers[layer.id]
                  ? 'border-cyan-hud bg-cyan-hud/20 text-cyan-hud'
                  : 'border-void-500/50 bg-[#0a1628]/8 text-void-300'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {layers[layer.id] ? '● ' : '○ '}
              {layer.label}
            </button>
          ))}
        </div>

        <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden rounded-lg border-2 border-[#6b4228] bg-[#3a2010]">
          {/* Base surface */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#c47848] via-[#a56a3d] to-[#6b4228]" />
          {layers.radar && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_42%,rgba(56,189,248,0.45),transparent_40%)]" />
          )}
          {layers.ice && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_40%,rgba(200,240,255,0.35),transparent_35%)]" />
          )}
          {layers.studies && (
            <div className="pointer-events-none absolute top-2 left-2 rounded bg-[#0a1628]/8 px-2 py-1 font-pixel text-[9px] text-[#f0b429]">
              Estudos NASA ✓
            </div>
          )}
          {layers.terrain && (
            <div className="pointer-events-none absolute right-2 bottom-2 rounded bg-[#0a1628]/8 px-2 py-1 font-pixel text-[9px] text-[#5ecf9a]">
              Estabilidade: ver setores
            </div>
          )}

          {SITES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => tryPick(s.id)}
              className={`absolute flex min-h-12 min-w-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 px-2 font-pixel text-[9px] ${
                picked === s.id ? 'bg-[#0a1628] text-[#f4fff4]' : 'bg-[#0a1628]/75 text-void-100'
              }`}
              style={{
                left: `${s.leftPct}%`,
                top: `${s.topPct}%`,
                borderColor: s.color,
                touchAction: 'manipulation',
              }}
            >
              <span className="text-sm" style={{ color: s.color }}>
                ◆
              </span>
              {s.name}
            </button>
          ))}
        </div>

        {site ? (
          <div className="mt-3 rounded border border-cyan-hud/40 bg-[#0a1628]/9 p-3 font-pixel text-[10px] text-void-100 sm:text-xs">
            <p className="text-cyan-hud">
              {site.name} — {site.short}
            </p>
            <p className="mt-1">
              Radar: {site.radar} · Terreno: {site.terrain} · Gelo: {site.iceHint ? 'sim' : 'não'}
            </p>
            {site.ideal ? (
              <p className="mt-1 text-[#5ecf9a]">Escolha ideal — plano, seguro e forte no SHARAD.</p>
            ) : null}
          </div>
        ) : null}

        <p className="mt-2 font-pixel text-[9px] text-void-300">{NASA_CITATIONS.iceCores}</p>
      </div>

      <div className="absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex justify-end px-3 sm:px-4">
        <McButton
          className="min-h-12 min-w-[10rem] font-pixel text-lg font-bold disabled:opacity-40"
          disabled={picked !== IDEAL_SITE}
          onClick={() => {
            if (picked !== IDEAL_SITE) return
            soundEngine.harvest()
            onConfirm(IDEAL_SITE, wrongTax)
          }}
        >
          Confirmar setor
        </McButton>
      </div>

      {rejectLines ? (
        <CapiBridgeM3 lines={rejectLines} onDone={() => setRejectLines(null)} />
      ) : null}
    </div>
  )
}
