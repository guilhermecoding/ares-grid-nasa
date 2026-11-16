import { useEffect, useMemo, useRef, useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import { useI18n } from '../../i18n/locale'
import { McButton } from '../../opening/McButton'
import { PixelDialogBox } from '../../opening/PixelDialogBox'
import { dialogGroupOf, isDialogGroupSkipped } from '../../services/progressStore'

interface Props {
  open: boolean
  lines: readonly string[]
  highlightWords?: readonly string[]
  buttonLabel?: string
  onDone: () => void
  dialogId?: string
}

/** One short Capi bridge between mission stages. */
export function CapiBridgeDialog({
  open,
  lines,
  highlightWords,
  buttonLabel,
  onDone,
  dialogId,
}: Props) {
  const { t } = useI18n()
  const dialogLines = useMemo(() => [...lines], [lines])
  const [ready, setReady] = useState(false)
  const [boxOpen, setBoxOpen] = useState(true)
  const onDoneRef = useRef(onDone)
  const group = dialogId ? dialogGroupOf(dialogId) : null
  const skipped = Boolean(group && isDialogGroupSkipped(group))

  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    if (skipped) onDoneRef.current()
  }, [skipped])

  if (!open || skipped) return null

  return (
    <PixelDialogBox
      key={lines.join('|')}
      open={boxOpen}
      lines={dialogLines}
      title="Capi"
      dialogId={dialogId ?? `capi:${lines[0] ?? ''}`}
      onSkip={() => setBoxOpen(false)}
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
            {buttonLabel ?? t('Continue', 'Continuar')}
          </McButton>
        ) : null
      }
    />
  )
}
