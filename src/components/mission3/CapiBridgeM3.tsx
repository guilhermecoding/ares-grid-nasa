import { useEffect, useMemo, useRef, useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import { useI18n } from '../../i18n/locale'
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
  const { t } = useI18n()
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)
  const onDoneRef = useRef(onDone)
  const group = dialogId ? dialogGroupOf(dialogId) : null
  const skipped = Boolean(group && isDialogGroupSkipped(group))
  const linesKey = lines.join('\0')
  const lineCount = lines.length
  const highlightKey = highlightWords?.join('\0') ?? ''
  const hasHighlights = highlightWords != null
  const stableLines = useMemo(
    () => (lineCount === 0 ? [] : linesKey.split('\0')),
    [lineCount, linesKey],
  )
  const stableHighlights = useMemo(
    () => (hasHighlights ? (highlightKey ? highlightKey.split('\0') : []) : undefined),
    [hasHighlights, highlightKey],
  )

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
      lines={stableLines}
      title="Capi"
      dialogId={dialogId ?? `capi:${stableLines[0] ?? ''}`}
      onSkip={() => setOpen(false)}
      characterSrc={MEDIA.capi.neutral}
      characterAlt="Capi"
      highlightWords={stableHighlights}
      onTypingComplete={() => setReady(true)}
      onClosed={onDone}
      footer={
        ready ? (
          <McButton
            className="min-h-12 px-6 font-pixel text-lg font-bold"
            style={{ touchAction: 'manipulation' }}
            onClick={() => setOpen(false)}
          >
            {t('OK', 'Ok')}
          </McButton>
        ) : null
      }
    />
  )
}
