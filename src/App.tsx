import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ConfettiBurst } from './components/ConfettiBurst'
import { MissionGateTransition } from './components/MissionGateTransition'
import { NasaDataModal } from './components/NasaDataModal'
import { CertificateModal } from './components/world/CertificateModal'
import { LogbookMenu } from './components/world/LogbookMenu'
import { WorldScreen } from './components/WorldScreen'
import { applyWeatherBundle, createWorldState } from './engine/worldEngine'
import { TOTAL_MISSIONS } from './data/missionBadges'
import { useI18n } from './i18n/locale'
import { nodeCopy } from './i18n/worldCopy'
import { MEDIA } from './constants/mediaAssets'
import { McButton } from './opening/McButton'
import { OpeningFlow } from './opening/OpeningFlow'
import { PixelDialogBox } from './opening/PixelDialogBox'
import { fetchDonkiBundle } from './services/donkiService'
import { isDialogGroupSkipped, loadProgress, resetProgress, updateProgress, type PlayerProgress } from './services/progressStore'
import { setMuted, soundEngine, unlockAudio } from './services/soundEngine'
import type { DonkiBundle } from './types/nasa'
import type { BaseStats, ScreenId, WorldState } from './types/game'

const Mission01Screen = lazy(() => import('./mission1/Mission01Screen'))
const Mission2View = lazy(() => import('./components/mission2/Mission2View'))
const Mission3View = lazy(() => import('./components/mission3/Mission3View'))
const Mission4View = lazy(() => import('./components/mission4/Mission4View'))
const Mission5View = lazy(() => import('./components/mission5/Mission5View'))

type GateState = {
  missionId: number
  title: string
  direction: 'enter' | 'exit'
  completed?: boolean
  /** Final mission meters to persist when completing. */
  resultStats?: BaseStats
}

/** Dialogs opened from the missions-screen menu. */
type WorldPanel = 'logbook' | 'certificate' | 'certificate-first' | null

export default function App() {
  const { t } = useI18n()
  const tutorialSteps = useMemo(
    () => [
      {
        title: t('Missions in Arcadia', 'Missões em Arcadia'),
        body: t(
          'This is the mission map! Tap the open island to start the science adventure.',
          'Este é o mapa de missões! Toque na ilha liberada para começar a aventura científica.',
        ),
      },
      {
        title: t('Islands and locks', 'Ilhas e cadeados'),
        body: t(
          'Islands with a lock are still closed. Finish the current mission to move on!',
          'Ilhas com cadeado ainda estão bloqueadas. Complete a missão atual para avançar!',
        ),
      },
      {
        title: t('Mission 1 — Power', 'Missão 1 — Energia'),
        body: t(
          'Your first mission: install the solar panels with Capi. Happy exploring!',
          'Sua primeira missão: instalar painéis solares com a ajuda da Capi. Boa exploração!',
        ),
      },
    ],
    [t],
  )
  const [screen, setScreen] = useState<ScreenId>('home')
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress())
  const [world, setWorld] = useState<WorldState | null>(null)
  const [bundle, setBundle] = useState<DonkiBundle | null>(null)
  const [nasaOpen, setNasaOpen] = useState(false)
  const [worldPanel, setWorldPanel] = useState<WorldPanel>(null)
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
        completed && !alreadyCleared
          ? missionId === 5
            ? 80
            : missionId === 4
              ? 70
              : missionId === 3
                ? 60
                : missionId === 2
                  ? 50
                  : 40
          : 0
      const nextXp = w.xp + xpGain
      const message = completed
        ? missionId === 5
          ? alreadyCleared
            ? t('Mission 5 replayed — the base stays protected!', 'Missão 5 refeita — a base segue protegida!')
            : t('Expedition complete! The base in Arcadia is ready.', 'Expedição concluída! A base em Arcádia está pronta.')
          : missionId === 4
            ? alreadyCleared
              ? t('Mission 4 replayed — the greenhouse stays in the logbook!', 'Missão 4 refeita — a estufa segue no diário!')
              : t('Mission 4 complete! The storm alert is waiting.', 'Missão 4 concluída! O alerta de tempestade aguarda.')
            : missionId === 3
              ? alreadyCleared
                ? t('Mission 3 replayed — water and meters updated!', 'Missão 3 refeita — água e indicadores atualizados!')
                : t('Mission 3 complete! The first greenhouse is waiting.', 'Missão 3 concluída! A primeira estufa aguarda.')
              : missionId === 2
                ? alreadyCleared
                  ? t('Mission 2 replayed — meters updated!', 'Missão 2 refeita — indicadores atualizados!')
                  : t('Mission 2 complete! The ice mystery is waiting.', 'Missão 2 concluída! O mistério do gelo aguarda.')
                : alreadyCleared
                  ? t('Mission 1 replayed — meters updated!', 'Missão 1 refeita — indicadores atualizados!')
                  : t('Mission 1 complete! A new island is on the map.', 'Missão 1 concluída! Nova ilha no mapa.')
        : w.message

      const next = { ...w, level: nextLevel, xp: nextXp, message, stats: nextStats }
      setWorld(next)
      // Read the store again: the mission logbook saved its photo while playing.
      const stored = loadProgress()
      setProgress(
        updateProgress({
          level: nextLevel,
          xp: nextXp,
          unlockedTools: next.unlockedTools,
          baseStats: nextStats,
          expeditionCompletedAt:
            stored.expeditionCompletedAt ?? (nextLevel > TOTAL_MISSIONS ? Date.now() : null),
        }),
      )
    },
    [t],
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
    // A save that finished the expedition before the certificate existed gets it now.
    if (p.level > TOTAL_MISSIONS && !p.certificateSeen) setWorldPanel('certificate-first')
    if (!p.tutorialDone) {
      setTutorialStep(0)
      setTutorialReady(false)
      setTutorialBoxOpen(true)
      setTutorialOpen(true)
    }
  }, [bundle])

  const handleEnterMission = (level: number) => {
    void unlockAudio()
    soundEngine.missionOpen()
    setMissionReady(false)
    setGate({ missionId: level, title: nodeCopy(level, t).gate, direction: 'enter' })
  }

  const leaveMission = (completed: boolean, resultStats?: BaseStats) => {
    const missionId = activeMission ?? 1
    void unlockAudio()
    setMissionReady(false)
    setGate({
      missionId,
      title: nodeCopy(missionId, t).gate,
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
    if (!celebrateExit) return
    // First time all five missions are done: hand over the certificate (it brings its own confetti).
    const stored = loadProgress()
    if (stored.level > TOTAL_MISSIONS && !stored.certificateSeen) setWorldPanel('certificate-first')
    else setCelebrate(true)
  }, [])

  const closeLogbook = useCallback(() => setWorldPanel(null), [])

  const closeCertificate = useCallback(() => {
    setWorldPanel(null)
    const stored = loadProgress()
    if (stored.level > TOTAL_MISSIONS && !stored.certificateSeen) {
      setProgress(updateProgress({ certificateSeen: true }))
    }
  }, [])

  useEffect(() => {
    if (!celebrate) return
    const id = window.setTimeout(() => setCelebrate(false), 3200)
    return () => window.clearTimeout(id)
  }, [celebrate])

  const restartGame = () => {
    const fresh = resetProgress()
    setProgress(fresh)
    setWorld(null)
    setScreen('home')
    setActiveMission(null)
    setGate(null)
    setWorldPanel(null)
    setCelebrate(false)
    setTutorialOpen(false)
    setNasaOpen(false)
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
            avatar: progress.avatar,
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
          onLogbook={() => {
            soundEngine.click()
            setWorldPanel('logbook')
          }}
          onCertificate={() => {
            soundEngine.click()
            setWorldPanel('certificate')
          }}
          onRestart={restartGame}
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

      {screen === 'mission' && activeMission === 4 && (
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-void-950 font-pixel text-cyan-hud">
              Carregando missão…
            </div>
          }
        >
          <Mission4View
            stats={world?.stats}
            playerName={progress.playerName}
            onComplete={(result) => leaveMission(true, result)}
            onExit={(result) => leaveMission(false, result)}
            onReady={() => setMissionReady(true)}
          />
        </Suspense>
      )}

      {screen === 'mission' && activeMission === 5 && (
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-void-950 font-pixel text-cyan-hud">
              Carregando missão…
            </div>
          }
        >
          <Mission5View
            stats={world?.stats}
            playerName={progress.playerName}
            spaceWeatherLabel={
              bundle && bundle.mode !== 'curated' && bundle.flares[0]
                ? `Erupção solar classe ${bundle.flares[0].classType}`
                : undefined
            }
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

      {screen === 'world' && world && worldPanel === 'logbook' ? (
        <LogbookMenu level={world.level} entries={progress.logbook} onClose={closeLogbook} />
      ) : null}

      {screen === 'world' && world && (worldPanel === 'certificate' || worldPanel === 'certificate-first') ? (
        <CertificateModal
          playerName={progress.playerName}
          insignia={progress.insignia}
          level={world.level}
          completedAt={progress.expeditionCompletedAt ?? progress.logbook.m5?.capturedAt ?? null}
          celebrate={worldPanel === 'certificate-first'}
          onClose={closeCertificate}
        />
      ) : null}

      {celebrate && <ConfettiBurst />}

      {tutorialOpen && (
        <div className="fixed inset-0 z-[80]">
          <PixelDialogBox
            key={`map-intro-${tutorialStep}`}
            open={tutorialBoxOpen}
            position="center"
            title="Capi"
            lines={[tutorialSteps[tutorialStep]!.title, tutorialSteps[tutorialStep]!.body]}
            dialogId={`map-intro-${tutorialStep}`}
            onSkip={() => setTutorialBoxOpen(false)}
            characterSrc={MEDIA.capi.neutral}
            characterAlt="Capi"
            onTypingComplete={() => setTutorialReady(true)}
            onClosed={() => {
              if (isDialogGroupSkipped('map') || tutorialStep >= tutorialSteps.length - 1) {
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
                  {tutorialStep < tutorialSteps.length - 1 ? t('Next', 'Próximo') : t('Let’s go!', 'Vamos lá!')}
                </McButton>
              ) : null
            }
          />
        </div>
      )}
    </div>
  )
}
