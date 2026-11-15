import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { ConfettiBurst } from './components/ConfettiBurst'
import { MissionGateTransition } from './components/MissionGateTransition'
import { NasaDataModal } from './components/NasaDataModal'
import { WorldScreen } from './components/WorldScreen'
import { applyWeatherBundle, createWorldState } from './engine/worldEngine'
import { getMissionNode } from './data/missionNodes'
import { MEDIA } from './constants/mediaAssets'
import { McButton } from './opening/McButton'
import { OpeningFlow } from './opening/OpeningFlow'
import { PixelDialogBox } from './opening/PixelDialogBox'
import { fetchDonkiBundle } from './services/donkiService'
import { isDialogGroupSkipped, loadProgress, updateProgress, type PlayerProgress } from './services/progressStore'
import { setMuted, soundEngine, unlockAudio } from './services/soundEngine'
import type { DonkiBundle } from './types/nasa'
import type { BaseStats, ScreenId, WorldState } from './types/game'

const Mission01Screen = lazy(() => import('./mission1/Mission01Screen'))
const Mission2View = lazy(() => import('./components/mission2/Mission2View'))
const Mission3View = lazy(() => import('./components/mission3/Mission3View'))

type GateState = {
  missionId: number
  title: string
  direction: 'enter' | 'exit'
  completed?: boolean
  /** Final mission meters to persist when completing. */
  resultStats?: BaseStats
}

const TUTORIAL_STEPS = [
  {
    title: 'Missões em Arcadia',
    body: 'Este é o mapa de missões! Toque na ilha liberada para começar a aventura científica.',
  },
  {
    title: 'Ilhas e cadeados',
    body: 'Ilhas com cadeado ainda estão bloqueadas. Complete a missão atual para avançar!',
  },
  {
    title: 'Missão 1 — Energia',
    body: 'Sua primeira missão: instalar painéis solares com a ajuda da Capi. Boa exploração!',
  },
]

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('home')
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress())
  const [world, setWorld] = useState<WorldState | null>(null)
  const [bundle, setBundle] = useState<DonkiBundle | null>(null)
  const [nasaOpen, setNasaOpen] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [tutorialBoxOpen, setTutorialBoxOpen] = useState(true)
  const [tutorialReady, setTutorialReady] = useState(false)
  const [activeMission, setActiveMission] = useState<number | null>(null)
  const [gate, setGate] = useState<GateState | null>(null)
  const [missionReady, setMissionReady] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const gateRef = useRef(gate)
  const worldRef = useRef(world)
  useEffect(() => {
    gateRef.current = gate
  }, [gate])
  useEffect(() => {
    worldRef.current = world
  }, [world])
  const [muted, setMutedState] = useState(() => {
    setMuted(progress.muted)
    return progress.muted
  })

  const syncProgressFromWorld = useCallback((w: WorldState) => {
    setProgress(
      updateProgress({
        level: w.level,
        xp: w.xp,
        unlockedTools: w.unlockedTools,
        solsPlayed: Math.max(loadProgress().solsPlayed, w.sol - 1),
        baseStats: w.stats,
      }),
    )
  }, [])

  const applyMissionComplete = useCallback(
    (completed: boolean, missionId: number, resultStats?: BaseStats) => {
      const w = worldRef.current
      if (!w) return

      // Always keep session meters — never snap back to pre-entry scores on exit/replay.
      const nextStats: BaseStats = resultStats
        ? {
            energy: Math.max(0, Math.min(100, Math.round(resultStats.energy))),
            water: Math.max(0, Math.min(100, Math.round(resultStats.water))),
            wellbeing: Math.max(0, Math.min(100, Math.round(resultStats.wellbeing))),
          }
        : w.stats

      const alreadyCleared = w.level > missionId
      const nextLevel = completed ? Math.max(w.level, missionId + 1) : w.level
      const xpGain =
        completed && !alreadyCleared ? (missionId === 3 ? 60 : missionId === 2 ? 50 : 40) : 0
      const nextXp = w.xp + xpGain
      const message = completed
        ? missionId === 3
          ? alreadyCleared
            ? 'Missão 3 refeita — água e indicadores atualizados!'
            : 'Missão 3 concluída! A primeira estufa aguarda.'
          : missionId === 2
            ? alreadyCleared
              ? 'Missão 2 refeita — indicadores atualizados!'
              : 'Missão 2 concluída! O mistério do gelo aguarda.'
            : alreadyCleared
              ? 'Missão 1 refeita — indicadores atualizados!'
              : 'Missão 1 concluída! Nova ilha no mapa.'
        : w.message

      const next = { ...w, level: nextLevel, xp: nextXp, message, stats: nextStats }
      setWorld(next)
      setProgress(
        updateProgress({
          level: nextLevel,
          xp: nextXp,
          unlockedTools: next.unlockedTools,
          baseStats: nextStats,
        }),
      )
    },
    [],
  )

  const enterWorld = useCallback(async () => {
    void unlockAudio()
    soundEngine.click()
    const p = loadProgress()
    let nextBundle = bundle
    if (!nextBundle) {
      nextBundle = await fetchDonkiBundle()
      setBundle(nextBundle)
    }
    let w = createWorldState(p.level, p.xp, undefined, p.baseStats)
    w = applyWeatherBundle(w, nextBundle)
    setWorld(w)
    setScreen('world')
    if (!p.tutorialDone) {
      setTutorialStep(0)
      setTutorialReady(false)
      setTutorialBoxOpen(true)
      setTutorialOpen(true)
    }
  }, [bundle])

  const handleEnterMission = (level: number) => {
    const node = getMissionNode(level)
    void unlockAudio()
    soundEngine.missionOpen()
    setMissionReady(false)
    setGate({ missionId: level, title: node.gateTitle, direction: 'enter' })
  }

  const leaveMission = (completed: boolean, resultStats?: BaseStats) => {
    const missionId = activeMission ?? 1
    const node = getMissionNode(missionId)
    void unlockAudio()
    setMissionReady(false)
    setGate({
      missionId,
      title: node.gateTitle,
      direction: 'exit',
      completed,
      resultStats,
    })
  }

  const handleGateClosed = useCallback(() => {
    const g = gateRef.current
    if (!g) return

    if (g.direction === 'exit') {
      applyMissionComplete(!!g.completed, g.missionId, g.resultStats)
      setActiveMission(null)
      setScreen('world')
      // World paints under closed shutters, then open.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setMissionReady(true))
      })
      return
    }

    setMissionReady(false)
    setActiveMission(g.missionId)
    setScreen('mission')
  }, [applyMissionComplete])

  const handleGateOpened = useCallback(() => {
    const g = gateRef.current
    const celebrateExit = g?.direction === 'exit' && !!g.completed
    setGate(null)
    setMissionReady(false)
    if (celebrateExit) setCelebrate(true)
  }, [])

  useEffect(() => {
    if (!celebrate) return
    const id = window.setTimeout(() => setCelebrate(false), 3200)
    return () => window.clearTimeout(id)
  }, [celebrate])

  const finishTutorial = () => {
    setTutorialOpen(false)
    setProgress(updateProgress({ tutorialDone: true }))
  }

  return (
    <div className={`flex h-full min-h-0 flex-col ${screen === 'home' ? 'relative' : ''}`}>
      {screen === 'home' && (
        <OpeningFlow
          openingCompleted={progress.openingCompleted}
          playerName={progress.playerName}
          initialProfile={{
            name: progress.playerName,
            suitColor: progress.suitColor,
            helmet: progress.helmet,
            backpack: progress.backpack,
            insignia: progress.insignia,
          }}
          onSaveProfile={(patch) => {
            setMuted(false)
            setMutedState(false)
            setProgress(updateProgress({ ...patch, muted: false }))
          }}
          onEnterWorld={() => void enterWorld()}
        />
      )}

      {screen === 'world' && world && (
        <WorldScreen
          state={world}
          muted={muted}
          showControlHints={!progress.controlsHintSeen && !tutorialOpen}
          onControlHintsDone={() => setProgress(updateProgress({ controlsHintSeen: true }))}
          onEnterMission={handleEnterMission}
          onToggleMute={() => {
            const next = !muted
            setMuted(next)
            setMutedState(next)
            setProgress(updateProgress({ muted: next }))
            if (!next) void unlockAudio()
          }}
          onNasa={() => setNasaOpen(true)}
          onHome={() => {
            if (world) syncProgressFromWorld(world)
            setScreen('home')
          }}
        />
      )}

      {screen === 'mission' && activeMission === 1 && (
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-void-950 font-pixel text-cyan-hud">
              Carregando missão…
            </div>
          }
        >
          <Mission01Screen
            stats={world?.stats}
            onComplete={(result) => leaveMission(true, result)}
            onExit={(result) => leaveMission(false, result)}
            onReady={() => setMissionReady(true)}
          />
        </Suspense>
      )}

      {screen === 'mission' && activeMission === 2 && (
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-void-950 font-pixel text-cyan-hud">
              Carregando missão…
            </div>
          }
        >
          <Mission2View
            stats={world?.stats}
            playerName={progress.playerName}
            onComplete={(result) => leaveMission(true, result)}
            onExit={(result) => leaveMission(false, result)}
            onReady={() => setMissionReady(true)}
          />
        </Suspense>
      )}

      {screen === 'mission' && activeMission === 3 && (
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-void-950 font-pixel text-cyan-hud">
              Carregando missão…
            </div>
          }
        >
          <Mission3View
            stats={world?.stats}
            onComplete={(result) => leaveMission(true, result)}
            onExit={(result) => leaveMission(false, result)}
            onReady={() => setMissionReady(true)}
          />
        </Suspense>
      )}

      <MissionGateTransition
        open={!!gate}
        contentReady={missionReady}
        missionNumber={gate?.missionId ?? 1}
        title={gate?.title ?? ''}
        onClosed={handleGateClosed}
        onOpened={handleGateOpened}
      />

      <NasaDataModal open={nasaOpen} weather={world?.weather ?? null} onClose={() => setNasaOpen(false)} />

      {celebrate && <ConfettiBurst />}

      {tutorialOpen && (
        <div className="fixed inset-0 z-[80]">
          <PixelDialogBox
            key={`map-intro-${tutorialStep}`}
            open={tutorialBoxOpen}
            position="center"
            title="Capi"
            lines={[TUTORIAL_STEPS[tutorialStep]!.title, TUTORIAL_STEPS[tutorialStep]!.body]}
            dialogId={`map-intro-${tutorialStep}`}
            onSkip={() => setTutorialBoxOpen(false)}
            characterSrc={MEDIA.capi.neutral}
            characterAlt="Capi"
            onTypingComplete={() => setTutorialReady(true)}
            onClosed={() => {
              if (isDialogGroupSkipped('map') || tutorialStep >= TUTORIAL_STEPS.length - 1) {
                finishTutorial()
                return
              }
              setTutorialReady(false)
              setTutorialStep((step) => step + 1)
              setTutorialBoxOpen(true)
            }}
            footer={
              tutorialReady ? (
                <McButton
                  className="min-h-12 px-6 font-pixel text-lg font-bold"
                  onClick={() => setTutorialBoxOpen(false)}
                >
                  {tutorialStep < TUTORIAL_STEPS.length - 1 ? 'Próximo' : 'Vamos lá!'}
                </McButton>
              ) : null
            }
          />
        </div>
      )}
    </div>
  )
}
