import { useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import { McButton } from '../../opening/McButton'
import { PixelDialogBox } from '../../opening/PixelDialogBox'

interface Props {
  open: boolean
  lines: readonly string[]
  highlightWords?: readonly string[]
  buttonLabel?: string
  onDone: () => void
}

/** One short Capi bridge between mission stages. */
export function CapiBridgeDialog({
  open,
  lines,
  highlightWords,
  buttonLabel = 'Continuar',
  onDone,
}: Props) {
  const [ready, setReady] = useState(false)
  const [boxOpen, setBoxOpen] = useState(true)

  if (!open) return null

  return (
    <PixelDialogBox
      key={lines.join('|')}
      open={boxOpen}
      lines={[...lines]}
      title="Capi"
      characterSrc={MEDIA.capi.neutral}
      characterAlt="Capi"
      highlightWords={highlightWords}
      onTypingComplete={() => setReady(true)}
      onClosed={() => {
        setBoxOpen(true)
        setReady(false)
        onDone()
      }}
      footer={
        ready ? (
          <McButton
            className="min-h-12 px-6 font-pixel text-lg font-bold"
            style={{ touchAction: 'manipulation' }}
            onClick={() => setBoxOpen(false)}
          >
            {buttonLabel}
          </McButton>
        ) : null
      }
    />
  )
}
