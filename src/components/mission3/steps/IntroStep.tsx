import { useMemo, useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import {
  INTRO_HIGHLIGHT_WORDS_M3,
  INTRO_HIGHLIGHT_WORDS_M3_EN,
  INTRO_PARTS_M3,
  INTRO_PARTS_M3_EN,
  MISSION3_META,
} from '../../../data/mission3Data'
import { useI18n } from '../../../i18n/locale'
import { McButton } from '../../../opening/McButton'
import { PixelDialogBox } from '../../../opening/PixelDialogBox'
import { useHideFollowingDialogs } from '../../../opening/useHideFollowingDialogs'
import { SciTermM3 } from '../SciTermM3'

interface Props {
  energy: number
  waterL: number
  onContinue: () => void
}

export function IntroStep({ energy, waterL, onContinue }: Props) {
  const { t, locale } = useI18n()
  const [part, setPart] = useState(0)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)

  const lines = useMemo(
    () => (locale === 'en' ? INTRO_PARTS_M3_EN[part]! : INTRO_PARTS_M3[part]!),
    [locale, part],
  )
  const highlightWords = useMemo(
    () => (locale === 'en' ? INTRO_HIGHLIGHT_WORDS_M3_EN : INTRO_HIGHLIGHT_WORDS_M3),
    [locale],
  )
  const isLast = part >= INTRO_PARTS_M3.length - 1
  const { blocked, hideDialog, afterClose } = useHideFollowingDialogs('m3', onContinue)

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-16 z-20 px-3 sm:px-4">
        <div className="pointer-events-auto mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded border-2 border-cyan-hud/40 bg-[#0a1628]/92 px-3 py-2 font-pixel text-[10px] text-cyan-hud sm:text-xs">
          <span>
            {MISSION3_META.solLabel} | {MISSION3_META.location}
          </span>
          <span className="text-energy">
            {t('Base energy', 'Energia Base')} {Math.round(energy)}%
          </span>
          <span className="text-[#7dd3fc]">
            {t('Water reserve', 'Reserva de Água')} {Math.round(waterL)} L
          </span>
          <span className="border border-cyan-hud/40 px-1.5 py-0.5">
            {t('Science mission · ice in the', 'Missão científica · gelo no')}{' '}
            <SciTermM3 term={t('Subsurface', 'Subsolo')} />
          </span>
        </div>
      </div>

      {!blocked && (
      <PixelDialogBox
        key={`m3-intro-${part}`}
        open={open}
        lines={lines}
        title="Capi"
        dialogId={`m3-intro-${part}`}
        onSkip={() => {
          hideDialog()
          setOpen(false)
        }}
        characterSrc={MEDIA.capi.neutral}
        characterAlt="Capi"
        highlightWords={highlightWords}
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
              {isLast ? t('Start the investigation', 'Começar investigação') : t('Continue', 'Continuar')}
            </McButton>
          ) : null
        }
      />
      )}
    </>
  )
}
