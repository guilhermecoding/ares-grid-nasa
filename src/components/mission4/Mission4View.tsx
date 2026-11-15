import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FullscreenButton } from '../FullscreenButton'
import { NightReportModal } from '../mission2/NightReportModal'
import { StatusIndicators } from '../StatusIndicators'
import { CapiBeat } from '../mission3/CapiBeat'
import {
  CULTIVATION_METHODS,
  GREENHOUSE_MODULES,
  type BlssLinkId,
  type CultivationMethodId,
  type GreenhouseModuleId,
  type Mission4Phase,
  type Mission4Step,
  type PlantGroupId,
  type SpeciesId,
} from '../../data/mission4Data'
import { BlssStep } from '../../missions/mission4-greenhouse/BlssStep'
import { BuildStep } from '../../missions/mission4-greenhouse/BuildStep'
import { GrowthStep } from '../../missions/mission4-greenhouse/GrowthStep'
import { MethodStep } from '../../missions/mission4-greenhouse/MethodStep'
import { PlantStep } from '../../missions/mission4-greenhouse/PlantStep'
import type { Mission2Choices, Mission2Scores } from '../../data/mission2Data'
import { clearMissionRun, loadProgress, resumeWaterLiters, saveMissionRun } from '../../services/progressStore'
import { MAX_WATER_RESERVE_L, type BaseStats } from '../../types/game'
import { GreenhouseInteriorBackground } from './GreenhouseInteriorBackground'
import { Mission4Logbook } from './Mission4Logbook'
import { Mission4Stage } from './Mission4Stage'

const DEFAULT_STATS: BaseStats = { energy: 70, water: 55, wellbeing: 72 }
const EMPTY_CHOICES: Mission2Choices = { exercises: [], foods: [], waterRationL: 0.35, hygieneDone: [] }

const ENTER_LINES: Record<Mission4Step, readonly string[]> = {
  intro: [
    'Hoje a base ganha uma estufa.',
    'A gente monta o domo, escolhe o jeito de plantar e cuida das mudas.',
  ],
  step4_1_build_greenhouse: [
    'Cinco módulos encaixam no domo e gastam energia.',
    'O cabo amarelo traz a energia solar. O tubo azul traz a água potável. Nada começa ligado.',
  ],
  step4_2_cultivation_method: [
    'Três jeitos de cultivar. Compare água e energia.',
    'O solo cru de Marte tem percloratos. Ele só entra depois do meu aviso.',
  ],
  step4_3_select_species: [
    'Arraste uma espécie de cada grupo até o berço vazio.',
    'O berço só aceita o grupo certo.',
  ],
  step4_4_growth_monitor: [
    'Luz e temperatura são controles. A água sai do borrifador, em cima das folhas.',
    'Sem névoa ou com a luz errada, a planta mostra estresse.',
  ],
  step4_5_bioregenerative: [
    'Toque nas setas do ciclo.',
    'O gás carbônico vira oxigênio, o vapor vira água limpa e o resto vira nutriente.',
  ],
  step4_logbook_and_sleep: ['Hora de registrar a estufa no diário.'],
}

interface Props {
  onComplete: (result: BaseStats) => void
  onExit: (result: BaseStats) => void
  onReady?: () => void
  stats?: BaseStats
  playerName?: string
}

type Notice =
  | { kind: 'enter'; step: Mission4Step }
  | { kind: 'regolith' }
  | { kind: 'mismatch' }
  | { kind: 'stress'; text: string }
  | { kind: 'water' }

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function plantsRecord(plants: { group: PlantGroupId; species: SpeciesId }[]) {
  return Object.fromEntries(plants.map((p) => [p.group, p.species])) as Partial<Record<PlantGroupId, SpeciesId>>
}

export default function Mission4View({
  onComplete,
  onExit,
  onReady,
  stats = DEFAULT_STATS,
  playerName,
}: Props) {
  const savedRun = useMemo(() => loadProgress().missionRuns.m4, [])
  const finishingRef = useRef(false)
  const [step, setStep] = useState<Mission4Step>(() => savedRun?.step ?? 'intro')
  const [phase, setPhase] = useState<Mission4Phase>(() => savedRun?.phase ?? 'play')
  const [energy, setEnergy] = useState(() => clamp(savedRun ? stats.energy : Math.max(stats.energy, 32)))
  const [waterL, setWaterL] = useState(() =>
    savedRun
      ? resumeWaterLiters(savedRun.waterL, savedRun.waterPct, stats.water)
      : (clamp(stats.water) / 100) * MAX_WATER_RESERVE_L,
  )
  const [wellbeing, setWellbeing] = useState(() => clamp(stats.wellbeing))
  const [installed, setInstalled] = useState<GreenhouseModuleId[]>(() => savedRun?.installed ?? [])
  const [energyLinked, setEnergyLinked] = useState(() => savedRun?.energyLinked ?? false)
  const [waterLinked, setWaterLinked] = useState(() => savedRun?.waterLinked ?? false)
  const [method, setMethod] = useState<CultivationMethodId | null>(() => savedRun?.method ?? null)
  const [plants, setPlants] = useState(() => savedRun?.plants ?? [])
  const [growthStage, setGrowthStage] = useState<0 | 1 | 2>(() => savedRun?.growthStage ?? 0)
  const [misted, setMisted] = useState(() => savedRun?.misted ?? false)
  const [lightOn, setLightOn] = useState(() => savedRun?.lightOn ?? false)
  const [tempOk, setTempOk] = useState(() => savedRun?.tempOk ?? false)
  const [harvested, setHarvested] = useState<SpeciesId[]>(() => savedRun?.harvested ?? [])
  const [blss, setBlss] = useState<BlssLinkId[]>(() => savedRun?.blss ?? [])
  const [foodPct, setFoodPct] = useState(() => savedRun?.foodPct ?? 20)
  const [o2Pct, setO2Pct] = useState(() => savedRun?.o2Pct ?? 20)
  const [notice, setNotice] = useState<Notice | null>(() =>
    (savedRun?.phase ?? 'play') === 'play' ? { kind: 'enter', step: savedRun?.step ?? 'intro' } : null,
  )
  const [energyShort, setEnergyShort] = useState(false)

  const planted = plantsRecord(plants)
  const name = playerName || loadProgress().playerName

  const hudStats: BaseStats = useMemo(
    () => ({ energy, water: clamp((waterL / MAX_WATER_RESERVE_L) * 100), wellbeing }),
    [energy, waterL, wellbeing],
  )

  const nextCost = useMemo(() => {
    if (step === 'step4_1_build_greenhouse') {
      return GREENHOUSE_MODULES.find((mod) => !installed.includes(mod.id))?.energyCost ?? null
    }
    if (step === 'step4_2_cultivation_method' && !method) return 6
    return null
  }, [installed, method, step])

  const energySoftLocked = phase === 'play' && nextCost != null && (energyShort || energy < nextCost)

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

  useEffect(() => {
    if (finishingRef.current) return
    const waterPct = clamp((waterL / MAX_WATER_RESERVE_L) * 100)
    saveMissionRun(
      'm4',
      {
        step,
        phase,
        waterL,
        waterPct,
        installed,
        energyLinked,
        waterLinked,
        method,
        plants,
        growthStage,
        misted,
        lightOn,
        tempOk,
        harvested,
        blss,
        foodPct,
        o2Pct,
      },
      { energy, water: waterPct, wellbeing },
    )
  }, [
    blss,
    energy,
    energyLinked,
    foodPct,
    growthStage,
    harvested,
    installed,
    lightOn,
    method,
    misted,
    o2Pct,
    phase,
    plants,
    step,
    tempOk,
    waterL,
    waterLinked,
    wellbeing,
  ])

  const go = (next: Mission4Step, nextPhase: Mission4Phase = 'play') => {
    setStep(next)
    setPhase(nextPhase)
    setNotice(nextPhase === 'play' ? { kind: 'enter', step: next } : null)
  }

  const applyMethod = (id: CultivationMethodId) => {
    const spec = CULTIVATION_METHODS.find((item) => item.id === id)
    if (!spec) return
    setEnergy((value) => clamp(value - spec.energyCost))
    setWaterL((value) => Math.max(0, Math.round((value - spec.waterL) * 10) / 10))
    setMethod(id)
    setNotice(null)
  }

  const finish = () => {
    finishingRef.current = true
    clearMissionRun('m4')
    onComplete(hudStats)
  }

  const leave = () => {
    if (!finishingRef.current) {
      const waterPct = clamp((waterL / MAX_WATER_RESERVE_L) * 100)
      saveMissionRun(
        'm4',
        {
          step,
          phase,
          waterL,
          waterPct,
          installed,
          energyLinked,
          waterLinked,
          method,
          plants,
          growthStage,
          misted,
          lightOn,
          tempOk,
          harvested,
          blss,
          foodPct,
          o2Pct,
        },
        { energy, water: waterPct, wellbeing },
      )
    }
    onExit(hudStats)
  }

  const reportShort = useCallback(() => setEnergyShort(true), [])
  const onMismatch = useCallback(() => setNotice({ kind: 'mismatch' }), [])
  const onPlant = useCallback((group: PlantGroupId, species: SpeciesId) => {
    setPlants((list) => (list.some((item) => item.group === group) ? list : [...list, { group, species }]))
  }, [])
  const onStress = useCallback((text: string) => setNotice({ kind: 'stress', text }), [])
  const onWaterShort = useCallback(() => setNotice({ kind: 'water' }), [])

  const play = phase === 'play'
  const overlay = energySoftLocked ? (
    <CapiBeat
      id="m4-energy-low"
      lines={[
        'A energia da base está baixa!',
        'Volte para a Missão 01 e limpe o painel solar para recarregar. A gente continua daqui.',
      ]}
      label="Ir para a Missão 01"
      onDone={leave}
    />
  ) : notice?.kind === 'enter' ? (
    <CapiBeat id={`m4-enter-${notice.step}`} lines={ENTER_LINES[notice.step]} onDone={() => setNotice(null)} />
  ) : notice?.kind === 'regolith' ? (
    <CapiBeat
      id="m4-regolith"
      lines={[
        'O regolito cru tem percloratos e não serve para plantar.',
        'Só a versão tratada entra, e ainda assim é um teste.',
      ]}
      label="Usar o solo tratado"
      onDone={() => applyMethod('regolith')}
    />
  ) : notice?.kind === 'mismatch' ? (
    <CapiBeat
      id="m4-mismatch"
      lines={['Esse berço só aceita o grupo certo.', 'Arraste a planta de novo.']}
      onDone={() => setNotice(null)}
    />
  ) : notice?.kind === 'stress' ? (
    <CapiBeat id="m4-stress" lines={[notice.text, 'Ajuste luz, temperatura ou a névoa e tente de novo.']} onDone={() => setNotice(null)} />
  ) : notice?.kind === 'water' ? (
    <CapiBeat
      id="m4-water"
      lines={['A reserva de água não chega para essa ação.', 'Escolha um caminho que gaste menos água.']}
      onDone={() => setNotice(null)}
    />
  ) : null

  const nightScores: Mission2Scores = {
    physicalHealth: wellbeing,
    hydration: hudStats.water,
    sleepScore: 82,
    sleepHours: 8,
    wellbeing,
    contaminationRisk: 8,
    sciencePoints: 80,
    healthPoints: 75,
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-void-950">
      <GreenhouseInteriorBackground leds={installed.includes('led')} mist={misted} growth={growthStage} />
      {play && <StatusIndicators stats={hudStats} placement="mission" />}
      <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
        <FullscreenButton className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100 shadow-[0_4px_14px_rgba(0,0,0,0.22)] backdrop-blur-[2px]" />
        <button
          type="button"
          className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100"
          onClick={leave}
          aria-label="Sair da missão"
          style={{ touchAction: 'manipulation' }}
        >
          <svg viewBox="0 0 24 24" className="size-7" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M4 3h10v18H4z" />
            <path d="M15 12h6" />
            <path d="M18 9l3 3-3 3" />
          </svg>
        </button>
      </div>

      {play && (
        <Mission4Stage
          title={step === 'intro' ? 'A primeira estufa de Marte' : 'Estufa'}
          subtitle="Agricultura espacial"
          energy={energy}
          waterL={waterL}
          foodPct={step === 'step4_5_bioregenerative' ? foodPct : undefined}
          o2Pct={step === 'step4_5_bioregenerative' ? o2Pct : undefined}
          overlay={overlay}
        >
          {step === 'intro' && notice == null ? (
            <button
              type="button"
              className="min-h-12 border-4 border-energy bg-[#0a1628]/90 px-4 font-pixel text-sm text-[#f4fff4]"
              onClick={() => go('step4_1_build_greenhouse')}
            >
              Montar a estufa
            </button>
          ) : null}

          {step === 'step4_1_build_greenhouse' && (
            <BuildStep
              installed={installed}
              energyLinked={energyLinked}
              waterLinked={waterLinked}
              energy={energy}
              onInstall={(id) => {
                const spec = GREENHOUSE_MODULES.find((mod) => mod.id === id)
                if (!spec) return
                setEnergy((value) => clamp(value - spec.energyCost))
                setInstalled((list) => (list.includes(id) ? list : [...list, id]))
              }}
              onLinkEnergy={() => setEnergyLinked(true)}
              onLinkWater={() => setWaterLinked(true)}
              onEnergyShort={reportShort}
              onDone={() => go('step4_2_cultivation_method')}
            />
          )}

          {step === 'step4_2_cultivation_method' && (
            <MethodStep
              method={method}
              energy={energy}
              waterL={waterL}
              onChoose={(id) => {
                if (id === 'regolith') setNotice({ kind: 'regolith' })
                else applyMethod(id)
              }}
              onEnergyShort={reportShort}
              onWaterShort={onWaterShort}
              onDone={() => go('step4_3_select_species')}
            />
          )}

          {step === 'step4_3_select_species' && (
            <PlantStep planted={planted} onPlant={onPlant} onMismatch={onMismatch} onDone={() => go('step4_4_growth_monitor')} />
          )}

          {step === 'step4_4_growth_monitor' && (
            <GrowthStep
              planted={planted}
              stage={growthStage}
              misted={misted}
              lightOn={lightOn}
              tempOk={tempOk}
              harvested={harvested}
              waterL={waterL}
              onToggleLight={() => setLightOn((value) => !value)}
              onToggleTemp={() => setTempOk((value) => !value)}
              onMist={() => {
                setWaterL((value) => Math.max(0, Math.round((value - 2) * 10) / 10))
                setMisted(true)
              }}
              onAdvance={() => {
                setGrowthStage((value) => (value < 2 ? ((value + 1) as 0 | 1 | 2) : value))
                setMisted(false)
              }}
              onHarvest={(id) => setHarvested((list) => (list.includes(id) ? list : [...list, id]))}
              onStress={onStress}
              onWaterShort={onWaterShort}
              onDone={() => go('step4_5_bioregenerative')}
            />
          )}

          {step === 'step4_5_bioregenerative' && (
            <BlssStep
              linked={blss}
              foodPct={foodPct}
              o2Pct={o2Pct}
              onLink={(id) => {
                if (blss.includes(id)) return
                const next = [...blss, id]
                setBlss(next)
                setFoodPct(20 + next.length * 25)
                setO2Pct(20 + next.length * 25)
                if (next.length === 3) setWellbeing((value) => clamp(value + 8))
              }}
              onDone={() => go('step4_logbook_and_sleep', 'logbook')}
            />
          )}
        </Mission4Stage>
      )}

      {phase === 'logbook' && method ? (
        <Mission4Logbook
          method={method}
          species={plants.map((item) => item.species)}
          onDone={() => {
            setPhase('night')
            setStep('step4_logbook_and_sleep')
          }}
        />
      ) : null}

      <NightReportModal
        open={phase === 'night'}
        playerName={name}
        choices={EMPTY_CHOICES}
        scores={nightScores}
        researchNote="Diário da estufa: método de cultivo, espécies plantadas e a foto do domo. Comida e oxigênio subiram no ciclo bioregenerativo."
        doneLabel="Avançar para a Missão 05"
        onDone={finish}
      />
    </div>
  )
}
