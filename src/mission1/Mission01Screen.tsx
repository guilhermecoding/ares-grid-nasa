import { useCallback, useEffect, useState } from 'react'
import {
  INSTALL_SITES,
  type Mission1Step,
  type SeasonId,
  type SiteId,
} from '../data/mission1Data'
import { MarsBackground } from './MarsBackground'
import { IntroHud } from './steps/IntroHud'
import { LocationChallenge } from './steps/LocationChallenge'
import { LogbookModal } from './steps/LogbookModal'
import { SolarCalcChallenge } from './steps/SolarCalcChallenge'
import { StormTestChallenge } from './steps/StormTestChallenge'
import { TransmissionOutro } from './steps/TransmissionOutro'

interface Props {
  onComplete: () => void
  onExit: () => void
  /** Called once the mission UI has painted and is ready for the gate to open. */
  onReady?: () => void
}

export default function Mission01Screen({ onComplete, onExit, onReady }: Props) {
  const [step, setStep] = useState<Mission1Step>('intro')
  const [site, setSite] = useState<SiteId>('B')
  const [season, setSeason] = useState<SeasonId>('summer_n')
  const [tilt, setTilt] = useState(30)
  const [efficiency, setEfficiency] = useState(70)
  const [stormChoice, setStormChoice] = useState<'save' | 'max' | null>(null)
  const [hour] = useState(12)

  const storm = step === 'step3_storm_test'
  const siteLabel = INSTALL_SITES.find((s) => s.id === site)?.name ?? site

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

      <button
        type="button"
        className="absolute top-3 right-3 z-50 min-h-12 rounded border border-void-400/50 bg-void-900/80 px-3 font-pixel text-xs text-void-200"
        onClick={onExit}
      >
        Sair
      </button>

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
    </div>
  )
}
