import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { soundEngine } from '../services/soundEngine'

const CHAR_MS = 10
const LINE_PAUSE_MS = 160
const TV_MS = 0.4

interface PixelDialogBoxProps {
  open: boolean
  lines?: readonly string[]
  title?: string
  characterSrc?: string
  characterAlt?: string
  footer?: ReactNode
  onOpened?: () => void
  onClosed?: () => void
  onTypingComplete?: () => void
  className?: string
}

function CornerRivet({ className }: { className: string }) {
  return (
    <span
      className={`pointer-events-none absolute h-2.5 w-2.5 border-[#c8a090]/80 ${className}`}
      aria-hidden
    />
  )
}

export function PixelDialogBox({
  open,
  lines = [],
  title,
  characterSrc,
  characterAlt = '',
  footer,
  onOpened,
  onClosed,
  onTypingComplete,
  className = '',
}: PixelDialogBoxProps) {
  const [entered, setEntered] = useState(false)
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [typingDone, setTypingDone] = useState(false)
  const [visible, setVisible] = useState(open)
  const [imgFailed, setImgFailed] = useState(false)
  const wasOpenRef = useRef(open)
  const onTypingCompleteRef = useRef(onTypingComplete)
  onTypingCompleteRef.current = onTypingComplete

  useEffect(() => {
    if (open) {
      setVisible(true)
      if (!wasOpenRef.current) soundEngine.dialogOpen()
    } else if (wasOpenRef.current && visible) {
      soundEngine.dialogClose()
    }
    wasOpenRef.current = open
  }, [open, visible])

  const linesKey = lines.join('\0')

  useEffect(() => {
    if (!open || !entered) return
    setLineIdx(0)
    setCharIdx(0)
    setTypingDone(false)
  }, [open, entered, linesKey])

  useEffect(() => {
    if (!entered || !open || typingDone || lines.length === 0) return

    const line = lines[lineIdx]
    if (line === undefined) return

    if (charIdx < line.length) {
      const id = window.setTimeout(() => {
        setCharIdx((c) => c + 1)
        soundEngine.typeTick()
      }, CHAR_MS)
      return () => clearTimeout(id)
    }

    if (lineIdx >= lines.length - 1) {
      const id = window.setTimeout(() => {
        setTypingDone(true)
        onTypingCompleteRef.current?.()
      }, LINE_PAUSE_MS)
      return () => clearTimeout(id)
    }

    const id = window.setTimeout(() => {
      setLineIdx((i) => i + 1)
      setCharIdx(0)
    }, LINE_PAUSE_MS)
    return () => clearTimeout(id)
  }, [entered, open, typingDone, lines, lineIdx, charIdx])

  if (!visible) return null

  return (
    <div className={`pointer-events-none absolute inset-0 z-[70] ${className}`}>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="dialog-dim"
            className="pointer-events-none absolute inset-0 bg-zinc-600/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            aria-hidden
          />
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3 pb-4 sm:p-5 sm:pb-6">
      <AnimatePresence
        onExitComplete={() => {
          setVisible(false)
          setEntered(false)
          onClosed?.()
        }}
      >
        {open && (
          <motion.div
            key="pixel-tv"
            className="pointer-events-auto relative w-full max-w-2xl origin-center overflow-visible"
            style={{ imageRendering: 'pixelated' }}
            initial={{ scaleY: 0.02, scaleX: 0.96, opacity: 0.85 }}
            animate={{ scaleY: 1, scaleX: 1, opacity: 1 }}
            exit={{ scaleY: 0.02, scaleX: 0.96, opacity: 0.85 }}
            transition={{ duration: TV_MS, ease: [0.22, 0.08, 0.25, 1] }}
            onAnimationComplete={(def) => {
              if (!open) return
              if (def === 'exit') return
              if (!entered) {
                setEntered(true)
                onOpened?.()
              }
            }}
          >
            {/* Character breaks the frame (right side) */}
            {characterSrc && !imgFailed ? (
              <img
                src={characterSrc}
                alt={characterAlt}
                className="pointer-events-none absolute -top-10 -right-1 z-20 h-28 w-28 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)] sm:-top-14 sm:right-0 sm:h-36 sm:w-36"
                draggable={false}
                onError={() => setImgFailed(true)}
              />
            ) : null}

            {/* Outer dark outline */}
            <div className="relative rounded-md bg-[#1a1c3a] p-[3px] shadow-[0_8px_32px_rgba(0,0,0,0.55)]">
              {/* Mint / cream border */}
              <div className="rounded-[5px] bg-[#f4fff4] p-[5px] sm:p-[7px]">
                {/* Inner dark outline */}
                <div className="rounded-sm bg-[#1a1c3a] p-[2px]">
                  {/* Indigo panel */}
                  <div
                    className={`relative min-h-[120px] rounded-sm bg-[#30346d] px-4 pt-3 pb-3 sm:min-h-[132px] sm:px-5 sm:pt-4 sm:pb-4 ${
                      characterSrc ? 'pr-24 sm:pr-32' : ''
                    }`}
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 18% 22%, rgba(244,255,244,0.1) 0 1px, transparent 1.5px),
                        radial-gradient(circle at 72% 38%, rgba(244,255,244,0.08) 0 1px, transparent 1.5px),
                        radial-gradient(circle at 40% 78%, rgba(244,255,244,0.07) 0 1px, transparent 1.5px),
                        radial-gradient(circle at 85% 70%, rgba(244,255,244,0.08) 0 1px, transparent 1.5px)
                      `,
                    }}
                  >
                    <CornerRivet className="top-1.5 left-1.5 border-t-2 border-l-2" />
                    <CornerRivet className="top-1.5 right-1.5 border-t-2 border-r-2" />
                    <CornerRivet className="bottom-1.5 left-1.5 border-b-2 border-l-2" />
                    <CornerRivet className="right-1.5 bottom-1.5 border-r-2 border-b-2" />

                    {title ? (
                      <p className="mb-1.5 border-b border-[#f4fff4]/25 pb-1 font-pixel text-[10px] tracking-widest text-[#f4fff4]/70 uppercase sm:text-xs">
                        {title}
                      </p>
                    ) : null}

                    <div className="font-pixel text-sm leading-relaxed text-[#f4fff4] sm:text-base" role="log" aria-live="polite">
                      {lines.slice(0, Math.min(lineIdx + 1, lines.length)).map((line, i) => {
                        const text = i < lineIdx || typingDone ? line : line.slice(0, charIdx)
                        const isCurrent = i === lineIdx && entered && !typingDone
                        return (
                          <p key={i} className={i === 0 ? '' : 'mt-1 opacity-95'}>
                            {text}
                            {isCurrent && <span className="ml-0.5 inline-block w-2 animate-pulse bg-[#f4fff4]">▌</span>}
                          </p>
                        )
                      })}
                    </div>

                    {footer ? <div className="relative z-[1] mt-3 flex justify-center">{footer}</div> : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Brief CRT scan flash on open */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-md bg-[#f4fff4]"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}
