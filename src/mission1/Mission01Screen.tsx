import { useCallback, useEffect, useMemo, useState } from 'react'
import { FloatingControls } from '../components/FloatingControls'
import { StatusIndicators } from '../components/StatusIndicators'
import {
  INSTALL_SITES,
  type Mission1Step,
  type SeasonId,
  type SiteId,
} from '../data/mission1Data'
import type { BaseStats } from '../types/game'
import { MarsBackground } from './MarsBackground'
import { IntroHud } from './steps/IntroHud'
import { LocationChallenge } from './steps/LocationChallenge'
import { LogbookModal } from './steps/LogbookModal'
import { SolarCalcChallenge } from './steps/SolarCalcChallenge'
import { StormTestChallenge } from './steps/StormTestChallenge'
import { TransmissionOutro } from './steps/TransmissionOutro'

const DEFAULT_STATS: BaseStats = { energy: 55, lifeSupport: 85, shield: 70 }

function clampStat(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

/** Soft HUD reflection of mission progress (does not mutate world store). */
function deriveMissionStats(
  base: BaseStats,
  step: Mission1Step,
  efficiency: number,
  stormChoice: 'save' | 'max' | null,
): BaseStats {
  let { energy, lifeSupport, shield } = base

  if (step === 'intro' || step === 'step1_location') {
    energy = Math.min(energy, 38)
  } else if (step === 'step2_solar_calc') {
    energy = Math.max(energy, 52)
  } else if (step === 'step3_storm_test') {
    energy = clampStat(efficiency * 0.38)
    shield = clampStat(shield - 8)
  } else if (step === 'step4_logbook' || step === 'step5_transmission') {
    energy = stormChoice === 'save' ? clampStat(Math.max(base.energy, 68)) : clampStat(42)
    lifeSupport = stormChoice === 'save' ? lifeSupport : clampStat(lifeSupport - 6)
    shield = stormChoice === 'max' ? clampStat(shield - 12) : shield
  }

  return { energy: clampStat(energy), lifeSupport: clampStat(lifeSupport), shield: clampStat(shield) }
}

interface Props {
  onComplete: () => void
  onExit: () => void
  /** Called once the mission UI has painted and is ready for the gate to open. */
  onReady?: () => void
  stats?: BaseStats
  muted?: boolean
  onToggleMute?: () => void
  onNasa?: () => void
  onHome?: () => void
}

export default function Mission01Screen({
  onComplete,
  onExit,
  onReady,
  stats = DEFAULT_STATS,
  muted = false,
  onToggleMute,
  onNasa,
  onHome,
}: Props) {
  const [step, setStep] = useState<Mission1Step>('intro')
  const [site, setSite] = useState<SiteId>('B')
  const [season, setSeason] = useState<SeasonId>('summer_n')
  const [tilt, setTilt] = useState(30)
  const [efficiency, setEfficiency] = useState(70)
  const [stormChoice, setStormChoice] = useState<'save' | 'max' | null>(null)
  const [hour] = useState(12)

  const storm = step === 'step3_storm_test'
  const siteLabel = INSTALL_SITES.find((s) => s.id === site)?.name ?? site
  const hudStats = useMemo(
    () => deriveMissionStats(stats, step, efficiency, stormChoice),
    [stats, step, efficiency, stormChoice],
  )

  const finish = useCallback(() => {
    onComplete()
  }, [onComplete])

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

      <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
        <StatusIndicators stats={hudStats} placement="mission" />
        <button
          type="button"
          className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100 shadow-[0_4px_14px_rgba(0,0,0,0.22)] backdrop-blur-[2px] hover:border-cyan-hud/50 hover:text-cyan-hud"
          onClick={onExit}
          aria-label="Sair da missão"
          title="Sair"
        >
          <svg viewBox="0 0 24 24" className="size-7" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" strokeLinejoin="miter">
            {/* Door frame */}
            <path d="M4 3h10v18H4z" />
            <path d="M7 12h1.5" />
            {/* Arrow out */}
            <path d="M15 12h6" />
            <path d="M18 9l3 3-3 3" />
          </svg>
        </button>
      </div>

      {step === 'intro' && <IntroHud onContinue={() => setStep('step1_location')} />}

      {step === 'step1_location' && (
        <LocationChallenge
          onConfirm={(id) => {
            setSite(id)
            setStep('step2_solar_calc')
          }}
        />
      )}

      {step === 'step2_solar_calc' && (
        <SolarCalcChallenge
          site={site}
          onSeasonChange={setSeason}
          onConfirm={(opts) => {
            setSeason(opts.season)
            setTilt(opts.tilt)
            setEfficiency(opts.efficiency)
            setStep('step3_storm_test')
          }}
        />
      )}

      {step === 'step3_storm_test' && (
        <StormTestChallenge
          baseEfficiency={efficiency}
          onDone={(choice) => {
            setStormChoice(choice)
            setStep('step4_logbook')
          }}
        />
      )}

      {step === 'step4_logbook' && (
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

      {step === 'step5_transmission' && <TransmissionOutro onDone={finish} />}

      <FloatingControls
        mapMode
        canSleep={false}
        muted={muted}
        showLabels={false}
        onLabelsDone={() => {}}
        onMove={() => {}}
        onInteract={() => {}}
        onSleep={() => {}}
        onToggleMute={() => onToggleMute?.()}
        onNasa={() => onNasa?.()}
        onHome={() => onHome?.()}
      />
    </div>
  )
}
