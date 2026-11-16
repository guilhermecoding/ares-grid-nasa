import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Brush, Lock, Radiation, ScanSearch } from 'lucide-react'
import { FullscreenButton } from '../FullscreenButton'
import { NightReportModal } from '../mission2/NightReportModal'
import { CapiBeat } from '../mission3/CapiBeat'
import { MissionIntroCard } from '../missionKit/MissionIntroCard'
import { Tag } from '../missionKit/kit'
import { MEDIA } from '../../constants/mediaAssets'
import { SciTerm } from '../SciTerm'
import type { Mission2Choices, Mission2Scores } from '../../data/mission2Data'
import {
  CURATED_DONKI_ALERT,
  SCI_TERMS_M5,
  type DustLatchId,
  type InspectId,
  type Mission5Phase,
  type Mission5Step,
  type ShelterId,
} from '../../data/mission5Data'
import { useI18n } from '../../i18n/locale'
import { DustProtocolStep } from '../../missions/mission5-storms/DustProtocolStep'
import { InspectionStep } from '../../missions/mission5-storms/InspectionStep'
import { PanelScrubStep } from '../../missions/mission5-storms/PanelScrubStep'
import { RadiationRun } from '../../missions/mission5-storms/RadiationRun'
import { ShieldMonitor } from '../../missions/mission5-storms/ShieldMonitor'
import { clearMissionRun, loadProgress, resumeWaterLiters, saveMissionRun } from '../../services/progressStore'
import { MAX_WATER_RESERVE_L, type BaseStats } from '../../types/game'
import { EarthTransmission } from './EarthTransmission'
import { NasaSources } from './NasaSources'
import { MarsStormBackground, type StormScene } from './MarsStormBackground'
import { MissionLogbook } from '../logbook/MissionLogbook'
import { MissionOutro } from '../MissionOutro'
import { Mission5Stage } from './Mission5Stage'

const DEFAULT_STATS: BaseStats = { energy: 70, water: 55, wellbeing: 72 }
const EMPTY_CHOICES: Mission2Choices = { exercises: [], foods: [], waterRationL: 0.35, hygieneDone: [] }

const INTRO_GOALS = [
  { icon: <Lock className="size-4" aria-hidden />, en: '5.1 Seal the habitat', pt: '5.1 Vedar o habitat' },
  { icon: <Brush className="size-4" aria-hidden />, en: '5.2 Clean the panels', pt: '5.2 Limpar os painéis' },
  { icon: <Radiation className="size-4" aria-hidden />, en: '5.3 Run to the shelter', pt: '5.3 Correr para o abrigo' },
  { icon: <ScanSearch className="size-4" aria-hidden />, en: '5.4 Inspect the base', pt: '5.4 Inspecionar a base' },
] as const

const LOG_ITEMS = [
  {
    label: 'Base selada contra a poeira',
    labelPt: 'Base selada contra a poeira',
    labelEn: 'Base sealed against the dust',
    detail: 'Travas fechadas antes da tempestade',
    detailPt: 'Travas fechadas antes da tempestade',
    detailEn: 'Latches closed before the storm',
  },
  {
    label: 'Painéis limpos com vento seguro',
    labelPt: 'Painéis limpos com vento seguro',
    labelEn: 'Panels cleaned while the wind was safe',
    detail: 'Geração de volta a 480 W',
    detailPt: 'Geração de volta a 480 W',
    detailEn: 'Power back to 480 W',
  },
  {
    label: 'Abrigo alcançado no alerta solar',
    labelPt: 'Abrigo alcançado no alerta solar',
    labelEn: 'Shelter reached during the solar alert',
    detail: 'Blindagem de água e regolito conferida',
    detailPt: 'Blindagem de água e regolito conferida',
    detailEn: 'Water and regolith shielding checked',
  },
  {
    label: 'Base inspecionada depois da tempestade',
    labelPt: 'Base inspecionada depois da tempestade',
    labelEn: 'Base inspected after the storm',
    detail: 'Painéis, antena, habitat e estufa em ordem',
    detailPt: 'Painéis, antena, habitat e estufa em ordem',
    detailEn: 'Panels, antenna, habitat, and greenhouse are in order',
  },
  {
    label: 'Registro científico no diário',
    labelPt: 'Registro científico no diário',
    labelEn: 'Science note in the logbook',
    detail: 'Evento da Missão 5 documentado',
    detailPt: 'Evento da Missão 5 documentado',
    detailEn: 'Mission 5 event written down',
  },
] as const

interface Props {
  onComplete: (result: BaseStats) => void
  onExit: (result: BaseStats) => void
  onReady?: () => void
  stats?: BaseStats
  playerName?: string
  spaceWeatherLabel?: string
}

type Notice = { kind: 'enter'; step: Mission5Step } | { kind: 'wind' } | { kind: 'shelter'; text: string }

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function sceneFor(step: Mission5Step, phase: Mission5Phase): StormScene {
  if (phase === 'ending' && step === 'scene7_ending') return 'future'
  if (step === 'step5_3_solar_radiation') return 'shelter'
  if (step === 'step5_4_post_storm_inspection' || step === 'scene6_earth_transmission' || phase === 'logbook' || phase === 'night') {
    return 'clear'
  }
  return 'dust'
}

export default function Mission5View({
  onComplete,
  onExit,
  onReady,
  stats = DEFAULT_STATS,
  playerName,
  spaceWeatherLabel,
}: Props) {
  const { t, locale } = useI18n()
  const savedRun = useMemo(() => loadProgress().missionRuns.m5, [])
  const finishingRef = useRef(false)
  const [step, setStep] = useState<Mission5Step>(() => savedRun?.step ?? 'intro')
  const [phase, setPhase] = useState<Mission5Phase>(() => savedRun?.phase ?? 'play')
  const [energy] = useState(() => clamp(savedRun ? stats.energy : Math.max(stats.energy, 32)))
  const [waterL] = useState(() =>
    savedRun
      ? resumeWaterLiters(savedRun.waterL, savedRun.waterPct, stats.water)
      : (clamp(stats.water) / 100) * MAX_WATER_RESERVE_L,
  )
  const [wellbeing] = useState(() => clamp(stats.wellbeing))
  const [sealed, setSealed] = useState<DustLatchId[]>(() => savedRun?.sealed ?? [])
  const [windSafe, setWindSafe] = useState(() => savedRun?.windSafe ?? false)
  const [panelsClean, setPanelsClean] = useState(() => savedRun?.panelsClean ?? false)
  const [shelter, setShelter] = useState<ShelterId | null>(() => savedRun?.shelter ?? null)
  const [shielded, setShielded] = useState(() => savedRun?.shielded ?? false)
  const [inspected, setInspected] = useState<InspectId[]>(() => savedRun?.inspected ?? [])
  const [radiation, setRadiation] = useState(() => savedRun?.radiation ?? 0.4)
  const [integrity, setIntegrity] = useState(() => savedRun?.integrity ?? 70)
  const [notice, setNotice] = useState<Notice | null>(() =>
    (savedRun?.phase ?? 'play') === 'play' ? { kind: 'enter', step: savedRun?.step ?? 'intro' } : null,
  )
  const [runKey, setRunKey] = useState(0)
  const [monitorOk, setMonitorOk] = useState(() => savedRun?.shielded ?? false)
  const name = playerName || loadProgress().playerName
  const alertLabel = useMemo(() => {
    if (!spaceWeatherLabel) return CURATED_DONKI_ALERT[locale]
    const live = /^Erupção solar classe (.+)$/.exec(spaceWeatherLabel)
    if (live) return t(`Class ${live[1]} solar flare`, spaceWeatherLabel)
    return spaceWeatherLabel
  }, [locale, spaceWeatherLabel, t])
  const dustTerm = t('Dust storm', 'Tempestade de poeira')
  const solarTerm = t('Solar storm', 'Tempestade solar')
  const sciTerms = useMemo(
    () => ({
      [dustTerm]: SCI_TERMS_M5['Tempestade de poeira'][locale],
      [solarTerm]: SCI_TERMS_M5['Tempestade solar'][locale],
    }),
    [dustTerm, locale, solarTerm],
  )
  const introGoals = useMemo(
    () => INTRO_GOALS.map((goal) => ({ icon: goal.icon, label: t(goal.en, goal.pt) })),
    [t],
  )

  const hudStats: BaseStats = useMemo(
    () => ({ energy, water: clamp((waterL / MAX_WATER_RESERVE_L) * 100), wellbeing }),
    [energy, waterL, wellbeing],
  )
  const generation = panelsClean || step === 'intro' ? 100 : 25
  const energySoftLocked = phase === 'play' && energy <= 0
  const energyLines = useMemo(
    () => [
      t('The base is low on power!', 'A energia da base está baixa!'),
      t(
        'Go back to Mission 01 and clean the solar panel to recharge. We will continue from here.',
        'Volte para a Missão 01 e limpe o painel solar para recarregar. A gente continua daqui.',
      ),
    ],
    [t],
  )
  const enterLines = useMemo<Record<Mission5Step, readonly string[]>>(
    () => ({
      intro: [
        t('Dust and solar radiation are different dangers.', 'Poeira e radiação solar são perigos diferentes.'),
        t(
          'You can see the dust: it blocks the light and dirties the machines. Radiation from a solar flare is invisible and needs a different shelter.',
          'A poeira a gente vê: ela corta a luz e suja as máquinas. A radiação de uma erupção solar é invisível e pede outro abrigo.',
        ),
      ],
      step5_1_dust_storm: [
        t('Regional dust alert. Drag each latch until it seals.', 'Alerta regional de poeira. Arraste cada trava até vedar.'),
        t(
          'Solar power drops by 75%. The Mission 01 battery keeps the habitat going.',
          'A geração solar cai 75%. A bateria da Missão 01 segura o habitat.',
        ),
      ],
      step5_2_clean_panels: [
        t('Check the wind sensor first. Cleaning too early does not open the panel.', 'Primeiro o sensor de vento. Limpar cedo não abre o painel.'),
        t(
          'When the wind is safe, scrub the dust until the power is back to 480 W.',
          'Com o vento seguro, esfregue a poeira até a geração voltar aos 480 W.',
        ),
      ],
      step5_3_solar_radiation: [
        t('This siren is a different one. This is not dust.', 'Agora a sirene é outra. Isso não é poeira.'),
        t(
          'Run to the shelter with water and regolith. Glass and the regular module cannot stop the particles.',
          'Corra até o abrigo com água e regolito. Vidro e o módulo comum não seguram as partículas.',
        ),
        alertLabel,
      ],
      step5_4_post_storm_inspection: [
        t('The sky is clear. Tap the four spots on the base.', 'O céu limpou. Toque nos quatro pontos da base.'),
        t(
          'Panels, seal, greenhouse, and antenna. Each one raises the integrity.',
          'Painéis, vedação, estufa e antena. Cada um sobe a integridade.',
        ),
      ],
      step5_logbook_and_sleep: [t('Write the alert in the log before you sleep.', 'Registre o alerta antes de dormir.')],
      scene6_earth_transmission: [
        t('The report from the five missions is ready for Earth.', 'O relatório das cinco missões está pronto para a Terra.'),
      ],
      scene7_ending: [t('The expedition ends with the base ready.', 'A expedição fecha com a base pronta.')],
    }),
    [alertLabel, t],
  )
  const windLines = useMemo(
    () => [
      t('The wind is still carrying dust.', 'O vento ainda carrega poeira.'),
      t('Wait until the sensor says it is safe before you scrub.', 'Espere o sensor ficar seguro antes de esfregar.'),
    ],
    [t],
  )
  const shelterLines = useMemo(() => {
    if (notice?.kind !== 'shelter') return []
    const reason =
      notice.text === 'door'
        ? t(
            'That door does not stop the radiation. The glass greenhouse and the regular module are not enough.',
            'Essa porta não segura a radiação. A estufa de vidro e o módulo comum não bastam.',
          )
        : t(
            'The radiation dose hit the limit. Run to the right shelter again.',
            'A dose de radiação chegou ao limite. Corra de novo até o abrigo certo.',
          )
    return [reason, t('This try starts again at the shelter door.', 'A tentativa recomeça na porta do abrigo.')]
  }, [notice, t])
  const outroLines = useMemo(
    () => [
      t('REPORT RECEIVED BY MISSION CONTROL ON EARTH.', 'RELATÓRIO RECEBIDO PELA CENTRAL NA TERRA.'),
      t('Base protected. Mars Adventures complete!', 'Base protegida. Mars Adventures completa!'),
    ],
    [t],
  )

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
      'm5',
      {
        step,
        phase,
        waterL,
        waterPct,
        sealed,
        windSafe,
        panelsClean,
        shelter,
        shielded,
        inspected,
        radiation,
        integrity,
      },
      { energy, water: waterPct, wellbeing },
    )
  }, [
    energy,
    inspected,
    integrity,
    panelsClean,
    phase,
    radiation,
    sealed,
    shelter,
    shielded,
    step,
    waterL,
    wellbeing,
    windSafe,
  ])

  useEffect(() => {
    if (!shielded || radiation <= 1.2) return
    const id = window.setInterval(() => {
      setRadiation((value) => Math.max(0.4, Math.round((value - 0.4) * 10) / 10))
    }, 400)
    return () => window.clearInterval(id)
  }, [radiation, shielded])

  const go = (next: Mission5Step, nextPhase: Mission5Phase = 'play') => {
    setStep(next)
    setPhase(nextPhase)
    setNotice(nextPhase === 'play' ? { kind: 'enter', step: next } : null)
  }

  const finish = () => {
    finishingRef.current = true
    clearMissionRun('m5')
    onComplete(hudStats)
  }

  const leave = () => {
    if (!finishingRef.current) {
      const waterPct = clamp((waterL / MAX_WATER_RESERVE_L) * 100)
      saveMissionRun(
        'm5',
        {
          step,
          phase,
          waterL,
          waterPct,
          sealed,
          windSafe,
          panelsClean,
          shelter,
          shielded,
          inspected,
          radiation,
          integrity,
        },
        { energy, water: waterPct, wellbeing },
      )
    }
    onExit(hudStats)
  }

  const onEarly = useCallback(() => setNotice({ kind: 'wind' }), [])
  const onRunFail = useCallback((text: string) => setNotice({ kind: 'shelter', text }), [])
  const onRunSafe = useCallback(() => {
    setShelter('shield')
    setShielded(true)
    setRadiation(6.4)
  }, [])

  const play = phase === 'play'
  const overlay = energySoftLocked ? (
    <CapiBeat
      id="m5-energy-low"
      lines={energyLines}
      label={t('Go to Mission 01', 'Ir para a Missão 01')}
      onDone={leave}
    />
  ) : notice?.kind === 'enter' ? (
    <CapiBeat id={`m5-enter-${notice.step}`} lines={enterLines[notice.step]} onDone={() => setNotice(null)} />
  ) : notice?.kind === 'wind' ? (
    <CapiBeat id="m5-wind" lines={windLines} onDone={() => setNotice(null)} />
  ) : notice?.kind === 'shelter' ? (
    <CapiBeat
      id={`m5-shelter-${runKey}`}
      lines={shelterLines}
      onDone={() => {
        setRunKey((value) => value + 1)
        setNotice(null)
      }}
    />
  ) : null

  const nightScores: Mission2Scores = {
    physicalHealth: wellbeing,
    hydration: hudStats.water,
    sleepScore: 84,
    sleepHours: 8,
    wellbeing,
    contaminationRisk: 6,
    sciencePoints: 90,
    healthPoints: 80,
  }
  const peakRadiation = Math.max(radiation, 6.4).toFixed(1)

  return (
    <div className="absolute inset-0 overflow-hidden bg-void-950">
      <MarsStormBackground mode={sceneFor(step, phase)} />
      <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
        <FullscreenButton className="flex size-12 shrink-0 items-center justify-center rounded border border-cyan-hud/25 bg-[#0a1628]/35 text-void-100" />
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
        <Mission5Stage
          step={step}
          subtitle={
            <span>
              <SciTerm term={dustTerm} terms={sciTerms} />
              {t(' and ', ' e ')}
              <SciTerm term={solarTerm} terms={sciTerms} />
              {t(' are not the same thing.', ' não são a mesma coisa.')}
            </span>
          }
          energy={energy}
          radiation={radiation}
          integrity={integrity}
          generationPct={generation}
          overlay={overlay}
        >
          {step === 'intro' && notice == null ? (
            <MissionIntroCard
              scene={
                <div className="absolute inset-0">
                  <img
                    src={MEDIA.mission5.storm}
                    alt={t('Mars base with a wall of dust arriving', 'Base em Marte com uma parede de poeira chegando')}
                    className="gk-pixelated absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                  />
                  <div className="gk-dust absolute inset-0" aria-hidden />
                  <Tag tone="danger" className="absolute top-2 left-2">
                    <span className="gk-blink">●</span> {t('Environmental alert', 'Alerta ambiental')}
                  </Tag>
                </div>
              }
              badge={t('Sol 05 · Environmental alert', 'Sol 05 · Alerta ambiental')}
              title={t('Two storms, two dangers', 'Duas tempestades, dois perigos')}
              lead={t(
                'Dust blocks the light and dirties the panels. Solar radiation is invisible and needs a shelter with water and regolith. Protect the base from both.',
                'A poeira corta a luz e suja os painéis. A radiação solar é invisível e pede um abrigo com água e regolito. Proteja a base nas duas.',
              )}
              goals={introGoals}
              cta={t('Open the protocol', 'Abrir o protocolo')}
              onStart={() => go('step5_1_dust_storm')}
            />
          ) : null}
          {step === 'step5_1_dust_storm' && (
            <DustProtocolStep
              sealed={sealed}
              onSeal={(id) => setSealed((list) => (list.includes(id) ? list : [...list, id]))}
              onHeld={() => go('step5_2_clean_panels')}
            />
          )}
          {step === 'step5_2_clean_panels' && (
            <PanelScrubStep
              paused={overlay != null}
              windSafe={windSafe}
              panelsClean={panelsClean}
              onWindSafe={() => setWindSafe(true)}
              onEarly={onEarly}
              onClean={() => setPanelsClean(true)}
              onDone={() => {
                setRadiation(2.4)
                go('step5_3_solar_radiation')
              }}
            />
          )}
          {step === 'step5_3_solar_radiation' && !shielded && (
            <RadiationRun key={runKey} paused={overlay != null} onFail={onRunFail} onSafe={onRunSafe} />
          )}
          {step === 'step5_3_solar_radiation' && shielded && (
            <ShieldMonitor
              radiation={radiation}
              checked={monitorOk}
              onCheck={() => setMonitorOk(true)}
              onLeave={() => go('step5_4_post_storm_inspection')}
            />
          )}
          {step === 'step5_4_post_storm_inspection' && (
            <InspectionStep
              inspected={inspected}
              integrity={integrity}
              onInspect={(id) => {
                setInspected((list) => (list.includes(id) ? list : [...list, id]))
                setIntegrity((value) => Math.min(100, value + 7.5))
              }}
              onDone={() => go('step5_logbook_and_sleep', 'logbook')}
            />
          )}
        </Mission5Stage>
      )}

      {phase === 'logbook' ? (
        <MissionLogbook
          missionId={5}
          subtitle={t('Alert checklist complete', 'Checklist do alerta cumprido')}
          items={LOG_ITEMS}
          onDone={() => setPhase('night')}
        />
      ) : null}

      <NightReportModal
        open={phase === 'night'}
        playerName={name}
        choices={EMPTY_CHOICES}
        scores={nightScores}
        researchNote={t(
          'Alert log: a regional dust storm, panels back to 480 W, and a shelter of water and regolith.',
          'Diário do alerta: tempestade regional de poeira, painéis de volta a 480 W e abrigo com água e regolito.',
        )}
        healthExtra={[
          t(`Peak radiation: ${peakRadiation} mSv`, `Radiação no pico: ${peakRadiation} mSv`),
          t('Shielding: water and regolith', 'Blindagem: água e regolito'),
          t('Crew health stayed steady after the shelter', 'Saúde da tripulação estável depois do abrigo'),
        ]}
        doneLabel={t('Open the communication center', 'Abrir a central de comunicação')}
        onDone={() => go('scene6_earth_transmission', 'ending')}
      />

      {phase === 'ending' && step === 'scene6_earth_transmission' ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
          <EarthTransmission onDone={() => go('scene7_ending', 'ending')} />
        </div>
      ) : null}

      {phase === 'ending' && step === 'scene7_ending' ? (
        <MissionOutro missionId={5} lines={outroLines} stats={hudStats} onDone={finish}>
          <NasaSources />
        </MissionOutro>
      ) : null}
    </div>
  )
}
