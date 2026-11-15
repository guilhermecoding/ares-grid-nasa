import { useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import { McButton } from '../../opening/McButton'
import { PixelDialogBox } from '../../opening/PixelDialogBox'

interface Props {
  lines: string[]
  highlightWords?: readonly string[]
  onDone: () => void
}

/** Short Capí bridge between Mission 03 stages. */
export function CapiBridgeM3({ lines, highlightWords, onDone }: Props) {
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)

  return (
    <PixelDialogBox
      open={open}
      lines={[...lines]}
      title="Capi"
      characterSrc={MEDIA.capi.neutral}
      characterAlt="Capi"
      highlightWords={highlightWords ? [...highlightWords] : undefined}
      onTypingComplete={() => setReady(true)}
      onClosed={onDone}
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
  )
}
