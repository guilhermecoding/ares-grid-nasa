import { useCallback, useMemo, useState } from 'react'
import { MEDIA } from '../constants/mediaAssets'
import { TOTAL_MISSIONS } from '../data/missionBadges'
import { LanguageSwitch, useI18n } from '../i18n/locale'
import { McButton } from '../opening/McButton'
import { PixelDialogBox } from '../opening/PixelDialogBox'
import { updateProgress } from '../services/progressStore'
import type { WorldState } from '../types/game'
import { FloatingControls } from './FloatingControls'
import { MarsMap } from './MarsMap'
import { StatusIndicators } from './StatusIndicators'

interface Props {
  state: WorldState
  muted: boolean
  showControlHints: boolean
  onControlHintsDone: () => void
  onEnterMission: (level: number) => void
  onToggleMute: () => void
  onNasa: () => void
  onHome: () => void
  onLogbook: () => void
  onCertificate: () => void
  onRestart: () => void
}

export function WorldScreen({
  state,
  muted,
  showControlHints,
  onControlHintsDone,
  onEnterMission,
  onToggleMute,
  onNasa,
  onHome,
  onLogbook,
  onCertificate,
  onRestart,
}: Props) {
  const { t } = useI18n()
  const [restartOpen, setRestartOpen] = useState(false)
  const restartLines = useMemo(
    () => [
      t('Start over from the beginning?', 'Recomeçar do começo?'),
      t(
        'You will lose your missions, your logbook and your certificate.',
        'Você vai perder as missões, o diário e o certificado.',
      ),
    ],
    [t],
  )
  const handleLabelsDone = useCallback(() => {
    updateProgress({ controlsHintSeen: true })
    onControlHintsDone()
  }, [onControlHintsDone])

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      <MarsMap state={state} onEnterMission={onEnterMission} />

      <StatusIndicators stats={state.stats} placement="world" />

      <header className="pointer-events-none absolute top-0 left-0 z-20 max-w-[min(70vw,22rem)] px-3 pt-3 pr-2 sm:max-w-[28rem] sm:px-4 sm:pt-4">
        <h1 className="rounded border border-cyan-hud/40 bg-[#0a1628]/88 px-3 py-2 text-left font-pixel text-sm tracking-wide text-cyan-hud shadow-[0_0_18px_rgba(94,231,255,0.25)] sm:px-4 sm:text-lg md:text-xl">
          {t('Missions in Arcadia Planitia', 'Missões em Arcadia Planitia')}
        </h1>
        <div className="pointer-events-auto mt-2">
          <LanguageSwitch />
        </div>
      </header>

      <FloatingControls
        canSleep={false}
        muted={muted}
        showLabels={showControlHints}
        onLabelsDone={handleLabelsDone}
        onMove={() => {}}
        onInteract={() => {}}
        onSleep={() => {}}
        onToggleMute={onToggleMute}
        onNasa={onNasa}
        onHome={onHome}
        mapMode
        onLogbook={onLogbook}
        onCertificate={onCertificate}
        certificateEarned={state.level > TOTAL_MISSIONS}
        onRestart={() => setRestartOpen(true)}
      />

      <PixelDialogBox
        open={restartOpen}
        position="center"
        title="Capi"
        characterSrc={MEDIA.capi.neutral}
        characterAlt="Capi"
        lines={restartLines}
        onClosed={() => setRestartOpen(false)}
        footer={
          <div className="flex flex-wrap justify-center gap-2">
            <McButton className="min-h-12 px-4 font-pixel" onClick={() => setRestartOpen(false)}>
              {t('Keep playing', 'Continuar jogando')}
            </McButton>
            <McButton
              className="mc-btn-green min-h-12 px-4 font-pixel font-bold"
              onClick={() => {
                setRestartOpen(false)
                onRestart()
              }}
            >
              {t('Start over', 'Recomeçar')}
            </McButton>
          </div>
        }
      />
    </div>
  )
}
