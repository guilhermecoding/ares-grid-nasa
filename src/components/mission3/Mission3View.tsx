import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FullscreenButton } from '../FullscreenButton'
import { StatusIndicators } from '../StatusIndicators'
import {
  DRILL_ENERGY_PER_LOG,
  DRILL_LAYERS,
  DRILL_LOG_DEPTHS_M,
  DRILL_TARGET_M,
  IDEAL_SITE,
  PROCESS_STEPS,
  SITES,
  WATER_REWARD_L,
  formatDepth,
  isCrossSectionStep,
  type Mission3Step,
  type PotabilityId,
  type SiteId,
} from '../../data/mission3Data'
import { useI18n } from '../../i18n/locale'
import { DrillingStep } from '../../missions/mission3-ice/DrillingStep'
import { SampleCollectionStep } from '../../missions/mission3-ice/SampleCollectionStep'
import { CapiBeat } from './CapiBeat'
import { clearMissionRun, loadProgress, resumeWaterLiters, saveMissionRun } from '../../services/progressStore'
import { MAX_WATER_RESERVE_L, type BaseStats } from '../../types/game'
import { ArcadiaExplorationBackground } from './ArcadiaExplorationBackground'
import { CapiBridgeM3 } from './CapiBridgeM3'
import { MissionLogbook } from '../logbook/MissionLogbook'
import { MissionOutro } from '../MissionOutro'
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
  const { t } = useI18n()
  const savedRun = useMemo(() => loadProgress().missionRuns.m3, [])
  const drillDepthRef = useRef(savedRun?.drillDepth ?? 0)
  const finishingRef = useRef(false)
  const [step, setStep] = useState<Mission3Step>(() => savedRun?.step ?? 'intro')
  const [phase, setPhase] = useState<'play' | 'logbook' | 'outro'>(() => savedRun?.phase ?? 'play')
  const [energy, setEnergy] = useState(() => clamp(savedRun ? stats.energy : Math.max(stats.energy, 32)))
  const [waterL, setWaterL] = useState(() =>
    savedRun ? resumeWaterLiters(savedRun.waterL, savedRun.waterPct, stats.water) : (clamp(stats.water) / 100) * MAX_WATER_RESERVE_L,
  )
  const [wellbeing] = useState(() => clamp(stats.wellbeing))
  const [site, setSite] = useState<SiteId>(() => savedRun?.site ?? IDEAL_SITE)
  const [drillProgress, setDrillProgress] = useState(() => (savedRun?.drillDepth ?? 0) / DRILL_LAYERS[DRILL_LAYERS.length - 1]!.to)
  const [drillLogged, setDrillLogged] = useState(() => savedRun?.drillLogged ?? 0)
  const [processDone, setProcessDone] = useState(() => savedRun?.processDone ?? 0)
  const [potabilityTreated, setPotabilityTreated] = useState(() => savedRun?.potabilityTreated ?? false)
  const [potabilityAnalyzed, setPotabilityAnalyzed] = useState<PotabilityId[]>(() => savedRun?.potabilityAnalyzed ?? [])
  const [bridgeNext, setBridgeNext] = useState<Mission3Step | null>(null)
  const [energyShort, setEnergyShort] = useState(false)

  const hudStats: BaseStats = useMemo(
    () => ({ energy, water: clamp((waterL / MAX_WATER_RESERVE_L) * 100), wellbeing }),
    [energy, waterL, wellbeing],
  )

  const siteInfo = SITES.find((s) => s.id === site) ?? SITES.find((s) => s.id === IDEAL_SITE)!
  const siteName = t(siteInfo.nameEn, siteInfo.name)

  const bridgeLines = useMemo(() => {
    if (bridgeNext === 'step3_2_layered_map') {
      return [
        t('Protocol understood!', 'Protocolo entendido!'),
        t('Now turn on the map layers and find the best sector.', 'Agora ligue as camadas do mapa e ache o melhor setor.'),
      ]
    }
    if (bridgeNext === 'step3_5_ice_processing') {
      return [
        t('Sample sealed at −73 °C.', 'Amostra selada a −73 °C.'),
        t('In the lab, we will turn ice into water.', 'No laboratório, vamos transformar gelo em água.'),
      ]
    }
    return []
  }, [bridgeNext, t])

  const energyLines = useMemo(
    () => [
      t('The base is low on energy!', 'A energia da base está baixa!'),
      t(
        'Go back to Mission 01 and clean the solar panel to recharge. We will continue from here.',
        'Volte para a Missão 01 e limpe o painel solar para recarregar. A gente continua daqui.',
      ),
    ],
    [t],
  )

  const outroLines = useMemo(
    () => [
      t('Flying back to the spaceship with the sealed sample…', 'Retornando à espaçonave com a amostra selada…'),
      t('MISSION 3 DATA SAVED.', 'DADOS DA MISSÃO 3 ARMAZENADOS.'),
      t(
        `Ice from Arcadia became +${WATER_REWARD_L} L of drinking water!`,
        `Gelo de Arcadia virou +${WATER_REWARD_L} L de água potável!`,
      ),
    ],
    [t],
  )

  const logbookItems = useMemo(() => {
    const depthPt = formatDepth(DRILL_TARGET_M, 'pt')
    const depthEn = formatDepth(DRILL_TARGET_M, 'en')
    return [
      {
        label: 'Radar SHARAD analisado',
        labelPt: 'Radar SHARAD analisado',
        labelEn: 'SHARAD radar checked',
        detail: 'Gelo localizado embaixo do solo',
        detailPt: 'Gelo localizado embaixo do solo',
        detailEn: 'Ice found under the ground',
      },
      {
        label: 'Local de perfuração escolhido',
        labelPt: 'Local de perfuração escolhido',
        labelEn: 'Drill spot chosen',
        detail: `${siteInfo.name}, plano e estável`,
        detailPt: `${siteInfo.name}, plano e estável`,
        detailEn: `${siteInfo.nameEn}, flat and stable`,
      },
      {
        label: 'Perfuração concluída',
        labelPt: 'Perfuração concluída',
        labelEn: 'Drill finished',
        detail: `Amostra a ${depthPt} de profundidade`,
        detailPt: `Amostra a ${depthPt} de profundidade`,
        detailEn: `Sample at ${depthEn} deep`,
      },
      {
        label: 'Gelo transformado em água',
        labelPt: 'Gelo transformado em água',
        labelEn: 'Ice turned into water',
        detail: `+${WATER_REWARD_L} L aprovados para consumo`,
        detailPt: `+${WATER_REWARD_L} L aprovados para consumo`,
        detailEn: `+${WATER_REWARD_L} L approved to drink`,
      },
      {
        label: 'Registro científico no diário',
        labelPt: 'Registro científico no diário',
        labelEn: 'Science note in the logbook',
        detail: 'Evento da Missão 3 documentado',
        detailPt: 'Evento da Missão 3 documentado',
        detailEn: 'Mission 3 event written down',
      },
    ]
  }, [siteInfo.name, siteInfo.nameEn])

  const nextProcessCost = PROCESS_STEPS[processDone]?.energyCost ?? 0
  const energySoftLocked =
    !bridgeNext &&
    phase === 'play' &&
    step !== 'intro' &&
    step !== 'step3_1_methodology' &&
    step !== 'step3_4_sample_collection' &&
    step !== 'step3_logbook_and_ship' &&
    (energy <= 0 ||
      energyShort ||
      (step === 'step3_3_drilling' && drillLogged < DRILL_LOG_DEPTHS_M.length && energy < DRILL_ENERGY_PER_LOG) ||
      (step === 'step3_5_ice_processing' && processDone < PROCESS_STEPS.length && energy < nextProcessCost))

  const reportShort = useCallback(() => setEnergyShort(true), [])

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

  useEffect(() => {
    if (finishingRef.current) return
    const waterPct = clamp((waterL / MAX_WATER_RESERVE_L) * 100)
    saveMissionRun(
      'm3',
      {
        step,
        phase,
        waterL,
        waterPct,
        site,
        drillDepth: drillDepthRef.current,
        drillLogged,
        processDone,
        potabilityTreated,
        potabilityAnalyzed,
      },
      { energy, water: waterPct },
    )
  }, [drillLogged, energy, phase, potabilityAnalyzed, potabilityTreated, processDone, site, step, waterL])

  const finish = () => {
    finishingRef.current = true
    clearMissionRun('m3')
    onComplete(hudStats)
  }

  const leave = () => {
    if (!finishingRef.current) {
      const waterPct = clamp((waterL / MAX_WATER_RESERVE_L) * 100)
      saveMissionRun(
        'm3',
        {
          step,
          phase,
          waterL,
          waterPct,
          site,
          drillDepth: drillDepthRef.current,
          drillLogged,
          processDone,
          potabilityTreated,
          potabilityAnalyzed,
        },
        { energy, water: waterPct },
      )
    }
    onExit(hudStats)
  }

  const bgMode = isCrossSectionStep(step) ? 'cross_section' : 'surface'
  const play = phase === 'play' && !bridgeNext

  return (
    <div className="relative h-full min-h-[100dvh] w-full overflow-hidden bg-[#8a3d22]" style={{ touchAction: 'manipulation' }}>
      <ArcadiaExplorationBackground mode={phase === 'play' ? bgMode : 'surface'} drillProgress={drillProgress} />

      {phase === 'play' && <StatusIndicators stats={hudStats} placement="mission" />}

      <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
        <FullscreenButton className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100 shadow-[0_4px_14px_rgba(0,0,0,0.22)] backdrop-blur-[2px] hover:border-cyan-hud/50 hover:text-cyan-hud" />
        <button
          type="button"
          className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100 shadow-[0_4px_14px_rgba(0,0,0,0.22)] backdrop-blur-[2px] hover:border-cyan-hud/50 hover:text-cyan-hud"
          onClick={leave}
          aria-label={t('Leave the mission', 'Sair da missão')}
          title={t('Leave', 'Sair')}
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
            setBridgeNext('step3_2_layered_map')
          }
        />
      )}

      {play && step === 'step3_2_layered_map' && (
        <LayeredMapStep
          energy={energy}
          waterL={waterL}
          onSpend={spendEnergy}
          onConfirm={(chosen) => {
            drillDepthRef.current = 0
            setDrillLogged(0)
            setSite(chosen)
            setDrillProgress(0)
            setStep('step3_3_drilling')
          }}
        />
      )}

      {play && step === 'step3_3_drilling' && (
        <DrillingStep
          siteName={siteName}
          energy={energy}
          waterL={waterL}
          initialDepth={savedRun?.step === 'step3_3_drilling' ? savedRun.drillDepth : 0}
          initialLogged={savedRun?.step === 'step3_3_drilling' ? savedRun.drillLogged : 0}
          onDepthChange={setDrillProgress}
          onSample={(depth, logged) => {
            drillDepthRef.current = depth
            setDrillLogged(logged)
          }}
          onSpend={spendEnergy}
          onExtract={() => setStep('step3_4_sample_collection')}
        />
      )}

      {play && step === 'step3_4_sample_collection' && (
        <SampleCollectionStep
          siteName={siteName}
          energy={energy}
          waterL={waterL}
          onContinue={() =>
            setBridgeNext('step3_5_ice_processing')
          }
        />
      )}

      {play && step === 'step3_5_ice_processing' && (
        <IceProcessingStep
          energy={energy}
          waterL={waterL}
          initialDone={processDone}
          onSpend={spendEnergy}
          onProgress={setProcessDone}
          onEnergyShort={reportShort}
          onContinue={() => setStep('step3_6_potability_test')}
        />
      )}

      {play && step === 'step3_6_potability_test' && (
        <PotabilityStep
          energy={energy}
          waterL={waterL}
          initialTreated={potabilityTreated}
          initialAnalyzed={potabilityAnalyzed}
          onSpend={spendEnergy}
          onApprove={addWater}
          onProgress={(treated, analyzed) => {
            setPotabilityTreated(treated)
            setPotabilityAnalyzed(analyzed)
          }}
          onEnergyShort={reportShort}
          onContinue={() => {
            setStep('step3_logbook_and_ship')
            setPhase('logbook')
          }}
        />
      )}

      {bridgeNext && (
        <CapiBridgeM3
          key={bridgeNext}
          dialogId={`m3-bridge-${bridgeNext}`}
          lines={bridgeLines}
          onDone={() => {
            const next = bridgeNext
            setBridgeNext(null)
            setStep(next)
          }}
        />
      )}

      {phase === 'logbook' && (
        <MissionLogbook
          missionId={3}
          subtitle={t('Exploration checklist complete', 'Checklist da exploração cumprida')}
          items={logbookItems}
          onDone={() => setPhase('outro')}
        />
      )}

      {phase === 'outro' && <MissionOutro missionId={3} lines={outroLines} stats={hudStats} onDone={finish} />}

      {energySoftLocked && (
        <CapiBeat
          id="m3-energy-low"
          lines={energyLines}
          label={t('Go to Mission 01', 'Ir para a Missão 01')}
          onDone={leave}
        />
      )}
    </div>
  )
}
