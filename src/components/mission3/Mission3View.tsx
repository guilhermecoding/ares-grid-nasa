import { useCallback, useEffect, useMemo, useState } from 'react'
import { FullscreenButton } from '../FullscreenButton'
import { StatusIndicators } from '../StatusIndicators'
import {
  DRILL_TARGET_M,
  IDEAL_SITE,
  SITES,
  formatDepth,
  isCrossSectionStep,
  type Mission3Step,
  type SiteId,
} from '../../data/mission3Data'
import { DrillingStep } from '../../missions/mission3-ice/DrillingStep'
import { SampleCollectionStep } from '../../missions/mission3-ice/SampleCollectionStep'
import { MAX_WATER_RESERVE_L, type BaseStats } from '../../types/game'
import { EnergyDepletedOverlay } from '../mission2/EnergyDepletedOverlay'
import { ArcadiaExplorationBackground } from './ArcadiaExplorationBackground'
import { CapiBridgeM3 } from './CapiBridgeM3'
import { Mission3Logbook } from './Mission3Logbook'
import { Mission3Outro } from './Mission3Outro'
import { IceProcessingStep } from './steps/IceProcessingStep'
import { IntroStep } from './steps/IntroStep'
import { LayeredMapStep } from './steps/LayeredMapStep'
import { MethodologyStep } from './steps/MethodologyStep'
import { PotabilityStep } from './steps/PotabilityStep'

const DEFAULT_STATS: BaseStats = { energy: 70, water: 55, wellbeing: 72 }

interface Props {
  onComplete: (result: BaseStats) => void
  onExit: (result: BaseStats) => void
  onReady?: () => void
  stats?: BaseStats
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

/** Mission 03 orchestrator — Arcadia ice exploration. */
export default function Mission3View({ onComplete, onExit, onReady, stats = DEFAULT_STATS }: Props) {
  const [step, setStep] = useState<Mission3Step>('intro')
  const [phase, setPhase] = useState<'play' | 'logbook' | 'outro'>('play')
  const [energy, setEnergy] = useState(() => clamp(Math.max(stats.energy, 32)))
  const [waterL, setWaterL] = useState(() => (clamp(stats.water) / 100) * MAX_WATER_RESERVE_L)
  const [wellbeing] = useState(() => clamp(stats.wellbeing))
  const [site, setSite] = useState<SiteId>(IDEAL_SITE)
  const [drillProgress, setDrillProgress] = useState(0)
  const [bridge, setBridge] = useState<{ lines: string[]; next: Mission3Step } | null>(null)

  const hudStats: BaseStats = useMemo(
    () => ({ energy, water: clamp((waterL / MAX_WATER_RESERVE_L) * 100), wellbeing }),
    [energy, waterL, wellbeing],
  )

  const siteInfo = SITES.find((s) => s.id === site) ?? SITES.find((s) => s.id === IDEAL_SITE)!

  const energySoftLocked =
    !bridge && energy <= 0 && step !== 'intro' && step !== 'step3_logbook_and_ship' && step !== 'step3_1_methodology'

  useEffect(() => {
    let cancelled = false
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!cancelled) onReady?.()
      })
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(id)
    }
  }, [onReady])

  const spendEnergy = useCallback((n: number) => {
    setEnergy((e) => clamp(e - Math.max(0, n)))
  }, [])

  const addWater = useCallback((liters: number) => {
    setWaterL((w) => w + Math.max(0, liters))
  }, [])

  const bgMode = isCrossSectionStep(step) ? 'cross_section' : 'surface'
  const play = phase === 'play' && !bridge

  return (
    <div className="relative h-full min-h-[100dvh] w-full overflow-hidden bg-[#8a3d22]" style={{ touchAction: 'manipulation' }}>
      <ArcadiaExplorationBackground mode={phase === 'play' ? bgMode : 'surface'} drillProgress={drillProgress} />

      {phase === 'play' && <StatusIndicators stats={hudStats} placement="mission" />}

      <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
        <FullscreenButton className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100 shadow-[0_4px_14px_rgba(0,0,0,0.22)] backdrop-blur-[2px] hover:border-cyan-hud/50 hover:text-cyan-hud" />
        <button
          type="button"
          className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100 shadow-[0_4px_14px_rgba(0,0,0,0.22)] backdrop-blur-[2px] hover:border-cyan-hud/50 hover:text-cyan-hud"
          onClick={() => onExit(hudStats)}
          aria-label="Sair da missão"
          title="Sair"
          style={{ touchAction: 'manipulation' }}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-7"
            aria-hidden
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="square"
            strokeLinejoin="miter"
          >
            <path d="M4 3h10v18H4z" />
            <path d="M7 12h1.5" />
            <path d="M15 12h6" />
            <path d="M18 9l3 3-3 3" />
          </svg>
        </button>
      </div>

      {play && step === 'intro' && (
        <IntroStep energy={energy} waterL={waterL} onContinue={() => setStep('step3_1_methodology')} />
      )}

      {play && step === 'step3_1_methodology' && (
        <MethodologyStep
          energy={energy}
          waterL={waterL}
          onContinue={() =>
            setBridge({
              lines: ['Protocolo entendido!', 'Agora ligue as camadas do mapa e ache o melhor setor.'],
              next: 'step3_2_layered_map',
            })
          }
        />
      )}

      {play && step === 'step3_2_layered_map' && (
        <LayeredMapStep
          energy={energy}
          waterL={waterL}
          onSpend={spendEnergy}
          onConfirm={(chosen) => {
            setSite(chosen)
            setDrillProgress(0)
            setStep('step3_3_drilling')
          }}
        />
      )}

      {play && step === 'step3_3_drilling' && (
        <DrillingStep
          siteName={siteInfo.name}
          energy={energy}
          waterL={waterL}
          onDepthChange={setDrillProgress}
          onSpend={spendEnergy}
          onExtract={() => setStep('step3_4_sample_collection')}
        />
      )}

      {play && step === 'step3_4_sample_collection' && (
        <SampleCollectionStep
          siteName={siteInfo.name}
          energy={energy}
          waterL={waterL}
          onContinue={() =>
            setBridge({
              lines: ['Amostra selada a −73 °C.', 'No laboratório, vamos transformar gelo em água.'],
              next: 'step3_5_ice_processing',
            })
          }
        />
      )}

      {play && step === 'step3_5_ice_processing' && (
        <IceProcessingStep
          energy={energy}
          waterL={waterL}
          onSpend={spendEnergy}
          onContinue={() => setStep('step3_6_potability_test')}
        />
      )}

      {play && step === 'step3_6_potability_test' && (
        <PotabilityStep
          energy={energy}
          waterL={waterL}
          onSpend={spendEnergy}
          onApprove={addWater}
          onContinue={() => {
            setStep('step3_logbook_and_ship')
            setPhase('logbook')
          }}
        />
      )}

      {bridge && (
        <CapiBridgeM3
          key={bridge.next}
          dialogId={`m3-bridge-${bridge.next}`}
          lines={bridge.lines}
          onDone={() => {
            const next = bridge.next
            setBridge(null)
            setStep(next)
          }}
        />
      )}

      {phase === 'logbook' && (
        <Mission3Logbook
          siteName={siteInfo.name}
          depthLabel={formatDepth(DRILL_TARGET_M)}
          onDone={() => setPhase('outro')}
        />
      )}

      {phase === 'outro' && <Mission3Outro stats={hudStats} waterL={waterL} onDone={() => onComplete(hudStats)} />}

      {energySoftLocked && <EnergyDepletedOverlay onExit={() => onExit(hudStats)} />}
    </div>
  )
}
