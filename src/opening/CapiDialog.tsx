import { useState } from 'react'
import { MEDIA } from '../constants/mediaAssets'

interface CapiDialogProps {
  lines: readonly string[]
  onComplete: () => void
  /** Optional single confirm message instead of multi-line flow */
  confirmMode?: boolean
  continueLabel?: string
}

export function CapiDialog({
  lines,
  onComplete,
  confirmMode = false,
  continueLabel = 'Continuar',
}: CapiDialogProps) {
  const [idx, setIdx] = useState(0)
  const [imgFailed, setImgFailed] = useState(false)
  const line = lines[Math.min(idx, lines.length - 1)] ?? ''
  const isLast = idx >= lines.length - 1

  const advance = () => {
    if (isLast || confirmMode) {
      onComplete()
      return
    }
    setIdx((i) => i + 1)
  }

  return (
    <div className="pointer-events-auto absolute right-3 bottom-3 z-20 flex max-w-[min(100%,420px)] flex-col items-end gap-2 sm:right-5 sm:bottom-5">
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1 rounded-2xl border-2 border-cyan-hud/50 bg-void-900/90 px-4 py-3 shadow-[0_0_28px_rgba(94,231,255,0.2)] backdrop-blur-md">
          <p className="mb-1 font-pixel text-xs tracking-wide text-cyan-hud uppercase">Capi</p>
          <p className="font-body text-sm leading-snug text-void-100 sm:text-base">{line}</p>
        </div>
        <div className="relative shrink-0">
          <div className="absolute -inset-2 rounded-full bg-cyan-hud/25 blur-lg" aria-hidden />
          {!imgFailed ? (
            <img
              src={MEDIA.capi.neutral}
              alt="Capi"
              className="relative h-20 w-20 object-contain sm:h-24 sm:w-24"
              onError={() => setImgFailed(true)}
              draggable={false}
            />
          ) : (
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyan-hud bg-void-800 font-pixel text-2xl text-cyan-hud sm:h-24 sm:w-24">
              C
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        className="pixel-btn min-h-12 min-w-[140px] rounded-xl bg-star px-5 font-pixel text-lg font-bold text-void-950"
        onClick={advance}
      >
        {isLast || confirmMode ? (confirmMode ? 'OK!' : continueLabel) : continueLabel}
      </button>
    </div>
  )
}
