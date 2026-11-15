import { useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import { RISK_HIGHLIGHT_WORDS, RISK_WARNING_LINES } from '../../data/mission1Data'
import { McButton } from '../../opening/McButton'
import { PixelDialogBox } from '../../opening/PixelDialogBox'

interface Props {
  onContinue: () => void
}

/** Capi warns about surface risks before the player picks a panel site. */
export function RiskWarningHud({ onContinue }: Props) {
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)

  return (
    <PixelDialogBox
      open={open}
      lines={[...RISK_WARNING_LINES]}
      title="Capi"
      characterSrc={MEDIA.capi.duvida}
      characterAlt="Capi"
      highlightWords={RISK_HIGHLIGHT_WORDS}
      onTypingComplete={() => setReady(true)}
      onClosed={onContinue}
      footer={
        ready ? (
          <McButton
            className="min-h-12 px-6 font-pixel text-lg font-bold"
            style={{ touchAction: 'manipulation' }}
            onClick={() => setOpen(false)}
          >
            Entendi — sair!
          </McButton>
        ) : null
      }
    />
  )
}
