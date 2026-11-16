import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CAPI_INTRO_LINES,
  TAKEOFF_HUD_LINES,
  type AstronautProfile,
  type OpeningPhase,
} from '../data/openingData'
import { useI18n } from '../i18n/locale'
import { setMuted, soundEngine, unlockAudio } from '../services/soundEngine'
import { AstronautCustomizer } from './AstronautCustomizer'
import { CapiDialog } from './CapiDialog'
import { CountdownScene } from './CountdownScene'
import { LandingScene } from './LandingScene'
import { LaunchSpaceCanvas } from './LaunchSpaceCanvas'
import { McButton } from './McButton'
import { PixelDialogBox } from './PixelDialogBox'
import { ReadyGate } from './ReadyGate'

const TAKEOFF_REVEAL_S = 1.8
const CAPI_SCENE_REVEAL_S = 1.2

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
  const { t, locale } = useI18n()
  const takeoffLines = useMemo(() => TAKEOFF_HUD_LINES.map((line) => line[locale]), [locale])
  const capiLines = useMemo(() => CAPI_INTRO_LINES.map((line) => line[locale]), [locale])
  const [phase, setPhase] = useState<OpeningPhase>('ready_gate')
  const [hologram, setHologram] = useState(false)
  const [takeoffReady, setTakeoffReady] = useState(false)
  const [takeoffRevealed, setTakeoffRevealed] = useState(false)
  const [takeoffDialogOpen, setTakeoffDialogOpen] = useState(false)
  const [capiSceneReady, setCapiSceneReady] = useState(false)
  const [savedProfile, setSavedProfile] = useState<AstronautProfile | null>(null)

  const finishToWorld = useCallback(
    (profile?: AstronautProfile) => {
      const p = profile ?? savedProfile
      onSaveProfile({
        playerName: p?.name ?? playerName ?? t('Astronaut', 'Astronauta'),
        suitColor: p?.suitColor ?? initialProfile?.suitColor ?? 'nasa-white',
        helmet: p?.helmet ?? initialProfile?.helmet ?? 'classic',
        backpack: p?.backpack ?? initialProfile?.backpack ?? 'standard',
        insignia: p?.insignia ?? initialProfile?.insignia ?? 'ares',
        openingCompleted: true,
      })
      onEnterWorld()
    },
    [savedProfile, playerName, initialProfile, onSaveProfile, onEnterWorld, t],
  )

  const startIntro = () => {
    void unlockAudio()
    setMuted(false)
    setHologram(false)
    setTakeoffReady(false)
    setTakeoffRevealed(false)
    setTakeoffDialogOpen(false)
    setCapiSceneReady(false)
    setPhase('scene1_countdown')
  }

  useEffect(() => {
    if (phase !== 'scene2_takeoff') return
    soundEngine.cockpitEnter()
  }, [phase])

  return (
    <div className="relative h-full min-h-[100dvh] w-full overflow-hidden bg-void-950" style={{ touchAction: 'manipulation' }}>
      {phase === 'ready_gate' && (
        <ReadyGate
          openingCompleted={openingCompleted}
          playerName={playerName}
          onStartIntro={startIntro}
          onContinue={() => {
            void unlockAudio()
            onEnterWorld()
          }}
        />
      )}

      {phase === 'scene1_countdown' && (
        <CountdownScene onComplete={() => setPhase('scene2_takeoff')} />
      )}

      {phase === 'scene2_takeoff' && (
        <div className="relative h-full w-full">
          <LaunchSpaceCanvas warp={0.85} hologramActive={hologram} paused={takeoffRevealed} />
          {takeoffRevealed && (
            <PixelDialogBox
              open={takeoffDialogOpen}
              lines={takeoffLines}
              title={t('SYS // TAKEOFF', 'SYS // DECOLAGEM')}
              dialogId="opening-takeoff"
              onSkip={() => setTakeoffDialogOpen(false)}
              onTypingComplete={() => {
                setHologram(true)
                setTakeoffReady(true)
              }}
              onClosed={() => {
                setCapiSceneReady(false)
                setPhase('scene3_capi_intro')
              }}
              footer={
                takeoffReady ? (
                  <McButton className="min-h-12 px-6 font-pixel text-lg font-bold" onClick={() => setTakeoffDialogOpen(false)}>
                    {t('Continue', 'Continuar')}
                  </McButton>
                ) : null
              }
            />
          )}
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 bg-white"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: TAKEOFF_REVEAL_S, ease: [0.22, 0.08, 0.25, 1] }}
            onAnimationComplete={() => {
              setTakeoffRevealed(true)
              setTakeoffDialogOpen(true)
            }}
          />
        </div>
      )}

      {phase === 'scene3_capi_intro' && (
        <div className="relative h-full w-full">
          <LaunchSpaceCanvas warp={0.4} hologramActive={capiSceneReady} paused={capiSceneReady} />
          {capiSceneReady && (
            <CapiDialog
              dialogId="opening-capi"
              lines={capiLines}
              onComplete={() => setPhase('scene3_1_customizer')}
            />
          )}
          <motion.div
            className="pointer-events-none absolute inset-0 z-30"
            style={{
              background:
                'radial-gradient(ellipse at 70% 80%, rgba(94,231,255,0.35), transparent 45%), #050a14',
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: CAPI_SCENE_REVEAL_S, ease: [0.22, 0.08, 0.25, 1] }}
            onAnimationComplete={() => setCapiSceneReady(true)}
          />
        </div>
      )}

      {phase === 'scene3_1_customizer' && (
        <AstronautCustomizer
          initial={{ name: playerName !== 'Robô Jr.' ? playerName : '', ...initialProfile }}
          onConfirm={(profile) => {
            setSavedProfile(profile)
            setPhase('scene4_landing')
          }}
        />
      )}

      {phase === 'scene4_landing' && (
        <LandingScene
          onStartMission={() => {
            setPhase('start_mission_1')
            finishToWorld(savedProfile ?? undefined)
          }}
        />
      )}
    </div>
  )
}
