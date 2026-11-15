import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { DialogBox } from './components/DialogBox'
import { MissionGateTransition } from './components/MissionGateTransition'
import { NasaDataModal } from './components/NasaDataModal'
import { WorldScreen } from './components/WorldScreen'
import { applyWeatherBundle, createWorldState } from './engine/worldEngine'
import { getMissionNode } from './data/missionNodes'
import { OpeningFlow } from './opening/OpeningFlow'
import { fetchDonkiBundle } from './services/donkiService'
import { loadProgress, updateProgress, type PlayerProgress } from './services/progressStore'
import { setMuted, soundEngine, unlockAudio } from './services/soundEngine'
import type { DonkiBundle } from './types/nasa'
import type { ScreenId, WorldState } from './types/game'

const Mission01Screen = lazy(() => import('./mission1/Mission01Screen'))

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
  const [activeMission, setActiveMission] = useState<number | null>(null)
  const [gate, setGate] = useState<{ missionId: number; title: string } | null>(null)
  const [missionReady, setMissionReady] = useState(false)
  const gateRef = useRef(gate)
  useEffect(() => {
    gateRef.current = gate
  }, [gate])
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
      }),
    )
  }, [])

  const enterWorld = useCallback(async () => {
    void unlockAudio()
    soundEngine.click()
    const p = loadProgress()
    let nextBundle = bundle
    if (!nextBundle) {
      nextBundle = await fetchDonkiBundle()
      setBundle(nextBundle)
    }
    let w = createWorldState(p.level, p.xp)
    w = applyWeatherBundle(w, nextBundle)
    setWorld(w)
    setScreen('world')
    if (!p.tutorialDone) {
      setTutorialStep(0)
      setTutorialOpen(true)
    }
  }, [bundle])

  const handleEnterMission = (level: number) => {
    const node = getMissionNode(level)
    setMissionReady(false)
    setGate({ missionId: level, title: node.gateTitle })
  }

  const handleGateClosed = useCallback(() => {
    const g = gateRef.current
    if (!g) return
    setMissionReady(false)
    setActiveMission(g.missionId)
    setScreen('mission')
  }, [])

  const handleGateOpened = useCallback(() => {
    setGate(null)
    setMissionReady(false)
  }, [])

  const leaveMission = (completed: boolean) => {
    setMissionReady(false)
    if (completed && world) {
      const nextLevel = Math.max(world.level, 2)
      const nextXp = world.xp + 40
      const next = { ...world, level: nextLevel, xp: nextXp, message: 'Missão 1 concluída! Nova ilha no mapa.' }
      setWorld(next)
      setProgress(
        updateProgress({
          level: nextLevel,
          xp: nextXp,
          unlockedTools: next.unlockedTools,
        }),
      )
      soundEngine.success()
    }
    setActiveMission(null)
    setScreen('world')
  }

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
            onComplete={() => leaveMission(true)}
            onExit={() => leaveMission(false)}
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

      <DialogBox
        open={tutorialOpen}
        title={TUTORIAL_STEPS[tutorialStep]!.title}
        body={TUTORIAL_STEPS[tutorialStep]!.body}
        primaryLabel={tutorialStep < TUTORIAL_STEPS.length - 1 ? 'Próximo' : 'Vamos lá!'}
        secondaryLabel="Pular"
        onSecondary={finishTutorial}
        onPrimary={() => {
          if (tutorialStep < TUTORIAL_STEPS.length - 1) setTutorialStep((s) => s + 1)
          else finishTutorial()
        }}
      />
    </div>
  )
}
