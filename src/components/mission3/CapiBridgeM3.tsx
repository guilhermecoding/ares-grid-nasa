import { useEffect, useRef, useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import { McButton } from '../../opening/McButton'
import { PixelDialogBox } from '../../opening/PixelDialogBox'
import { dialogGroupOf, isDialogGroupSkipped } from '../../services/progressStore'

interface Props {
  lines: string[]
  highlightWords?: readonly string[]
  onDone: () => void
  dialogId?: string
}

/** Short Capí bridge between Mission 03 stages. */
export function CapiBridgeM3({ lines, highlightWords, onDone, dialogId }: Props) {
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)
  const onDoneRef = useRef(onDone)
  const group = dialogId ? dialogGroupOf(dialogId) : null
  const skipped = Boolean(group && isDialogGroupSkipped(group))

  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    if (skipped) onDoneRef.current()
  }, [skipped])

  if (skipped) return null

  return (
    <PixelDialogBox
      open={open}
      lines={[...lines]}
      title="Capi"
      dialogId={dialogId ?? `capi:${lines[0] ?? ''}`}
      onSkip={() => setOpen(false)}
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
