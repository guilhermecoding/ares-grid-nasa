import { useEffect, useState } from 'react'
import { MEDIA } from '../constants/mediaAssets'
import { soundEngine } from '../services/soundEngine'

const CHAR_MS = 28

interface CapiDialogProps {
  lines: readonly string[]
  onComplete: () => void
  /** Optional single confirm message instead of multi-line flow */
  confirmMode?: boolean
  continueLabel?: string
}

/** Square HUD frame with corner brackets + segmented lines (matches Capi avatar frame). */
function HudFrame() {
  const corner = 'absolute h-3 w-3 border-cyan-hud sm:h-3.5 sm:w-3.5'
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0 border-2 border-cyan-hud" />
      <div className="absolute inset-1 border border-cyan-hud/55" />

      <div className="absolute top-0 left-1/4 h-0 w-2 -translate-x-1/2 border-t-2 border-cyan-hud sm:w-2.5" />
      <div className="absolute top-0 left-1/2 h-0 w-3 -translate-x-1/2 border-t-2 border-cyan-hud sm:w-4" />
      <div className="absolute top-0 left-3/4 h-0 w-2 -translate-x-1/2 border-t-2 border-cyan-hud sm:w-2.5" />
      <div className="absolute bottom-0 left-1/4 h-0 w-2 -translate-x-1/2 border-b-2 border-cyan-hud sm:w-2.5" />
      <div className="absolute bottom-0 left-1/2 h-0 w-3 -translate-x-1/2 border-b-2 border-cyan-hud sm:w-4" />
      <div className="absolute bottom-0 left-3/4 h-0 w-2 -translate-x-1/2 border-b-2 border-cyan-hud sm:w-2.5" />
      <div className="absolute top-1/4 left-0 h-2 w-0 -translate-y-1/2 border-l-2 border-cyan-hud sm:h-2.5" />
      <div className="absolute top-1/2 left-0 h-3 w-0 -translate-y-1/2 border-l-2 border-cyan-hud sm:h-4" />
      <div className="absolute top-3/4 left-0 h-2 w-0 -translate-y-1/2 border-l-2 border-cyan-hud sm:h-2.5" />
      <div className="absolute top-1/4 right-0 h-2 w-0 -translate-y-1/2 border-r-2 border-cyan-hud sm:h-2.5" />
      <div className="absolute top-1/2 right-0 h-3 w-0 -translate-y-1/2 border-r-2 border-cyan-hud sm:h-4" />
      <div className="absolute top-3/4 right-0 h-2 w-0 -translate-y-1/2 border-r-2 border-cyan-hud sm:h-2.5" />

      <div className={`${corner} top-0 left-0 border-t-[3px] border-l-[3px]`} />
      <div className={`${corner} top-0 right-0 border-t-[3px] border-r-[3px]`} />
      <div className={`${corner} bottom-0 left-0 border-b-[3px] border-l-[3px]`} />
      <div className={`${corner} right-0 bottom-0 border-r-[3px] border-b-[3px]`} />
    </div>
  )
}

export function CapiDialog({
  lines,
  onComplete,
  confirmMode = false,
  continueLabel = 'Continuar',
}: CapiDialogProps) {
  const [idx, setIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [imgFailed, setImgFailed] = useState(false)

  const line = lines[Math.min(idx, lines.length - 1)] ?? ''
  const isLast = idx >= lines.length - 1
  const typingDone = charIdx >= line.length
  const visible = line.slice(0, charIdx)

  useEffect(() => {
    if (charIdx >= line.length) return
    const id = window.setTimeout(() => {
      setCharIdx((c) => c + 1)
      soundEngine.typeTick()
    }, CHAR_MS)
    return () => clearTimeout(id)
  }, [charIdx, line])

  const advance = () => {
    if (!typingDone) {
      setCharIdx(line.length)
      return
    }
    if (isLast || confirmMode) {
      onComplete()
      return
    }
    setIdx((i) => i + 1)
    setCharIdx(0)
  }

  const buttonLabel = !typingDone
    ? '…'
    : isLast || confirmMode
      ? confirmMode
        ? 'OK!'
        : continueLabel
      : continueLabel

  return (
    <div className="pointer-events-auto absolute right-3 bottom-3 z-20 flex max-w-[min(100%,440px)] items-end gap-3 sm:right-5 sm:bottom-5">
      <div className="relative min-w-0 flex-1 bg-[#0a1628]/95 px-4 pt-3 pb-3 shadow-[0_0_28px_rgba(94,231,255,0.35)]">
        <div className="pointer-events-none absolute -inset-1 bg-cyan-hud/10 blur-md" aria-hidden />
        <HudFrame />
        <div className="relative z-[1]">
          <p className="mb-1 font-pixel text-xs tracking-wide text-cyan-hud uppercase">Capi</p>
          <p className="min-h-[2.75rem] font-pixel text-sm leading-snug text-void-100 sm:min-h-[3rem] sm:text-base" aria-live="polite">
            {visible}
            {!typingDone && <span className="ml-0.5 inline-block w-2 animate-pulse bg-cyan-hud">▌</span>}
          </p>
          <div className="mt-3 flex justify-end">
            <button type="button" className="mc-btn min-h-12 min-w-[140px] px-5 font-pixel text-lg font-bold" onClick={advance}>
              {buttonLabel}
            </button>
          </div>
        </div>
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
          <div className="relative flex h-20 w-20 items-center justify-center border-2 border-cyan-hud bg-void-800 font-pixel text-2xl text-cyan-hud sm:h-24 sm:w-24">
            C
          </div>
        )}
      </div>
    </div>
  )
}
