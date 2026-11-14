import { useCallback, useEffect, useState } from 'react'
import { DialogBox } from './components/DialogBox'
import { HomeScreen } from './components/HomeScreen'
import { NasaDataModal } from './components/NasaDataModal'
import { WorldScreen } from './components/WorldScreen'
import { applyWeatherBundle, createWorldState, interact, moveRover, sleep } from './engine/worldEngine'
import { fetchDonkiBundle } from './services/donkiService'
import { loadProgress, updateProgress, type PlayerProgress } from './services/progressStore'
import { setMuted, soundEngine, unlockAudio } from './services/soundEngine'
import type { DonkiBundle } from './types/nasa'
import type { ScreenId, WorldState } from './types/game'

const TUTORIAL_STEPS = [
  {
    title: 'Oi! Eu sou seu robô',
    body: 'Esta é Arcadia Planitia — uma planície de Marte com gelo escondido. Vamos cuidar da base juntos!',
  },
  {
    title: 'Andar e interagir',
    body: 'Use as setas (ou toque numa casa vizinha) para andar. Chegue perto de um módulo e aperte Interagir.',
  },
  {
    title: 'Energia e dormir',
    body: 'Trabalhar gasta energia. Quando cansar, volte para a casinha 🏠 e aperte Dormir para o próximo Sol.',
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
  const [levelUpOpen, setLevelUpOpen] = useState(false)
  const [levelUpText, setLevelUpText] = useState('')
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

  // Keyboard controls
  useEffect(() => {
    if (screen !== 'world' || !world || tutorialOpen || levelUpOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setWorld((w) => (w ? moveRover(w, 0, -1) : w))
        soundEngine.step()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setWorld((w) => (w ? moveRover(w, 0, 1) : w))
        soundEngine.step()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setWorld((w) => (w ? moveRover(w, -1, 0) : w))
        soundEngine.step()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setWorld((w) => (w ? moveRover(w, 1, 0) : w))
        soundEngine.step()
      } else if (e.key === ' ' || e.key.toLowerCase() === 'e') {
        e.preventDefault()
        setWorld((w) => {
          if (!w) return w
          const next = interact(w)
          if (next.justLeveledUp) {
            soundEngine.success()
            setLevelUpText(next.levelUpTitle ?? 'Nível novo!')
            setLevelUpOpen(true)
            syncProgressFromWorld(next)
          } else {
            soundEngine.click()
          }
          return next
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, world, tutorialOpen, levelUpOpen, syncProgressFromWorld])

  const handleMove = (dx: number, dy: number) => {
    if (!world) return
    soundEngine.step()
    setWorld(moveRover(world, dx, dy))
  }

  const handleInteract = () => {
    if (!world) return
    const next = interact(world)
    if (next.justLeveledUp) {
      soundEngine.success()
      setLevelUpText(next.levelUpTitle ?? 'Nível novo!')
      setLevelUpOpen(true)
      syncProgressFromWorld(next)
    } else {
      soundEngine.harvest()
    }
    setWorld(next)
  }

  const handleSleep = async () => {
    if (!world) return
    soundEngine.telemetry()
    let b = bundle
    if (!b) {
      b = await fetchDonkiBundle()
      setBundle(b)
    }
    const next = sleep(world, b)
    setWorld(next)
    setProgress(
      updateProgress({
        level: next.level,
        xp: next.xp,
        unlockedTools: next.unlockedTools,
        solsPlayed: loadProgress().solsPlayed + 1,
      }),
    )
    if (next.justLeveledUp) {
      soundEngine.success()
      setLevelUpText(next.levelUpTitle ?? 'Nível novo!')
      setLevelUpOpen(true)
    }
  }

  const handleCellTap = (x: number, y: number) => {
    if (!world) return
    const dx = x - world.rover.x
    const dy = y - world.rover.y
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      handleMove(dx, dy)
    } else if (dx === 0 && dy === 0) {
      handleInteract()
    } else {
      setWorld({ ...world, message: 'Toque numa casa vizinha para andar até lá.' })
    }
  }

  const finishTutorial = () => {
    setTutorialOpen(false)
    setProgress(updateProgress({ tutorialDone: true }))
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {screen === 'home' && (
        <HomeScreen
          playerName={progress.playerName}
          level={progress.level}
          solsPlayed={progress.solsPlayed}
          onNameChange={(name) => setProgress(updateProgress({ playerName: name }))}
          onStart={() => void enterWorld()}
        />
      )}

      {screen === 'world' && world && (
        <WorldScreen
          state={world}
          muted={muted}
          onMove={handleMove}
          onInteract={handleInteract}
          onSleep={() => void handleSleep()}
          onCellTap={handleCellTap}
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

      <DialogBox
        open={levelUpOpen}
        title="Subiu de nível!"
        body={levelUpText}
        primaryLabel="Continuar"
        onPrimary={() => setLevelUpOpen(false)}
      />
    </div>
  )
}
