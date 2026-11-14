import { X } from 'lucide-react'
import { ARCADIA_SITE } from '../data/arcadiaSiteData'
import { OSDR_CROPS } from '../data/osdrCrops'
import type { WeatherState } from '../types/game'

interface Props {
  open: boolean
  weather: WeatherState | null
  onClose: () => void
}

export function NasaDataModal({ open, weather, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void-950/75 p-4" role="dialog" aria-modal>
      <div className="glass-panel max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-pixel text-xl text-star">Ciência NASA</h2>
            <p className="text-sm text-void-400">De onde vêm os dados da fazenda espacial.</p>
          </div>
          <button type="button" onClick={onClose} className="pixel-btn rounded-lg bg-void-600 p-2 text-void-100" aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-void-100">
          <section className="rounded-xl border border-panel-edge bg-void-900/80 p-3">
            <h3 className="font-bold text-nebula">
              {ARCADIA_SITE.name} ({ARCADIA_SITE.sector})
            </h3>
            <p className="mt-1 text-void-300">{ARCADIA_SITE.swimNote}</p>
          </section>

          <section className="rounded-xl border border-panel-edge bg-void-900/80 p-3">
            <h3 className="font-bold text-nebula">Clima espacial — DONKI</h3>
            {weather ? (
              <p className="mt-1 text-void-300">
                Hoje: <strong className="text-void-100">{weather.label}</strong> ({weather.sourceMode}) ·{' '}
                {weather.eventLabel}
              </p>
            ) : (
              <p className="mt-1 text-void-300">O clima de cada Sol vem da API CCMC DONKI (flare, CME, SEP).</p>
            )}
            <a
              className="mt-2 inline-block font-bold text-cyan-hud underline"
              href={ARCADIA_SITE.attribution.donki}
              target="_blank"
              rel="noreferrer"
            >
              Abrir DONKI
            </a>
          </section>

          <section className="rounded-xl border border-panel-edge bg-void-900/80 p-3">
            <h3 className="font-bold text-nebula">Plantas OSDR</h3>
            <ul className="mt-1 space-y-1 text-void-300">
              {Object.values(OSDR_CROPS).map((c) => (
                <li key={c.id}>
                  <strong className="text-void-100">{c.name}</strong> — {c.nasaRef}
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-wrap gap-3 text-xs font-bold">
            <a className="text-cyan-hud underline" href={ARCADIA_SITE.attribution.swim} target="_blank" rel="noreferrer">
              NASA SWIM
            </a>
            <a className="text-cyan-hud underline" href={ARCADIA_SITE.attribution.osdr} target="_blank" rel="noreferrer">
              NASA OSDR
            </a>
            <a className="text-cyan-hud underline" href={ARCADIA_SITE.attribution.marsTrek} target="_blank" rel="noreferrer">
              Mars Trek
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
