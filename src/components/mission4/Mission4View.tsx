import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlaskConical, Recycle, Sprout, Wrench } from 'lucide-react'
import { FullscreenButton } from '../FullscreenButton'
import { NightReportModal } from '../mission2/NightReportModal'
import { StatusIndicators } from '../StatusIndicators'
import { CapiBeat } from '../mission3/CapiBeat'
import { MissionIntroCard } from '../missionKit/MissionIntroCard'
import { Tag } from '../missionKit/kit'
import { MEDIA } from '../../constants/mediaAssets'
import {
  CULTIVATION_METHODS,
  GREENHOUSE_MODULES,
  speciesLabel,
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
import { useI18n } from '../../i18n/locale'
import { clearMissionRun, loadProgress, resumeWaterLiters, saveMissionRun } from '../../services/progressStore'
import { MAX_WATER_RESERVE_L, type BaseStats } from '../../types/game'
import { GreenhouseInteriorBackground } from './GreenhouseInteriorBackground'
import { MissionLogbook } from '../logbook/MissionLogbook'
import { MissionOutro } from '../MissionOutro'
import { Mission4Stage } from './Mission4Stage'

const DEFAULT_STATS: BaseStats = { energy: 70, water: 55, wellbeing: 72 }
const EMPTY_CHOICES: Mission2Choices = { exercises: [], foods: [], waterRationL: 0.35, hygieneDone: [] }

interface Props {
  onComplete: (result: BaseStats) => void
  onExit: (result: BaseStats) => void
  onReady?: () => void
  stats?: BaseStats
  playerName?: string
}

type StressFault = 'light' | 'temp' | 'mist'

type Notice =
  | { kind: 'enter'; step: Mission4Step }
  | { kind: 'regolith' }
  | { kind: 'mismatch' }
  | { kind: 'stress'; fault: StressFault }
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
  const { t } = useI18n()
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
  const onStress = useCallback((fault: StressFault) => setNotice({ kind: 'stress', fault }), [])
  const onWaterShort = useCallback(() => setNotice({ kind: 'water' }), [])

  const introGoals = useMemo(
    () => [
      { icon: <Wrench className="size-4" aria-hidden />, label: t('4.1 Build the dome', '4.1 Montar o domo') },
      { icon: <FlaskConical className="size-4" aria-hidden />, label: t('4.2 Choose how to grow', '4.2 Escolher o cultivo') },
      { icon: <Sprout className="size-4" aria-hidden />, label: t('4.3 Plant the species', '4.3 Plantar as espécies') },
      { icon: <Sprout className="size-4" aria-hidden />, label: t('4.4 Care and harvest', '4.4 Cuidar e colher') },
      { icon: <Recycle className="size-4" aria-hidden />, label: t('4.5 Close the cycle', '4.5 Fechar o ciclo') },
    ],
    [t],
  )

  const enterLines = useMemo<Record<Mission4Step, readonly string[]>>(
    () => ({
      intro: [
        t('Today the base gets a greenhouse.', 'Hoje a base ganha uma estufa.'),
        t('We build the dome, pick how to grow, and take care of the seedlings.', 'A gente monta o domo, escolhe o jeito de plantar e cuida das mudas.'),
      ],
      step4_1_build_greenhouse: [
        t('Five modules snap onto the dome and use energy.', 'Cinco módulos encaixam no domo e gastam energia.'),
        t(
          'The yellow cable brings solar energy. The blue tube brings drinking water. Nothing starts out connected.',
          'O cabo amarelo traz a energia solar. O tubo azul traz a água potável. Nada começa ligado.',
        ),
      ],
      step4_2_cultivation_method: [
        t('Three ways to grow. Compare water and energy.', 'Três jeitos de cultivar. Compare água e energia.'),
        t(
          'Raw Martian soil has perchlorates. It only comes in after my warning.',
          'O solo cru de Marte tem percloratos. Ele só entra depois do meu aviso.',
        ),
      ],
      step4_3_select_species: [
        t('Drag one species from each group into the empty bed.', 'Arraste uma espécie de cada grupo até o berço vazio.'),
        t('The bed only accepts the right group.', 'O berço só aceita o grupo certo.'),
      ],
      step4_4_growth_monitor: [
        t(
          'Light and temperature are controls. The water comes from the sprayer, above the leaves.',
          'Luz e temperatura são controles. A água sai do borrifador, em cima das folhas.',
        ),
        t(
          'With no mist, or with the wrong light, the plant shows stress.',
          'Sem névoa ou com a luz errada, a planta mostra estresse.',
        ),
      ],
      step4_5_bioregenerative: [
        t('Tap the arrows in the cycle.', 'Toque nas setas do ciclo.'),
        t(
          'Carbon dioxide becomes oxygen, vapor becomes clean water, and the leftovers become nutrients.',
          'O gás carbônico vira oxigênio, o vapor vira água limpa e o resto vira nutriente.',
        ),
      ],
      step4_logbook_and_sleep: [t('Time to write the greenhouse into the logbook.', 'Hora de registrar a estufa no diário.')],
    }),
    [t],
  )

  const lowEnergyLines = useMemo(
    () => [
      t('The base is low on energy!', 'A energia da base está baixa!'),
      t(
        'Go back to Mission 01 and clean the solar panel to recharge. We will pick up right here.',
        'Volte para a Missão 01 e limpe o painel solar para recarregar. A gente continua daqui.',
      ),
    ],
    [t],
  )

  const regolithLines = useMemo(
    () => [
      t('Raw regolith has perchlorates, so you cannot plant in it.', 'O regolito cru tem percloratos e não serve para plantar.'),
      t('Only the treated soil can go in, and even then it is a test.', 'Só a versão tratada entra, e ainda assim é um teste.'),
    ],
    [t],
  )

  const mismatchLines = useMemo(
    () => [t('This bed only takes the right group.', 'Esse berço só aceita o grupo certo.'), t('Drag the plant again.', 'Arraste a planta de novo.')],
    [t],
  )

  const stressFault = notice?.kind === 'stress' ? notice.fault : null
  const stressLines = useMemo(() => {
    const first =
      stressFault === 'light'
        ? t('The light is wrong. The leaves need the LED on.', 'A luz está errada. As folhas pedem o LED ligado.')
        : stressFault === 'temp'
          ? t('The temperature left the mild range. Adjust the control.', 'A temperatura saiu do intervalo ameno. Ajuste o controle.')
          : t('Without mist, the leaves wilt. Move the sprayer over them.', 'Sem névoa, as folhas murcham. Passe o borrifador sobre elas.')
    return [first, t('Adjust the light, the temperature, or the mist, and try again.', 'Ajuste luz, temperatura ou a névoa e tente de novo.')]
  }, [stressFault, t])

  const waterLines = useMemo(
    () => [
      t('The water reserve is not enough for this action.', 'A reserva de água não chega para essa ação.'),
      t('Pick a path that uses less water.', 'Escolha um caminho que gaste menos água.'),
    ],
    [t],
  )

  const outroLines = useMemo(
    () => [
      t('MISSION 4 DATA STORED.', 'DADOS DA MISSÃO 4 ARMAZENADOS.'),
      t('SENDING THE GREENHOUSE REPORT TO EARTH…', 'ENVIANDO O RELATÓRIO DA ESTUFA PARA A TERRA…'),
      t('First harvest on Mars recorded!', 'Primeira colheita de Marte registrada!'),
    ],
    [t],
  )

  const play = phase === 'play'
  const overlay = energySoftLocked ? (
    <CapiBeat
      id="m4-energy-low"
      lines={lowEnergyLines}
      label={t('Go to Mission 01', 'Ir para a Missão 01')}
      onDone={leave}
    />
  ) : notice?.kind === 'enter' ? (
    <CapiBeat id={`m4-enter-${notice.step}`} lines={enterLines[notice.step]} onDone={() => setNotice(null)} />
  ) : notice?.kind === 'regolith' ? (
    <CapiBeat
      id="m4-regolith"
      lines={regolithLines}
      label={t('Use the treated soil', 'Usar o solo tratado')}
      onDone={() => applyMethod('regolith')}
    />
  ) : notice?.kind === 'mismatch' ? (
    <CapiBeat id="m4-mismatch" lines={mismatchLines} onDone={() => setNotice(null)} />
  ) : notice?.kind === 'stress' ? (
    <CapiBeat id="m4-stress" lines={stressLines} onDone={() => setNotice(null)} />
  ) : notice?.kind === 'water' ? (
    <CapiBeat id="m4-water" lines={waterLines} onDone={() => setNotice(null)} />
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
      <GreenhouseInteriorBackground lit={installed.includes('led')} />
      {play && <StatusIndicators stats={hudStats} placement="mission" />}
      <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
        <FullscreenButton className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100 shadow-[0_4px_14px_rgba(0,0,0,0.22)] backdrop-blur-[2px]" />
        <button
          type="button"
          className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100"
          onClick={leave}
          aria-label={t('Leave the mission', 'Sair da missão')}
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
          step={step}
          waterL={waterL}
          foodPct={step === 'step4_5_bioregenerative' ? foodPct : undefined}
          o2Pct={step === 'step4_5_bioregenerative' ? o2Pct : undefined}
          overlay={overlay}
        >
          {step === 'intro' && notice == null ? (
            <MissionIntroCard
              scene={
                <div className="absolute inset-0 bg-[radial-gradient(70%_80%_at_55%_55%,#5a2416,#2a0f0c_75%)]">
                  <div className="absolute inset-x-0 bottom-0 h-[22%] border-t-4 border-[#9a3a19] bg-[#45190f]" />
                  <img
                    src={MEDIA.mission4.astronaut}
                    alt=""
                    className="gk-pixelated gk-bob absolute bottom-[6%] left-[8%] h-[30%]"
                    draggable={false}
                  />
                  <img
                    src={MEDIA.mission4.dome}
                    alt={t('Geodesic dome greenhouse', 'Estufa em domo geodésico')}
                    className="gk-pixelated absolute right-[6%] bottom-[4%] h-[86%] drop-shadow-[0_0_14px_rgba(125,255,224,0.45)]"
                    draggable={false}
                  />
                  <Tag className="absolute top-2 left-2">{t('Greenhouse plan', 'Projeto da estufa')}</Tag>
                </div>
              }
              badge="Sol 04 · Arcadia Planitia"
              title={t('The first greenhouse on Mars', 'A primeira estufa de Marte')}
              lead={t(
                'Build the dome, hook up energy and water, plant four kinds of plants, and close the cycle that gives the base food and oxygen.',
                'Monte o domo, ligue energia e água, plante quatro espécies e feche o ciclo que dá comida e oxigênio para a base.',
              )}
              goals={introGoals}
              cta={t('Build the greenhouse', 'Montar a estufa')}
              onStart={() => go('step4_1_build_greenhouse')}
            />
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
              onSetTemp={setTempOk}
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
        <MissionLogbook
          missionId={4}
          subtitle={t('Greenhouse checklist complete', 'Checklist da estufa cumprida')}
          items={[
            {
              label: 'Estufa montada e ligada',
              labelEn: 'Greenhouse built and powered',
              labelPt: 'Estufa montada e ligada',
              detail: 'Energia e água conectadas ao domo',
              detailEn: 'Energy and water connected to the dome',
              detailPt: 'Energia e água conectadas ao domo',
            },
            {
              label: 'Método de cultivo escolhido',
              labelEn: 'Growing method chosen',
              labelPt: 'Método de cultivo escolhido',
              detail: CULTIVATION_METHODS.find((item) => item.id === method)?.title ?? method,
              detailEn: CULTIVATION_METHODS.find((item) => item.id === method)?.titleEn ?? method,
              detailPt: CULTIVATION_METHODS.find((item) => item.id === method)?.title ?? method,
            },
            {
              label: 'Mudas plantadas e cuidadas',
              labelEn: 'Seedlings planted and cared for',
              labelPt: 'Mudas plantadas e cuidadas',
              detail: [...new Set(plants.map((item) => speciesLabel(item.species, 'pt')))].join(' · '),
              detailEn: [...new Set(plants.map((item) => speciesLabel(item.species, 'en')))].join(' · '),
              detailPt: [...new Set(plants.map((item) => speciesLabel(item.species, 'pt')))].join(' · '),
            },
            {
              label: 'Primeira colheita de Marte',
              labelEn: 'First harvest on Mars',
              labelPt: 'Primeira colheita de Marte',
              detail: 'Comida e oxigênio no ciclo bioregenerativo',
              detailEn: 'Food and oxygen in the bioregenerative cycle',
              detailPt: 'Comida e oxigênio no ciclo bioregenerativo',
            },
            {
              label: 'Registro científico no diário',
              labelEn: 'Science note in the logbook',
              labelPt: 'Registro científico no diário',
              detail: 'Evento da Missão 4 documentado',
              detailEn: 'Mission 4 event written down',
              detailPt: 'Evento da Missão 4 documentado',
            },
          ]}
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
        researchNote={t(
          'Greenhouse log: the growing method, the plants you chose, and a photo of the dome. Food and oxygen went up in the bioregenerative cycle.',
          'Diário da estufa: método de cultivo, espécies plantadas e a foto do domo. Comida e oxigênio subiram no ciclo bioregenerativo.',
        )}
        doneLabel={t('Send the mission data', 'Enviar os dados da missão')}
        onDone={() => setPhase('outro')}
      />

      {phase === 'outro' ? (
        <MissionOutro missionId={4} lines={outroLines} stats={hudStats} onDone={finish} />
      ) : null}
    </div>
  )
}
