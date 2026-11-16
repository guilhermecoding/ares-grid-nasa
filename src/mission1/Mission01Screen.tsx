import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FullscreenButton } from '../components/FullscreenButton'
import { StatusIndicators } from '../components/StatusIndicators'
import {
  EXPOSURE_MS,
  INSTALL_SITES,
  isOutdoorMission1Step,
  PANEL_CLEAN_EFFICIENCY_CAP,
  PANEL_CLEAN_EFFICIENCY_GAIN,
  PANEL_CLEAN_ENERGY_GAIN,
  PANEL_TEST_CLEAN_WATER_COST,
  PANEL_TEST_DUST_ENERGY_FACTOR,
  PANEL_TEST_DUST_WATER_COST,
  TRANSMISSION_LINES,
  type Mission1Step,
  type PanelTestChoice,
  type SeasonId,
  type SiteId,
} from '../data/mission1Data'
import {
  DEFAULT_BASE_STATS,
  clearMissionRun,
  loadProgress,
  saveMissionRun,
  updateProgress,
  type Mission1PanelSave,
} from '../services/progressStore'
import type { BaseStats } from '../types/game'
import { MarsBackground } from './MarsBackground'
import { GameOverOverlay } from './steps/GameOverOverlay'
import { IntroHud } from './steps/IntroHud'
import { LocationChallenge } from './steps/LocationChallenge'
import { MissionLogbook } from '../components/logbook/MissionLogbook'
import { MissionOutro } from '../components/MissionOutro'
import { PanelCleanSuccessDialog } from './steps/PanelCleanSuccessDialog'
import { ReplayIntroHud } from './steps/ReplayIntroHud'
import { RiskWarningHud } from './steps/RiskWarningHud'
import { PanelConditionDialog } from './steps/PanelConditionDialog'
import { SolarCalcChallenge } from './steps/SolarCalcChallenge'

const DEFAULT_STATS: BaseStats = { energy: 0, water: 85, wellbeing: 70 }

function clampStat(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

/**
 * HUD for Mission 01: external energy starts at 0 and only rises after the panel
 * is installed, according to site/tilt/season efficiency and the panel test.
 */
function deriveMissionStats(
  base: BaseStats,
  step: Mission1Step,
  efficiency: number,
  panelInstalled: boolean,
  panelTest: PanelTestChoice | null,
  wellbeingLive: number,
): BaseStats {
  let water = base.water
  let energy = 0

  if (panelInstalled && step === 'step3_panel_test') {
    energy = clampStat(efficiency)
  } else if (panelInstalled && (step === 'step4_logbook' || step === 'step5_transmission')) {
    if (panelTest === 'clean') {
      energy = clampStat(efficiency)
      water = clampStat(water - PANEL_TEST_CLEAN_WATER_COST)
    } else if (panelTest === 'dust') {
      energy = clampStat(efficiency * PANEL_TEST_DUST_ENERGY_FACTOR)
      water = clampStat(water - PANEL_TEST_DUST_WATER_COST)
    } else {
      energy = clampStat(efficiency)
    }
  } else if (panelInstalled) {
    energy = clampStat(efficiency)
  }

  return {
    energy: clampStat(energy),
    water: clampStat(water),
    wellbeing: clampStat(wellbeingLive),
  }
}

interface Props {
  /** Final HUD meters after a successful run (energy from the installed panel). */
  onComplete: (result: BaseStats) => void
  /** Leave without finishing — still pass current meters so progress is not rolled back. */
  onExit: (result: BaseStats) => void
  /** Called once the mission UI has painted and is ready for the gate to open. */
  onReady?: () => void
  stats?: BaseStats
}

function persistPanel(config: Mission1PanelSave) {
  updateProgress({ mission1Panel: config })
}

export default function Mission01Screen({
  onComplete,
  onExit,
  onReady,
  stats = DEFAULT_STATS,
}: Props) {
  const savedPanel = useMemo(() => loadProgress().mission1Panel, [])
  const savedRun = useMemo(() => loadProgress().missionRuns.m1, [])
  const hasSavedPanel = !!savedPanel
  const resumedLate =
    savedRun?.step === 'step3_panel_test' || savedRun?.step === 'step4_logbook' || savedRun?.step === 'step5_transmission'

  const [step, setStep] = useState<Mission1Step>(() => savedRun?.step ?? (hasSavedPanel ? 'replay_intro' : 'intro'))
  const [site, setSite] = useState<SiteId>(() => savedRun?.site ?? savedPanel?.site ?? 'B')
  const [season, setSeason] = useState<SeasonId>(() => savedRun?.season ?? savedPanel?.season ?? 'summer_n')
  const [tilt, setTilt] = useState(() => savedRun?.tilt ?? savedPanel?.tilt ?? 30)
  const [azimuth, setAzimuth] = useState(() => savedRun?.azimuth ?? savedPanel?.azimuth ?? 0)
  const [efficiency, setEfficiency] = useState(() => savedRun?.efficiency ?? savedPanel?.efficiency ?? 0)
  const [panelInstalled, setPanelInstalled] = useState(() => hasSavedPanel || resumedLate)
  const [panelTest, setPanelTest] = useState<PanelTestChoice | null>(
    () => savedRun?.panelTest ?? savedPanel?.panelTest ?? (hasSavedPanel ? 'clean' : null),
  )
  const [firstInstalledAt, setFirstInstalledAt] = useState(
    () => savedPanel?.firstInstalledAt ?? Date.now(),
  )
  const [lastCleanedAt, setLastCleanedAt] = useState<number | null>(
    () => savedPanel?.lastCleanedAt ?? null,
  )
  const [cleanSuccessOpen, setCleanSuccessOpen] = useState(false)
  const [hour] = useState(12)

  const buildPanelSave = useCallback(
    (overrides: Partial<Mission1PanelSave> = {}): Mission1PanelSave => ({
      site,
      season,
      tilt,
      azimuth,
      efficiency,
      panelTest,
      firstInstalledAt,
      lastCleanedAt,
      ...overrides,
    }),
    [azimuth, efficiency, firstInstalledAt, lastCleanedAt, panelTest, season, site, tilt],
  )

  const wellbeingStart = useRef(Math.max(1, stats.wellbeing))
  const outdoorElapsedMs = useRef(0)
  const lastTickAt = useRef<number | null>(null)
  const [wellbeingLive, setWellbeingLive] = useState(() => Math.max(1, stats.wellbeing))
  const [gameOver, setGameOver] = useState(false)
  const gameOverLatched = useRef(false)

  const outdoor = isOutdoorMission1Step(step)
  /** The panel-test dialog sits in the center — park indicators next to exit. */
  const indicatorsBesideExit = step === 'step3_panel_test'
  const siteLabel = INSTALL_SITES.find((s) => s.id === site)?.name ?? site

  const hudStats = useMemo(
    () => deriveMissionStats(stats, step, efficiency, panelInstalled, panelTest, wellbeingLive),
    [stats, step, efficiency, panelInstalled, panelTest, wellbeingLive],
  )

  const handleGameOverExit = useCallback(() => {
    const progress = loadProgress()
    const missionCleared = progress.level >= 2
    clearMissionRun('m1')
    if (!missionCleared) {
      const reset = { ...DEFAULT_BASE_STATS }
      updateProgress({ mission1Panel: null, baseStats: reset })
      onExit(reset)
      return
    }
    onExit({ ...hudStats, wellbeing: DEFAULT_BASE_STATS.wellbeing })
  }, [hudStats, onExit])

  const finish = useCallback(() => {
    if (panelInstalled && efficiency > 0) {
      persistPanel(buildPanelSave())
    }
    clearMissionRun('m1')
    onComplete(hudStats)
  }, [buildPanelSave, efficiency, hudStats, onComplete, panelInstalled])

  const handleCleanPanel = useCallback(() => {
    const now = Date.now()
    const nextEfficiency = Math.min(PANEL_CLEAN_EFFICIENCY_CAP, efficiency + PANEL_CLEAN_EFFICIENCY_GAIN)
    setEfficiency(nextEfficiency)
    setLastCleanedAt(now)

    const progress = loadProgress()
    const nextEnergy = clampStat(progress.baseStats.energy + PANEL_CLEAN_ENERGY_GAIN)
    updateProgress({
      mission1Panel: buildPanelSave({
        efficiency: nextEfficiency,
        lastCleanedAt: now,
      }),
      baseStats: {
        ...progress.baseStats,
        energy: nextEnergy,
      },
    })
    setCleanSuccessOpen(true)
  }, [buildPanelSave, efficiency])

  useEffect(() => {
    if (step === 'replay_intro' || step === 'replay_idle') return
    saveMissionRun('m1', { step, site, season, tilt, azimuth, efficiency, panelTest })
  }, [azimuth, efficiency, panelTest, season, site, step, tilt])

  const beginExposure = useCallback(() => {
    outdoorElapsedMs.current = 0
    lastTickAt.current = null
    wellbeingStart.current = Math.max(1, stats.wellbeing)
    setWellbeingLive(wellbeingStart.current)
    gameOverLatched.current = false
    setGameOver(false)
    setStep('step1_location')
  }, [stats.wellbeing])

  // Drain wellbeing while outdoors; freeze indoors (logbook / transmission).
  useEffect(() => {
    if (gameOver) return
    if (!outdoor) {
      lastTickAt.current = null
      return
    }

    const id = window.setInterval(() => {
      const now = performance.now()
      if (lastTickAt.current != null) {
        outdoorElapsedMs.current += now - lastTickAt.current
      }
      lastTickAt.current = now

      const ratio = Math.min(1, outdoorElapsedMs.current / EXPOSURE_MS)
      const next = wellbeingStart.current * (1 - ratio)
      const clamped = Math.max(0, next)
      setWellbeingLive(clamped)

      if (clamped <= 0 && !gameOverLatched.current) {
        gameOverLatched.current = true
        setGameOver(true)
      }
    }, 250)

    return () => window.clearInterval(id)
  }, [outdoor, gameOver])

  useEffect(() => {
    let cancelled = false
    const kick = () => {
      if (cancelled) return
      onReady?.()
    }
    // Wait for layout + lazy chunk paint before opening the gate.
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(kick)
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(id)
    }
  }, [onReady])

  return (
    <div className="relative h-full min-h-[100dvh] w-full overflow-hidden bg-void-950" style={{ touchAction: 'manipulation' }}>
      <MarsBackground
        hour={hour}
        season={season}
        storm={false}
        dustIntensity={0.35}
      />

      {!indicatorsBesideExit && !gameOver && step !== 'step5_transmission' && (
        <StatusIndicators stats={hudStats} placement="mission" />
      )}

      <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
        {indicatorsBesideExit && !gameOver && (
          <StatusIndicators stats={hudStats} placement="inline" />
        )}
        <FullscreenButton className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100 shadow-[0_4px_14px_rgba(0,0,0,0.22)] backdrop-blur-[2px] hover:border-cyan-hud/50 hover:text-cyan-hud" />
        <button
          type="button"
          className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100 shadow-[0_4px_14px_rgba(0,0,0,0.22)] backdrop-blur-[2px] hover:border-cyan-hud/50 hover:text-cyan-hud"
          onClick={() => onExit(hudStats)}
          aria-label="Sair da missão"
          title="Sair"
        >
          <svg viewBox="0 0 24 24" className="size-7" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M4 3h10v18H4z" />
            <path d="M7 12h1.5" />
            <path d="M15 12h6" />
            <path d="M18 9l3 3-3 3" />
          </svg>
        </button>
      </div>

      {!gameOver && step === 'intro' && (
        <IntroHud onContinue={() => setStep('risk_warning')} />
      )}

      {!gameOver && (step === 'replay_intro' || step === 'replay_idle') && (
        <ReplayIntroHud
          tilt={tilt}
          azimuth={azimuth}
          efficiency={efficiency}
          firstInstalledAt={firstInstalledAt}
          lastCleanedAt={lastCleanedAt}
          idle={step === 'replay_idle'}
          onContinue={() => setStep('replay_idle')}
          onCleanPanel={handleCleanPanel}
        />
      )}

      <PanelCleanSuccessDialog
        open={cleanSuccessOpen}
        tilt={tilt}
        azimuth={azimuth}
        efficiency={efficiency}
        onClose={() => setCleanSuccessOpen(false)}
      />

      {!gameOver && step === 'risk_warning' && <RiskWarningHud onContinue={beginExposure} />}

      {!gameOver && step === 'step1_location' && (
        <LocationChallenge
          onConfirm={(id) => {
            setSite(id)
            setStep('step2_solar_calc')
          }}
        />
      )}

      {!gameOver && step === 'step2_solar_calc' && (
        <SolarCalcChallenge
          site={site}
          onSeasonChange={setSeason}
          onConfirm={(opts) => {
            const installedAt = Date.now()
            setSeason(opts.season)
            setTilt(opts.tilt)
            setAzimuth(opts.azimuth)
            setEfficiency(opts.efficiency)
            setPanelInstalled(true)
            setFirstInstalledAt(installedAt)
            persistPanel(
              buildPanelSave({
                season: opts.season,
                tilt: opts.tilt,
                azimuth: opts.azimuth,
                efficiency: opts.efficiency,
                firstInstalledAt: installedAt,
                lastCleanedAt: null,
              }),
            )
            setStep('step3_panel_test')
          }}
        />
      )}

      {!gameOver && step === 'step3_panel_test' && (
        <PanelConditionDialog
          baseEfficiency={efficiency}
          onDone={(choice) => {
            setPanelTest(choice)
            if (choice === 'clean') {
              const nextEfficiency = Math.min(
                PANEL_CLEAN_EFFICIENCY_CAP,
                efficiency + PANEL_CLEAN_EFFICIENCY_GAIN,
              )
              setEfficiency(nextEfficiency)
              persistPanel(buildPanelSave({ panelTest: choice, efficiency: nextEfficiency }))
            } else {
              persistPanel(buildPanelSave({ panelTest: choice }))
            }
            setStep('step4_logbook')
          }}
        />
      )}

      {!gameOver && step === 'step4_logbook' && (
        <>
          <MarsBackground hour={hour} season={season} storm={false} dustIntensity={0.25} />
          <MissionLogbook
            missionId={1}
            subtitle="Checklist da missão cumprida"
            items={[
              { label: 'Local de instalação escolhido', detail: siteLabel },
              { label: 'Painéis solares ajustados', detail: `Inclinação ${tilt}°` },
              {
                label: 'Condição do painel testada',
                detail:
                  panelTest === 'dust' ? 'Poeira cobriu as células e a eficiência caiu' : 'Limpeza removeu a poeira',
              },
              { label: 'Energia externa ativada', detail: 'Base pronta para explorar' },
              { label: 'Registro científico no diário', detail: 'Evento da Missão 1 documentado' },
            ]}
            onDone={() => setStep('step5_transmission')}
          />
        </>
      )}

      {!gameOver && step === 'step5_transmission' && (
        <MissionOutro missionId={1} lines={TRANSMISSION_LINES} stats={hudStats} onDone={finish} />
      )}

      {gameOver && <GameOverOverlay onExit={handleGameOverExit} />}
    </div>
  )
}
