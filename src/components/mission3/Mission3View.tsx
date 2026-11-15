import { useCallback, useEffect, useMemo, useState } from 'react'
import { FullscreenButton } from '../FullscreenButton'
import { StatusIndicators } from '../StatusIndicators'
import {
  DRILL_DEPTHS_M,
  IDEAL_SITE,
  SITES,
  isCrossSectionStep,
  type Mission3Step,
  type SiteId,
} from '../../data/mission3Data'
import type { BaseStats } from '../../types/game'
import { EnergyDepletedOverlay } from '../mission2/EnergyDepletedOverlay'
import { ArcadiaExplorationBackground } from './ArcadiaExplorationBackground'
import { CapiBridgeM3 } from './CapiBridgeM3'
import { Mission3Logbook } from './Mission3Logbook'
import { Mission3Outro } from './Mission3Outro'
import { DrillingStep } from './steps/DrillingStep'
import { IceProcessingStep } from './steps/IceProcessingStep'
import { IntroStep } from './steps/IntroStep'
import { LayeredMapStep } from './steps/LayeredMapStep'
import { MethodologyStep } from './steps/MethodologyStep'
import { PotabilityStep } from './steps/PotabilityStep'
import { SampleCollectionStep } from './steps/SampleCollectionStep'

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
export default function Mission3View({
  onComplete,
  onExit,
  onReady,
  stats = DEFAULT_STATS,
}: Props) {
  const [step, setStep] = useState<Mission3Step>('intro')
  const [phase, setPhase] = useState<'play' | 'logbook' | 'outro'>('play')
  const [energy, setEnergy] = useState(() => clamp(Math.max(stats.energy, 32)))
  const [water, setWater] = useState(() => clamp(stats.water))
  const [wellbeing] = useState(() => clamp(stats.wellbeing))
  const [site, setSite] = useState<SiteId>(IDEAL_SITE)
  const [drillProgress, setDrillProgress] = useState(0)
  const [waterRewarded, setWaterRewarded] = useState(false)
  const [bridge, setBridge] = useState<{ lines: string[]; next: Mission3Step } | null>(null)

  const hudStats: BaseStats = useMemo(
    () => ({ energy, water, wellbeing }),
    [energy, water, wellbeing],
  )

  const siteInfo = SITES.find((s) => s.id === site) ?? SITES.find((s) => s.id === IDEAL_SITE)!
  const depthsLabel = DRILL_DEPTHS_M.map((d) => `${d} m`).join(', ')

  const energySoftLocked =
    !bridge &&
    energy <= 0 &&
    step !== 'intro' &&
    step !== 'step3_logbook_and_ship' &&
    step !== 'step3_1_methodology'

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

  const addWater = useCallback((n: number) => {
    setWater((w) => clamp(w + Math.max(0, n)))
    setWaterRewarded(true)
  }, [])

  const bgMode = isCrossSectionStep(step) ? 'cross_section' : 'surface'

  return (
    <div
      className="relative h-full min-h-[100dvh] w-full overflow-hidden bg-[#8a3d22]"
      style={{ touchAction: 'manipulation' }}
    >
      <ArcadiaExplorationBackground
        mode={phase === 'play' ? bgMode : 'surface'}
        drillProgress={drillProgress}
      />

      {phase === 'play' && (
        <>
          <StatusIndicators stats={hudStats} placement="mission" />
          <div className="pointer-events-none absolute top-14 left-3 z-30 max-w-[min(100%,14rem)] sm:left-4">
            <div className="rounded border border-cyan-hud/35 bg-[#0a1628]/75 px-2 py-1 font-pixel text-[9px] text-cyan-hud sm:text-[10px]">
              Sol 03 · Arcadia Planitia
            </div>
          </div>
        </>
      )}

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

      {phase === 'play' && step === 'intro' && (
        <IntroStep onContinue={() => setStep('step3_1_methodology')} />
      )}

      {phase === 'play' && step === 'step3_1_methodology' && !bridge && (
        <MethodologyStep
          onContinue={() =>
            setBridge({
              lines: ['Protocolo entendido!', 'Agora abra as camadas do mapa e ache o melhor setor.'],
              next: 'step3_2_layered_map',
            })
          }
        />
      )}

      {phase === 'play' && step === 'step3_2_layered_map' && !bridge && (
        <LayeredMapStep
          energyPct={energy}
          onConfirm={(chosen, tax) => {
            if (tax > 0) spendEnergy(tax)
            setSite(chosen)
            setBridge({
              lines: [
                'Setor Beta confirmado — planície estável!',
                'Hora das perfurações exploratórias.',
              ],
              next: 'step3_3_drilling',
            })
          }}
        />
      )}

      {phase === 'play' && step === 'step3_3_drilling' && !bridge && (
        <DrillingStep
          energyPct={energy}
          onDepthChange={setDrillProgress}
          onSpend={spendEnergy}
          onContinue={() =>
            setBridge({
              lines: ['Gelo no subsolo confirmado!', 'Separe a amostra com cuidado.'],
              next: 'step3_4_sample_collection',
            })
          }
        />
      )}

      {phase === 'play' && step === 'step3_4_sample_collection' && !bridge && (
        <SampleCollectionStep
          siteLabel={siteInfo.name}
          depthsLabel={depthsLabel}
          onContinue={() =>
            setBridge({
              lines: ['Amostra segura no recipiente térmico.', 'Vamos processar o gelo no laboratório.'],
              next: 'step3_5_ice_processing',
            })
          }
        />
      )}

      {phase === 'play' && step === 'step3_5_ice_processing' && !bridge && (
        <IceProcessingStep
          energyPct={energy}
          onSpend={spendEnergy}
          onContinue={() => setStep('step3_6_potability_test')}
        />
      )}

      {phase === 'play' && step === 'step3_6_potability_test' && !bridge && (
        <PotabilityStep
          energyPct={energy}
          onSpend={spendEnergy}
          onAddWater={addWater}
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
          waterGained={waterRewarded}
          onDone={() => setPhase('outro')}
        />
      )}

      {phase === 'outro' && (
        <Mission3Outro stats={hudStats} onDone={() => onComplete(hudStats)} />
      )}

      {energySoftLocked && <EnergyDepletedOverlay onExit={() => onExit(hudStats)} />}
    </div>
  )
}
