import { useMemo, useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import {
  AZIMUTH_POINTS,
  azimuthCardinal,
  estimateGenerationWatts,
  estimatePanelEfficiency,
  MARS24_FORMULA,
  MARS24_KID,
  MISSION1_META,
  SEASONS,
  type SeasonId,
  type SiteId,
} from '../../data/mission1Data'
import { ScrollHintArea } from '../../components/ScrollHintArea'
import { useI18n } from '../../i18n/locale'
import { McButton } from '../../opening/McButton'
import { PixelDialogBox } from '../../opening/PixelDialogBox'
import { marsSolarAtArcadia, type MarsSolarReading, type SolarClockId } from '../../services/mars24'
import { EfficiencyGauge } from '../EfficiencyGauge'
import { SciTerm } from '../SciTerm'

const CLOCK_LABELS: Record<SolarClockId, { en: string; pt: string }> = {
  morning: { en: 'Morning (09:00)', pt: 'Manhã (09:00)' },
  noon: { en: 'Noon (12:00)', pt: 'Meio-dia (12:00)' },
  afternoon: { en: 'Afternoon (15:00)', pt: 'Tarde (15:00)' },
}

function cardinalName(azimuth: number, t: (en: string, pt: string) => string) {
  const word = azimuthCardinal(azimuth)
  if (word === 'Norte') return t('North', 'Norte')
  if (word === 'Leste') return t('East', 'Leste')
  if (word === 'Oeste') return t('West', 'Oeste')
  return t('South', 'Sul')
}

type ClockChoice = 'now' | SolarClockId

function solarView(reading: MarsSolarReading, choice: ClockChoice) {
  if (choice === 'now') {
    return {
      lmst: reading.lmst,
      elevationDeg: reading.elevationDeg,
      zenithDeg: reading.zenithDeg,
      sunUp: reading.sunUp,
      suggestedTilt: reading.suggestedTilt,
    }
  }
  const preset = reading.presets.find((item) => item.id === choice)
  return {
    lmst: preset?.lmst ?? reading.lmst,
    elevationDeg: preset?.elevationDeg ?? reading.elevationDeg,
    zenithDeg: preset?.zenithDeg ?? reading.zenithDeg,
    sunUp: preset?.sunUp ?? reading.sunUp,
    suggestedTilt: preset?.suggestedTilt ?? reading.suggestedTilt,
  }
}

interface Props {
  site: SiteId
  /** Restore last saved panel orientation when replaying Missão 01. */
  initialSeason?: SeasonId
  initialAzimuth?: number
  initialTilt?: number
  /** If true, open controls immediately so the panel shows as configured. */
  restoreLayout?: boolean
  onConfirm: (opts: { season: SeasonId; azimuth: number; tilt: number; efficiency: number }) => void
  onSeasonChange?: (season: SeasonId) => void
}

export function SolarCalcChallenge({
  site,
  initialSeason = 'summer_n',
  initialAzimuth = 0,
  initialTilt = 30,
  restoreLayout = false,
  onConfirm,
  onSeasonChange,
}: Props) {
  const { t } = useI18n()
  const [season, setSeason] = useState<SeasonId>(initialSeason)
  const [asked, setAsked] = useState(restoreLayout)
  const [formulaOpen, setFormulaOpen] = useState(false)
  const [formulaReady, setFormulaReady] = useState(false)
  const [azimuth, setAzimuth] = useState(initialAzimuth)
  const [tilt, setTilt] = useState(initialTilt)
  const [installed, setInstalled] = useState(false)
  const [solar, setSolar] = useState<MarsSolarReading | null>(null)
  const [solarError, setSolarError] = useState(false)
  const [clock, setClock] = useState<ClockChoice | null>(null)

  const efficiency = useMemo(
    () => estimatePanelEfficiency({ season, azimuth, tilt, site }),
    [season, azimuth, tilt, site],
  )
  const formulaLines = useMemo(
    () => [
      t(
        'Here is the NASA Mars24 formula for the height of the Sun!',
        'Aqui está a fórmula Mars24 da NASA para a altura do Sol!',
      ),
      MARS24_FORMULA,
      t(
        'We use it to find the solar elevation and aim the panel.',
        'Com ela a gente calcula a elevação solar e ajusta o painel.',
      ),
    ],
    [t],
  )
  const generationWatts = estimateGenerationWatts(efficiency)
  const seasonIdeal = SEASONS.find((item) => item.id === season)?.idealTilt ?? 35
  const view = solar && clock ? solarView(solar, clock) : null
  const recommendedTilt = view?.suggestedTilt ?? seasonIdeal

  const changeSeason = (id: SeasonId) => {
    setSeason(id)
    onSeasonChange?.(id)
  }

  const readSolarTime = (choice: ClockChoice) => {
    try {
      const reading = marsSolarAtArcadia()
      setSolar(reading)
      setSolarError(false)
      setClock(choice)
      if (choice === 'now') {
        setTilt(reading.suggestedTilt)
        changeSeason(reading.suggestedSeason)
      }
    } catch {
      setSolar(null)
      setSolarError(true)
    }
  }

  const applyRecommended = () => {
    setAzimuth(0)
    setTilt(recommendedTilt)
  }

  return (
    <div className={`relative flex h-full min-h-0 flex-col overflow-hidden ${formulaOpen ? 'z-[60]' : 'z-10'}`}>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3 pb-0 sm:p-4 sm:pb-0 md:flex-row md:gap-4">
        {/* Stage */}
        <div className="relative min-h-[36%] flex-1 md:min-h-0">
          <div className="absolute top-14 left-1 z-20 flex max-w-[12.5rem] items-center gap-1 sm:top-[4.75rem] sm:left-2 sm:max-w-[16rem] sm:gap-2">
            <div className="h-[4.75rem] w-[4.75rem] shrink-0 sm:h-28 sm:w-28">
              <EfficiencyGauge
                value={efficiency}
                active={installed}
                className="origin-top-left scale-[0.68] rounded-full bg-[#0a1628]/75 p-1 shadow-[0_4px_16px_rgba(0,0,0,0.4)] sm:scale-100"
              />
            </div>
            <div className="min-w-0 rounded bg-[#0a1628]/80 px-1.5 py-1 shadow-[0_4px_16px_rgba(0,0,0,0.4)] sm:px-2 sm:py-1.5">
              <p className="font-pixel text-[9px] text-cyan-hud sm:text-[10px]">{t('Estimated power', 'Geração estimada')}</p>
              <p className="font-pixel text-xs text-[#f4fff4] sm:text-sm">
                {generationWatts} W ({efficiency}%)
              </p>
              <p className="text-[9px] leading-tight text-void-300 sm:text-[10px] sm:leading-snug">
                {t('A game estimate, not a NASA measurement.', 'Estimativa do jogo, não é medida da NASA.')}
              </p>
            </div>
          </div>

          <div className="absolute inset-x-[4%] bottom-[6%] flex justify-center sm:inset-x-[8%] sm:bottom-[8%]">
            <img
              src={MEDIA.mission1.panel}
              alt={t('Solar panel', 'Painel solar')}
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
              <text
                className="hidden sm:inline"
                x="50"
                y="12"
                textAnchor="middle"
                fill="#ffe0a0"
                fontSize="4"
                fontFamily="monospace"
              >
                {t('Path of the Sun', 'Arco do Sol')}
              </text>
            </svg>
          )}
        </div>

        {/* Side panel */}
        <ScrollHintArea
          variant="dark"
          frameClassName="max-h-[48%] min-h-0 md:max-h-none md:w-[min(100%,22rem)] md:shrink-0"
          className="flex max-h-[48%] min-h-0 flex-col gap-2 rounded-none border-2 border-cyan-hud/40 bg-[#0a1628]/92 p-3 md:max-h-none"
        >
          <p className="font-pixel text-sm text-cyan-hud">
            {t('Challenge 1.2 — Solar calculation', 'Desafio 1.2 — Cálculo solar')}
          </p>
          <p className="text-xs text-void-200">
            <SciTerm term="Arcadia Planitia" /> · Lat {MISSION1_META.lat} · Lon {MISSION1_META.lon}
          </p>

          <McButton className="min-h-11 w-full font-pixel text-xs font-bold" onClick={() => readSolarTime('now')}>
            {t('NASA solar time', 'Horário solar da NASA')}
          </McButton>
          <div className="grid grid-cols-3 gap-1">
            {(Object.keys(CLOCK_LABELS) as SolarClockId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`min-h-11 px-1 font-pixel text-[10px] leading-tight ${
                  clock === id ? 'bg-cyan-hud text-void-950' : 'border border-cyan-hud/40 text-void-100'
                }`}
                onClick={() => readSolarTime(id)}
              >
                {t(CLOCK_LABELS[id].en, CLOCK_LABELS[id].pt)}
              </button>
            ))}
          </div>
          {view ? (
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="border border-cyan-hud/30 px-1 py-1">
                <p className="text-[10px] text-void-300">{t('Elevation (h)', 'Elevação (h)')}</p>
                <p className="font-pixel text-sm text-[#f4fff4]">{Math.round(view.elevationDeg)}°</p>
              </div>
              <div className="border border-cyan-hud/30 px-1 py-1">
                <p className="text-[10px] text-void-300">{t('Zenith (Z)', 'Zênite (Z)')}</p>
                <p className="font-pixel text-sm text-[#f4fff4]">{Math.round(view.zenithDeg)}°</p>
              </div>
              <div className="border border-cyan-hud/30 px-1 py-1">
                <p className="text-[10px] text-void-300">{t('Target', 'Alvo')}</p>
                <p className="font-pixel text-xs text-energy">
                  {t('South', 'Sul')} · {view.suggestedTilt}°
                </p>
              </div>
            </div>
          ) : null}
          {view ? (
            <p className="text-sm text-void-100">
              {t(`Solar time ${view.lmst}.`, `Horário solar ${view.lmst}.`)}
              {view.sunUp ? '' : t(' The Sun is below the horizon.', ' O Sol está abaixo do horizonte.')}
            </p>
          ) : null}
          {solarError ? (
            <p className="text-sm text-danger">
              {t(
                'I could not read the time right now. Use the Mars24 formula.',
                'Não consegui ler o horário agora. Use a fórmula Mars24.',
              )}
            </p>
          ) : null}
          <McButton className="min-h-11 w-full font-pixel text-xs font-bold" onClick={applyRecommended}>
            {t(`Aim south at ${recommendedTilt}°`, `Ajustar para Sul e ${recommendedTilt}°`)}
          </McButton>

          <p className="font-pixel text-[10px] text-void-300">{t('Martian season', 'Estação marciana')}</p>
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
                {t(s.label.en, s.label.pt)}
              </button>
            ))}
          </div>

          {!asked ? (
            <McButton className="min-h-12 w-full font-pixel font-bold" onClick={() => setAsked(true)}>
              {t('Ask Capi for the calculation', 'Pedir Cálculo à Capi')}
            </McButton>
          ) : (
            <>
              <p className="text-sm text-void-100">{t(MARS24_KID.en, MARS24_KID.pt)}</p>
              <button
                type="button"
                className="min-h-11 shrink-0 border border-cyan-hud/40 px-3 text-left text-xs text-cyan-hud"
                onClick={() => {
                  setFormulaReady(false)
                  setFormulaOpen(true)
                }}
              >
                {t('See the NASA formula (Mars24)', 'Ver fórmula da NASA (Mars24)')}
              </button>

              <McButton
                className="mt-auto min-h-12 w-full shrink-0 font-pixel font-bold"
                disabled={installed}
                onClick={() => {
                  setInstalled(true)
                  onConfirm({ season, azimuth, tilt, efficiency })
                }}
              >
                {installed ? t('Panel is on!', 'Painel ativo!') : t('Confirm installation', 'Confirmar instalação')}
              </McButton>
            </>
          )}
        </ScrollHintArea>
      </div>

      {/* Bottom controls — outside side panel */}
      {asked && !formulaOpen && (
        <div className="z-20 shrink-0 border-t border-cyan-hud/30 bg-[#0a1628]/95 px-3 py-2 sm:px-4">
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="block font-pixel text-xs text-void-200 sm:text-sm">
                {t('Azimuth', 'Azimute')} · {cardinalName(azimuth, t)} ({azimuth}°)
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={azimuth}
                  onChange={(e) => setAzimuth(Number(e.target.value))}
                  className="mt-0.5 h-8 w-full accent-cyan-hud"
                />
              </label>
              <div className="mt-1 grid grid-cols-4 gap-1">
                {AZIMUTH_POINTS.map((point) => {
                  const active =
                    point.azimuth === 180 ? Math.abs(azimuth) >= 170 : azimuth === point.azimuth
                  return (
                    <button
                      key={point.id}
                      type="button"
                      className={`min-h-11 font-pixel text-[10px] ${
                        active ? 'bg-cyan-hud text-void-950' : 'border border-cyan-hud/40 text-void-100'
                      }`}
                      onClick={() => setAzimuth(point.azimuth)}
                    >
                      {t(point.label.en, point.label.pt)}
                    </button>
                  )
                })}
              </div>
            </div>
            <label className="block font-pixel text-xs text-void-200 sm:text-sm">
              {t('Tilt', 'Inclinação')} · {tilt}°
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
        lines={formulaLines}
        title="Capi"
        dialogId="m1-mars24-formula"
        onSkip={() => setFormulaOpen(false)}
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
