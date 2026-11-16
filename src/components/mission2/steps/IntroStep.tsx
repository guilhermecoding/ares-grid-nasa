import { useMemo, useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import { INTRO_HIGHLIGHT_WORDS_M2, INTRO_PARTS_M2 } from '../../../data/mission2Data'
import { useI18n } from '../../../i18n/locale'
import { McButton } from '../../../opening/McButton'
import { PixelDialogBox } from '../../../opening/PixelDialogBox'
import { useHideFollowingDialogs } from '../../../opening/useHideFollowingDialogs'
import { SciTermM2 } from '../SciTermM2'

interface Props {
  onContinue: () => void
}

export function IntroStep({ onContinue }: Props) {
  const { t, locale } = useI18n()
  const [part, setPart] = useState(0)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)

  const introLines = useMemo(
    () => [
      [t('Life away from Earth can shake the health of a brave astronaut.', INTRO_PARTS_M2[0][0])],
      [t('With the power on, we will take care of YOU.', INTRO_PARTS_M2[1][0])],
      [t('Today: exercise, a meal, hygiene, and rest.', INTRO_PARTS_M2[2][0])],
    ],
    [t],
  )
  const highlightWords = useMemo(
    () =>
      locale === 'en'
        ? (['health', 'YOU', 'exercise', 'meal', 'hygiene', 'rest'] as const)
        : INTRO_HIGHLIGHT_WORDS_M2,
    [locale],
  )
  const lines = introLines[part]!
  const isLast = part >= introLines.length - 1
  const { blocked, hideDialog, afterClose } = useHideFollowingDialogs('m2', onContinue)

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 px-4 text-center sm:bottom-28">
        <p className="mx-auto max-w-md font-pixel text-[10px] leading-snug text-[#f4fff4]/90 sm:text-xs">
          {t('Daily routine in the habitat — be careful with ', 'Rotina diária no habitat — cuidado com ')}<SciTermM2 term={t('Microgravity', 'Microgravidade')}>{t('microgravity', 'microgravidade')}</SciTermM2>{t(', isolation, and sleep.', ', isolamento e sono.')}
        </p>
      </div>

      {!blocked && (
      <PixelDialogBox
        key={`m2-intro-${part}`}
        open={open}
        lines={lines}
        title="Capi"
        dialogId={`m2-intro-${part}`}
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
              {isLast ? t('Start the day', 'Começar o dia') : t('Continue', 'Continuar')}
            </McButton>
          ) : null
        }
      />
      )}
    </>
  )
}
