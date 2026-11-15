import { useMemo, useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import {
  estimatePanelEfficiency,
  MARS24_FORMULA,
  MARS24_KID,
  MISSION1_META,
  SEASONS,
  type SeasonId,
  type SiteId,
} from '../../data/mission1Data'
import { McButton } from '../../opening/McButton'
import { SciTerm } from '../SciTerm'

interface Props {
  site: SiteId
  onConfirm: (opts: { season: SeasonId; azimuth: number; tilt: number; efficiency: number }) => void
}

export function SolarCalcChallenge({ site, onConfirm }: Props) {
  const [season, setSeason] = useState<SeasonId>('summer_n')
  const [asked, setAsked] = useState(false)
  const [showFormula, setShowFormula] = useState(false)
  const [azimuth, setAzimuth] = useState(0)
  const [tilt, setTilt] = useState(30)
  const [installed, setInstalled] = useState(false)

  const efficiency = useMemo(
    () => estimatePanelEfficiency({ season, azimuth, tilt, site }),
    [season, azimuth, tilt, site],
  )

  return (
    <div className="relative z-10 flex h-full min-h-0 flex-col gap-2 overflow-hidden p-3 sm:p-4 md:flex-row md:gap-4">
      <div className="relative min-h-[40%] flex-1 md:min-h-0">
        <div className="absolute inset-x-[15%] bottom-[18%] flex justify-center">
          <img
            src={MEDIA.mission1.panel}
            alt="Painel solar"
            draggable={false}
            className="w-[min(70%,16rem)] origin-bottom drop-shadow-lg transition-transform duration-150"
            style={{
              imageRendering: 'pixelated',
              transform: `perspective(400px) rotateX(${tilt * 0.6}deg) rotateY(${azimuth * 0.35}deg)`,
            }}
          />
        </div>
        {asked && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 60" aria-hidden>
            <path d="M15 45 Q50 5 85 45" fill="none" stroke="#ffe0a0" strokeWidth="1.2" strokeDasharray="2 2" />
            <text x="50" y="12" textAnchor="middle" fill="#ffe0a0" fontSize="4" fontFamily="monospace">
              Arco do Sol
            </text>
          </svg>
        )}
        <div className="absolute bottom-2 left-2 right-2 rounded bg-[#0a1628]/85 px-2 py-1.5 font-pixel text-[10px] text-cyan-hud sm:text-xs">
          Eficiência prevista: <span className="text-energy">{efficiency}%</span>
          {installed ? ' · Instalado e Ativo' : ''}
        </div>
      </div>

      <div className="flex max-h-[55%] min-h-0 flex-col gap-2 overflow-y-auto rounded border-2 border-cyan-hud/40 bg-[#0a1628]/92 p-3 md:max-h-none md:w-[min(100%,22rem)] md:shrink-0">
        <p className="font-pixel text-sm text-cyan-hud">Desafio 1.2 — Cálculo solar</p>
        <p className="text-xs text-void-200">
          <SciTerm term="Arcadia Planitia" /> · Lat {MISSION1_META.lat} · Lon {MISSION1_META.lon}
        </p>

        <p className="font-pixel text-[10px] text-void-300">Estação marciana</p>
        <div className="flex flex-wrap gap-2">
          {SEASONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`min-h-12 px-3 font-pixel text-xs ${
                season === s.id ? 'bg-cyan-hud text-void-950' : 'border border-cyan-hud/40 text-void-100'
              }`}
              onClick={() => setSeason(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {!asked ? (
          <McButton className="min-h-12 w-full font-pixel font-bold" onClick={() => setAsked(true)}>
            Pedir Cálculo à Capi
          </McButton>
        ) : (
          <>
            <p className="text-sm text-void-100">{MARS24_KID}</p>
            <button
              type="button"
              className="min-h-12 border border-cyan-hud/40 px-3 text-left text-xs text-cyan-hud"
              onClick={() => setShowFormula((v) => !v)}
            >
              {showFormula ? 'Ocultar fórmula' : 'Ver fórmula da NASA (Mars24)'}
            </button>
            {showFormula && (
              <pre className="overflow-x-auto rounded bg-void-950 p-2 font-mono text-[10px] text-energy whitespace-pre-wrap">
                {MARS24_FORMULA}
              </pre>
            )}

            <label className="block font-pixel text-[10px] text-void-300">
              Orientação (<SciTerm term="Azimute" />): Leste ← Sul → Oeste
              <input
                type="range"
                min={-90}
                max={90}
                value={azimuth}
                onChange={(e) => setAzimuth(Number(e.target.value))}
                className="mt-1 h-12 w-full accent-cyan-hud"
              />
            </label>

            <label className="block font-pixel text-[10px] text-void-300">
              Inclinação do painel (0°–60°) · <SciTerm term="Elevação Solar" />
              <input
                type="range"
                min={0}
                max={60}
                value={tilt}
                onChange={(e) => setTilt(Number(e.target.value))}
                className="mt-1 h-12 w-full accent-cyan-hud"
              />
              <span className="text-void-100">{tilt}°</span>
            </label>

            <McButton
              className="min-h-12 w-full font-pixel font-bold"
              disabled={installed}
              onClick={() => {
                setInstalled(true)
                onConfirm({ season, azimuth, tilt, efficiency })
              }}
            >
              {installed ? 'Painel ativo!' : 'Confirmar instalação'}
            </McButton>
          </>
        )}
      </div>
    </div>
  )
}
