import { useMemo, useState } from 'react'
import { MEDIA } from '../constants/mediaAssets'
import { McButton } from './McButton'
import { PixelDialogBox } from './PixelDialogBox'

interface CapiDialogProps {
  lines: readonly string[]
  onComplete: () => void
  /** Optional single confirm message instead of multi-line flow */
  confirmMode?: boolean
  continueLabel?: string
}

/** Capi speech popup — thin wrapper over the shared PixelDialogBox pattern. */
export function CapiDialog({
  lines,
  onComplete,
  confirmMode = false,
  continueLabel = 'Continuar',
}: CapiDialogProps) {
  const [open, setOpen] = useState(true)
  const [idx, setIdx] = useState(0)
  const [ready, setReady] = useState(false)

  const line = lines[Math.min(idx, lines.length - 1)] ?? ''
  const pageLines = useMemo(() => [line] as const, [line])
  const isLast = idx >= lines.length - 1

  const advance = () => {
    if (isLast || confirmMode) {
      setOpen(false)
      return
    }
    setReady(false)
    setIdx((i) => i + 1)
  }

  return (
    <PixelDialogBox
      open={open}
      lines={pageLines}
      title="Capi"
      characterSrc={MEDIA.capi.neutral}
      characterAlt="Capi"
      onTypingComplete={() => setReady(true)}
      onClosed={onComplete}
      footer={
        ready ? (
          <McButton className="min-h-12 min-w-[140px] px-5 font-pixel text-lg font-bold" onClick={advance}>
            {confirmMode ? 'OK!' : continueLabel}
          </McButton>
        ) : null
      }
    />
  )
}
