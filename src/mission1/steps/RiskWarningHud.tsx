import { useMemo, useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import { RISK_HIGHLIGHT_WORDS, RISK_WARNING_PARTS } from '../../data/mission1Data'
import { useI18n } from '../../i18n/locale'
import { McButton } from '../../opening/McButton'
import { PixelDialogBox } from '../../opening/PixelDialogBox'
import { useHideFollowingDialogs } from '../../opening/useHideFollowingDialogs'

interface Props {
  onContinue: () => void
}

/** Capi warns about surface risks before the player picks a panel site. */
export function RiskWarningHud({ onContinue }: Props) {
  const { t, locale } = useI18n()
  const [part, setPart] = useState(0)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)

  const partCopy = RISK_WARNING_PARTS[part]!
  const lines = useMemo(() => partCopy.map((line) => t(line.en, line.pt)), [partCopy, t])
  const isLast = part >= RISK_WARNING_PARTS.length - 1
  const { blocked, hideDialog, afterClose } = useHideFollowingDialogs('m1', onContinue)

  if (blocked) return null

  return (
    <PixelDialogBox
      key={`m1-risk-${part}`}
      open={open}
      lines={lines}
      title="Capi"
      dialogId={`m1-risk-${part}`}
      onSkip={() => {
        hideDialog()
        setOpen(false)
      }}
      characterSrc={MEDIA.capi.duvida}
      characterAlt="Capi"
      highlightWords={part === 1 ? RISK_HIGHLIGHT_WORDS[locale] : undefined}
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
            {isLast ? t('Got it — let’s go!', 'Entendi — sair!') : t('Continue', 'Continuar')}
          </McButton>
        ) : null
      }
    />
  )
}
