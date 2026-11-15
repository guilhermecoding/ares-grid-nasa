import { useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import { RISK_HIGHLIGHT_WORDS, RISK_WARNING_PARTS } from '../../data/mission1Data'
import { McButton } from '../../opening/McButton'
import { PixelDialogBox } from '../../opening/PixelDialogBox'

interface Props {
  onContinue: () => void
}

/** Capi warns about surface risks before the player picks a panel site. */
export function RiskWarningHud({ onContinue }: Props) {
  const [part, setPart] = useState(0)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)

  const lines = RISK_WARNING_PARTS[part]!
  const isLast = part >= RISK_WARNING_PARTS.length - 1

  return (
    <PixelDialogBox
      key={`m1-risk-${part}`}
      open={open}
      lines={[...lines]}
      title="Capi"
      characterSrc={MEDIA.capi.duvida}
      characterAlt="Capi"
      highlightWords={part === 1 ? RISK_HIGHLIGHT_WORDS : undefined}
      onTypingComplete={() => setReady(true)}
      onClosed={() => {
        if (!isLast) {
          setReady(false)
          setPart((p) => p + 1)
          setOpen(true)
          return
        }
        onContinue()
      }}
      footer={
        ready ? (
          <McButton
            className="min-h-12 px-6 font-pixel text-lg font-bold"
            style={{ touchAction: 'manipulation' }}
            onClick={() => setOpen(false)}
          >
            {isLast ? 'Entendi — sair!' : 'Continuar'}
          </McButton>
        ) : null
      }
    />
  )
}
