import { X } from 'lucide-react'
import { ARCADIA_SITE } from '../data/arcadiaSiteData'
import { OSDR_CROPS } from '../data/osdrCrops'
import { useI18n } from '../i18n/locale'
import type { WeatherState } from '../types/game'
import { ScrollHintArea } from './ScrollHintArea'

interface Props {
  open: boolean
  weather: WeatherState | null
  onClose: () => void
}

function weatherLine(label: string, t: (en: string, pt: string) => string): string {
  if (label === 'Sol calmo em Arcadia') return t('A calm Sol in Arcadia', label)
  if (label === 'Tempestade de prótons (SEP)') return t('Proton storm (SEP)', label)
  if (label.startsWith('Flare solar ')) return t(`Solar flare ${label.slice('Flare solar '.length)}`, label)
  const cme = /^CME a (\d+) km\/s rumo a Marte$/.exec(label)
  if (cme) return t(`CME at ${cme[1]} km/s toward Mars`, label)
  return label
}

export function NasaDataModal({ open, weather, onClose }: Props) {
  const { t } = useI18n()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void-950/75 p-4" role="dialog" aria-modal>
      <ScrollHintArea
        variant="dark"
        frameClassName="w-full max-w-lg"
        className="glass-panel max-h-[90vh] rounded-none p-5"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-pixel text-xl text-star">{t('NASA science', 'Ciência NASA')}</h2>
            <p className="text-sm text-void-400">{t('Where the Mars base data comes from.', 'De onde vêm os dados da base em Marte.')}</p>
          </div>
          <button type="button" onClick={onClose} className="pixel-btn rounded-lg bg-void-600 p-2 text-void-100" aria-label={t('Close', 'Fechar')}>
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-void-100">
          <section className="rounded-xl border border-panel-edge bg-void-900/80 p-3">
            <h3 className="font-bold text-nebula">
              {ARCADIA_SITE.name} ({ARCADIA_SITE.sector})
            </h3>
            <p className="mt-1 text-void-300">
              {t(
                'NASA SWIM data (SHARAD / THEMIS) shows shallow water ice under the plain — a good place to make water on Mars.',
                ARCADIA_SITE.swimNote,
              )}
            </p>
          </section>

          <section className="rounded-xl border border-panel-edge bg-void-900/80 p-3">
            <h3 className="font-bold text-nebula">{t('Space weather — DONKI', 'Clima espacial — DONKI')}</h3>
            {weather ? (
              <p className="mt-1 text-void-300">
                {t('Today', 'Hoje')}: <strong className="text-void-100">{weatherLine(weather.label, t)}</strong> ({weather.sourceMode}) ·{' '}
                {weather.eventLabel === 'Sem alerta severo' ? t('No severe alert', 'Sem alerta severo') : weather.eventLabel}
              </p>
            ) : (
              <p className="mt-1 text-void-300">
                {t(
                  'Each Sol’s weather comes from the CCMC DONKI API (flare, CME, SEP).',
                  'O clima de cada Sol vem da API CCMC DONKI (flare, CME, SEP).',
                )}
              </p>
            )}
            <a
              className="mt-2 inline-block font-bold text-cyan-hud underline"
              href={ARCADIA_SITE.attribution.donki}
              target="_blank"
              rel="noreferrer"
            >
              {t('Open DONKI', 'Abrir DONKI')}
            </a>
          </section>

          <section className="rounded-xl border border-panel-edge bg-void-900/80 p-3">
            <h3 className="font-bold text-nebula">{t('OSDR plants', 'Plantas OSDR')}</h3>
            <ul className="mt-1 space-y-1 text-void-300">
              {Object.values(OSDR_CROPS).map((c) => (
                <li key={c.id}>
                  <strong className="text-void-100">
                    {t(
                      c.id === 'radish' ? 'Radish' : c.id === 'romaine' ? 'Romaine lettuce' : c.id === 'spirulina' ? 'Spirulina' : c.name,
                      c.name,
                    )}
                  </strong>{' '}
                  — {c.nasaRef}
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
      </ScrollHintArea>
    </div>
  )
}
