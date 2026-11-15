import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StatusIndicators } from '../components/StatusIndicators'
import {
  EXPOSURE_MS,
  INSTALL_SITES,
  isOutdoorMission1Step,
  type Mission1Step,
  type SeasonId,
  type SiteId,
} from '../data/mission1Data'
import type { BaseStats } from '../types/game'
import { MarsBackground } from './MarsBackground'
import { GameOverOverlay } from './steps/GameOverOverlay'
import { IntroHud } from './steps/IntroHud'
import { LocationChallenge } from './steps/LocationChallenge'
import { LogbookModal } from './steps/LogbookModal'
import { RiskWarningHud } from './steps/RiskWarningHud'
import { SolarCalcChallenge } from './steps/SolarCalcChallenge'
import { StormTestChallenge } from './steps/StormTestChallenge'
import { TransmissionOutro } from './steps/TransmissionOutro'

const DEFAULT_STATS: BaseStats = { energy: 0, water: 85, wellbeing: 70 }

function clampStat(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

/**
 * HUD for Mission 01: external energy starts at 0 and only rises after the panel
 * is installed, according to site/tilt/season efficiency and storm choice.
 */
function deriveMissionStats(
  base: BaseStats,
  step: Mission1Step,
  efficiency: number,
  panelInstalled: boolean,
  stormChoice: 'save' | 'max' | null,
  wellbeingLive: number,
): BaseStats {
  let water = base.water
  let energy = 0

  if (!panelInstalled) {
    energy = 0
  } else if (step === 'step3_storm_test') {
    // Panel just online — energy mirrors installation efficiency.
    energy = clampStat(efficiency)
    water = clampStat(water - 3)
  } else if (step === 'step4_logbook' || step === 'step5_transmission') {
    if (stormChoice === 'save') {
      energy = clampStat(efficiency * 0.92)
    } else if (stormChoice === 'max') {
      energy = clampStat(efficiency * 0.55)
      water = clampStat(water - 6)
    } else {
      energy = clampStat(efficiency)
    }
  } else {
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

export default function Mission01Screen({
  onComplete,
  onExit,
  onReady,
  stats = DEFAULT_STATS,
}: Props) {
  const [step, setStep] = useState<Mission1Step>('intro')
  const [site, setSite] = useState<SiteId>('B')
  const [season, setSeason] = useState<SeasonId>('summer_n')
  const [tilt, setTilt] = useState(30)
  const [efficiency, setEfficiency] = useState(0)
  const [panelInstalled, setPanelInstalled] = useState(false)
  const [stormChoice, setStormChoice] = useState<'save' | 'max' | null>(null)
  const [hour] = useState(12)

  const wellbeingStart = useRef(Math.max(1, stats.wellbeing))
  const outdoorElapsedMs = useRef(0)
  const lastTickAt = useRef<number | null>(null)
  const [wellbeingLive, setWellbeingLive] = useState(() => Math.max(1, stats.wellbeing))
  const [gameOver, setGameOver] = useState(false)
  const gameOverLatched = useRef(false)

  const storm = step === 'step3_storm_test'
  const outdoor = isOutdoorMission1Step(step)
  /** Results meters sit under top-left HUD — park indicators next to exit only then. */
  const indicatorsBesideExit = step === 'step3_storm_test'
  const siteLabel = INSTALL_SITES.find((s) => s.id === site)?.name ?? site

  const hudStats = useMemo(
    () => deriveMissionStats(stats, step, efficiency, panelInstalled, stormChoice, wellbeingLive),
    [stats, step, efficiency, panelInstalled, stormChoice, wellbeingLive],
  )

  const finish = useCallback(() => {
    onComplete(hudStats)
  }, [onComplete, hudStats])

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
        storm={storm}
        dustIntensity={storm ? 0.85 : 0.35}
      />

      {!indicatorsBesideExit && !gameOver && step !== 'step5_transmission' && (
        <StatusIndicators stats={hudStats} placement="mission" />
      )}

      <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
        {indicatorsBesideExit && !gameOver && (
          <StatusIndicators stats={hudStats} placement="inline" />
        )}
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
            setSeason(opts.season)
            setTilt(opts.tilt)
            setEfficiency(opts.efficiency)
            setPanelInstalled(true)
            setStep('step3_storm_test')
          }}
        />
      )}

      {!gameOver && step === 'step3_storm_test' && (
        <StormTestChallenge
          baseEfficiency={efficiency}
          onDone={(choice) => {
            setStormChoice(choice)
            setStep('step4_logbook')
          }}
        />
      )}

      {!gameOver && step === 'step4_logbook' && (
        <>
          <MarsBackground hour={hour} season={season} storm={false} dustIntensity={0.25} />
          <LogbookModal
            siteLabel={siteLabel}
            tilt={tilt}
            stormChoice={stormChoice}
            onDone={() => setStep('step5_transmission')}
          />
        </>
      )}

      {!gameOver && step === 'step5_transmission' && (
        <TransmissionOutro stats={hudStats} onDone={finish} />
      )}

      {gameOver && <GameOverOverlay onExit={() => onExit(hudStats)} />}
    </div>
  )
}
