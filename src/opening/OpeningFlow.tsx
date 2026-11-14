import { motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import {
  CAPI_INTRO_LINES,
  TAKEOFF_HUD_LINES,
  type AstronautProfile,
  type OpeningPhase,
} from '../data/openingData'
import { setMuted, soundEngine, unlockAudio } from '../services/soundEngine'
import { AstronautCustomizer } from './AstronautCustomizer'
import { CapiDialog } from './CapiDialog'
import { CountdownScene } from './CountdownScene'
import { LandingScene } from './LandingScene'
import { LaunchSpaceCanvas } from './LaunchSpaceCanvas'
import { ReadyGate } from './ReadyGate'
import { TypewriterHud } from './TypewriterHud'

const TAKEOFF_REVEAL_S = 1.8

export interface OpeningProfilePatch {
  playerName: string
  suitColor: AstronautProfile['suitColor']
  helmet: AstronautProfile['helmet']
  backpack: AstronautProfile['backpack']
  insignia: AstronautProfile['insignia']
  openingCompleted: true
}

interface OpeningFlowProps {
  openingCompleted: boolean
  playerName: string
  initialProfile?: Partial<AstronautProfile>
  onSaveProfile: (patch: OpeningProfilePatch) => void
  onEnterWorld: () => void
}

export function OpeningFlow({
  openingCompleted,
  playerName,
  initialProfile,
  onSaveProfile,
  onEnterWorld,
}: OpeningFlowProps) {
  const [phase, setPhase] = useState<OpeningPhase>('ready_gate')
  const [hologram, setHologram] = useState(false)
  const [takeoffReady, setTakeoffReady] = useState(false)
  const [takeoffRevealed, setTakeoffRevealed] = useState(false)
  const [savedProfile, setSavedProfile] = useState<AstronautProfile | null>(null)

  const finishToWorld = useCallback(
    (profile?: AstronautProfile) => {
      const p = profile ?? savedProfile
      onSaveProfile({
        playerName: p?.name ?? playerName ?? 'Astronauta',
        suitColor: p?.suitColor ?? initialProfile?.suitColor ?? 'nasa-white',
        helmet: p?.helmet ?? initialProfile?.helmet ?? 'classic',
        backpack: p?.backpack ?? initialProfile?.backpack ?? 'standard',
        insignia: p?.insignia ?? initialProfile?.insignia ?? 'ares',
        openingCompleted: true,
      })
      onEnterWorld()
    },
    [savedProfile, playerName, initialProfile, onSaveProfile, onEnterWorld],
  )

  const skip = () => {
    soundEngine.click()
    finishToWorld()
  }

  const startIntro = () => {
    void unlockAudio()
    setMuted(false)
    soundEngine.click()
    setHologram(false)
    setTakeoffReady(false)
    setTakeoffRevealed(false)
    setPhase('scene1_countdown')
  }

  const showSkip = phase !== 'ready_gate' && phase !== 'start_mission_1'

  return (
    <div className="relative h-full min-h-[100dvh] w-full overflow-hidden bg-void-950" style={{ touchAction: 'manipulation' }}>
      {showSkip && (
        <button
          type="button"
          className="absolute top-3 right-3 z-50 min-h-12 rounded-lg border border-void-500/50 bg-void-900/70 px-3 text-sm text-void-300 backdrop-blur-sm hover:text-void-100"
          onClick={skip}
        >
          Pular Introdução
        </button>
      )}

      {phase === 'ready_gate' && (
        <ReadyGate
          openingCompleted={openingCompleted}
          playerName={playerName}
          onStartIntro={startIntro}
          onContinue={() => {
            void unlockAudio()
            soundEngine.click()
            onEnterWorld()
          }}
          onReplayIntro={startIntro}
        />
      )}

      {phase === 'scene1_countdown' && (
        <CountdownScene onComplete={() => setPhase('scene2_takeoff')} />
      )}

      {phase === 'scene2_takeoff' && (
        <div className="relative h-full w-full">
          <LaunchSpaceCanvas warp={0.85} hologramActive={hologram} />
          {takeoffRevealed && (
            <div className="pointer-events-auto absolute top-4 left-4 z-20 w-[min(100%-2rem,22rem)] sm:top-5 sm:left-5 sm:w-[min(100%-2.5rem,26rem)]">
              <TypewriterHud
                variant="matrix"
                lines={TAKEOFF_HUD_LINES}
                onComplete={() => {
                  setHologram(true)
                  setTakeoffReady(true)
                }}
                footer={
                  takeoffReady ? (
                    <button
                      type="button"
                      className="mc-btn min-h-12 px-6 font-pixel text-lg font-bold"
                      onClick={() => {
                        soundEngine.click()
                        setPhase('scene3_capi_intro')
                      }}
                    >
                      Continuar
                    </button>
                  ) : null
                }
              />
            </div>
          )}
          {/* Continues the countdown white flash into the cockpit */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 bg-white"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: TAKEOFF_REVEAL_S, ease: [0.22, 0.08, 0.25, 1] }}
            onAnimationComplete={() => setTakeoffRevealed(true)}
          />
        </div>
      )}

      {phase === 'scene3_capi_intro' && (
        <div className="relative h-full w-full">
          <LaunchSpaceCanvas warp={0.4} hologramActive />
          <CapiDialog lines={CAPI_INTRO_LINES} onComplete={() => setPhase('scene3_1_customizer')} />
        </div>
      )}

      {phase === 'scene3_1_customizer' && (
        <AstronautCustomizer
          initial={{ name: playerName !== 'Robô Jr.' ? playerName : '', ...initialProfile }}
          onConfirm={(profile) => {
            setSavedProfile(profile)
            soundEngine.success()
            setPhase('scene4_landing')
          }}
        />
      )}

      {phase === 'scene4_landing' && (
        <LandingScene
          onStartMission={() => {
            soundEngine.success()
            setPhase('start_mission_1')
            finishToWorld(savedProfile ?? undefined)
          }}
        />
      )}
    </div>
  )
}
