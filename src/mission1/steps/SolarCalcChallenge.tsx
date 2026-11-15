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
import { PixelDialogBox } from '../../opening/PixelDialogBox'
import { EfficiencyGauge } from '../EfficiencyGauge'
import { SciTerm } from '../SciTerm'

const FORMULA_LINES = [
  'Aqui está a fórmula Mars24 da NASA para a altura do Sol!',
  MARS24_FORMULA,
  'Com ela a gente calcula a elevação solar e ajusta o painel.',
] as const

interface Props {
  site: SiteId
  onConfirm: (opts: { season: SeasonId; azimuth: number; tilt: number; efficiency: number }) => void
  onSeasonChange?: (season: SeasonId) => void
}

export function SolarCalcChallenge({ site, onConfirm, onSeasonChange }: Props) {
  const [season, setSeason] = useState<SeasonId>('summer_n')
  const [asked, setAsked] = useState(false)
  const [formulaOpen, setFormulaOpen] = useState(false)
  const [formulaReady, setFormulaReady] = useState(false)
  const [azimuth, setAzimuth] = useState(0)
  const [tilt, setTilt] = useState(30)
  const [installed, setInstalled] = useState(false)

  const efficiency = useMemo(
    () => estimatePanelEfficiency({ season, azimuth, tilt, site }),
    [season, azimuth, tilt, site],
  )

  const changeSeason = (id: SeasonId) => {
    setSeason(id)
    onSeasonChange?.(id)
  }

  return (
    <div className={`relative flex h-full min-h-0 flex-col overflow-hidden ${formulaOpen ? 'z-[60]' : 'z-10'}`}>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3 pb-0 sm:p-4 sm:pb-0 md:flex-row md:gap-4">
        {/* Stage */}
        <div className="relative min-h-[36%] flex-1 md:min-h-0">
          <EfficiencyGauge
            value={efficiency}
            active={installed}
            className="absolute top-16 left-1 z-20 rounded-full bg-[#0a1628]/75 p-1 shadow-[0_4px_16px_rgba(0,0,0,0.4)] sm:top-[4.75rem] sm:left-2"
          />

          <div className="absolute inset-x-[4%] bottom-[6%] flex justify-center sm:inset-x-[8%] sm:bottom-[8%]">
            <img
              src={MEDIA.mission1.panel}
              alt="Painel solar"
              draggable={false}
              className="w-[min(92%,26rem)] origin-bottom drop-shadow-[0_16px_28px_rgba(0,0,0,0.45)] transition-transform duration-150 sm:w-[min(88%,30rem)]"
              style={{
                transform: `perspective(520px) rotateX(${8 + tilt * 0.55}deg) rotateY(${azimuth * 0.32}deg)`,
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
        </div>

        {/* Side panel */}
        <div className="scroll-game-dark flex max-h-[48%] min-h-0 flex-col gap-2 rounded-none border-2 border-cyan-hud/40 bg-[#0a1628]/92 p-3 md:max-h-none md:w-[min(100%,22rem)] md:shrink-0">
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
                className={`min-h-11 px-3 font-pixel text-xs ${
                  season === s.id ? 'bg-cyan-hud text-void-950' : 'border border-cyan-hud/40 text-void-100'
                }`}
                onClick={() => changeSeason(s.id)}
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
                className="min-h-11 shrink-0 border border-cyan-hud/40 px-3 text-left text-xs text-cyan-hud"
                onClick={() => {
                  setFormulaReady(false)
                  setFormulaOpen(true)
                }}
              >
                Ver fórmula da NASA (Mars24)
              </button>

              <McButton
                className="mt-auto min-h-12 w-full shrink-0 font-pixel font-bold"
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

      {/* Bottom controls — outside side panel */}
      {asked && !formulaOpen && (
        <div className="z-20 shrink-0 border-t border-cyan-hud/30 bg-[#0a1628]/95 px-3 py-2 sm:px-4">
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
            <label className="block font-pixel text-xs text-void-200 sm:text-sm">
              Azimute · L ← Sul → O
              <input
                type="range"
                min={-90}
                max={90}
                value={azimuth}
                onChange={(e) => setAzimuth(Number(e.target.value))}
                className="mt-0.5 h-8 w-full accent-cyan-hud"
              />
            </label>
            <label className="block font-pixel text-xs text-void-200 sm:text-sm">
              Inclinação · {tilt}°
              <input
                type="range"
                min={0}
                max={60}
                value={tilt}
                onChange={(e) => setTilt(Number(e.target.value))}
                className="mt-0.5 h-8 w-full accent-cyan-hud"
              />
            </label>
          </div>
        </div>
      )}

      <PixelDialogBox
        open={formulaOpen}
        lines={FORMULA_LINES}
        title="Capi"
        characterSrc={MEDIA.capi.neutral}
        lineClassNames={['', 'font-body font-bold text-energy', '']}
        onTypingComplete={() => setFormulaReady(true)}
        onClosed={() => {
          setFormulaOpen(false)
          setFormulaReady(false)
        }}
        footer={
          formulaReady ? (
            <McButton className="min-h-12 min-w-[120px] px-5 font-pixel text-lg font-bold" onClick={() => setFormulaOpen(false)}>
              Ok
            </McButton>
          ) : null
        }
      />
    </div>
  )
}
