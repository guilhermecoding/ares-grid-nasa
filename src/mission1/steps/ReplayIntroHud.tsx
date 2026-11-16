import { useMemo, useState, type ReactNode } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import { REPLAY_INTRO_HIGHLIGHT_WORDS, REPLAY_INTRO_PARTS } from '../../data/mission1Data'
import { useI18n } from '../../i18n/locale'
import { McButton } from '../../opening/McButton'
import { PixelDialogBox } from '../../opening/PixelDialogBox'
import { useHideFollowingDialogs } from '../../opening/useHideFollowingDialogs'
import { PanelCleanButton } from './PanelCleanButton'

interface Props {
  tilt: number
  azimuth: number
  efficiency: number
  firstInstalledAt: number
  lastCleanedAt: number | null
  /** When true, only show the configured panel (dialog already dismissed). */
  idle?: boolean
  onContinue: () => void
  onCleanPanel: () => void
}

function ConfiguredPanel({
  tilt,
  azimuth,
  cleanButton,
}: {
  tilt: number
  azimuth: number
  cleanButton?: ReactNode
}) {
  const { t } = useI18n()
  return (
    <div className="absolute inset-x-[8%] bottom-[18%] z-10 flex justify-center sm:inset-x-[16%]">
      <div className="relative w-[min(88%,24rem)]">
        <img
          src={MEDIA.mission1.panel}
          alt={t('Solar panel already set up', 'Painel solar configurado')}
          draggable={false}
          className="pointer-events-none w-full origin-bottom drop-shadow-[0_16px_28px_rgba(0,0,0,0.45)]"
          style={{
            transform: `perspective(520px) rotateX(${8 + tilt * 0.55}deg) rotateY(${azimuth * 0.32}deg)`,
          }}
        />
        {cleanButton ? (
          <div className="absolute top-1/2 -right-2 z-[75] -translate-y-1/2 translate-x-1/2 sm:-right-1">
            {cleanButton}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function StatusBanner({ efficiency }: { efficiency: number }) {
  const { t } = useI18n()
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="mx-auto max-w-3xl border-2 border-cyan-hud/50 bg-[#0a1628]/9 px-3 py-2 font-pixel text-[10px] text-cyan-hud sm:text-xs">
        <p>
          {t('Outside power', 'Energia Externa')}: {t('ACTIVE', 'ATIVA')}
        </p>
        <p className="text-energy">
          {t(`Panel · efficiency ${Math.round(efficiency)}%`, `Painel · eficiência ${Math.round(efficiency)}%`)}
        </p>
      </div>
    </div>
  )
}

/** Visit-only screen when the solar panel was already installed — no mission completion. */
export function ReplayIntroHud({
  tilt,
  azimuth,
  efficiency,
  firstInstalledAt,
  lastCleanedAt,
  idle = false,
  onContinue,
  onCleanPanel,
}: Props) {
  const { t, locale } = useI18n()
  const [part, setPart] = useState(0)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)

  const partCopy = REPLAY_INTRO_PARTS[part]!
  const lines = useMemo(() => partCopy.map((line) => t(line.en, line.pt)), [partCopy, t])
  const isLast = part >= REPLAY_INTRO_PARTS.length - 1
  const { blocked, hideDialog, afterClose } = useHideFollowingDialogs('m1', onContinue)

  const cleanButton = (
    <PanelCleanButton
      firstInstalledAt={firstInstalledAt}
      lastCleanedAt={lastCleanedAt}
      onClean={onCleanPanel}
    />
  )

  if (idle) {
    return (
      <>
        <StatusBanner efficiency={efficiency} />
        <ConfiguredPanel tilt={tilt} azimuth={azimuth} cleanButton={cleanButton} />
      </>
    )
  }

  return (
    <>
      <StatusBanner efficiency={efficiency} />
      <ConfiguredPanel tilt={tilt} azimuth={azimuth} cleanButton={cleanButton} />

      {!blocked && (
      <PixelDialogBox
        key={`m1-replay-${part}`}
        open={open}
        lines={lines}
        title="Capi"
        dialogId={`m1-replay-${part}`}
        onSkip={() => {
          hideDialog()
          setOpen(false)
        }}
        characterSrc={MEDIA.capi.neutral}
        characterAlt="Capi"
        highlightWords={part === 1 ? REPLAY_INTRO_HIGHLIGHT_WORDS[locale] : undefined}
        onTypingComplete={() => setReady(true)}
        onClosed={() => {
          afterClose(isLast, () => {
            setReady(false)
            setPart((p) => p + 1)
            setOpen(true)
          })
        }}
        footer={
          ready ? (
            <McButton
              className="min-h-12 px-6 font-pixel text-lg font-bold"
              style={{ touchAction: 'manipulation' }}
              onClick={() => setOpen(false)}
            >
              Ok
            </McButton>
          ) : null
        }
      />
      )}
    </>
  )
}
