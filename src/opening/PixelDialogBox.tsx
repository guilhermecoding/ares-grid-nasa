import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
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

function Rivet({ className }: { className: string }) {
  return (
    <span className={`pointer-events-none absolute font-pixel text-[10px] leading-none text-[#f4fff4] select-none ${className}`} aria-hidden>
      +
    </span>
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

  useEffect(() => {
    if (open) setVisible(true)
  }, [open])

  useEffect(() => {
    if (!open || !entered) return
    setLineIdx(0)
    setCharIdx(0)
    setTypingDone(false)
  }, [open, entered, lines])

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
        onTypingComplete?.()
      }, LINE_PAUSE_MS)
      return () => clearTimeout(id)
    }

    const id = window.setTimeout(() => {
      setLineIdx((i) => i + 1)
      setCharIdx(0)
    }, LINE_PAUSE_MS)
    return () => clearTimeout(id)
  }, [entered, open, typingDone, lines, lineIdx, charIdx, onTypingComplete])

  if (!visible) return null

  return (
    <div className={`pointer-events-auto absolute inset-0 z-20 flex items-center justify-center p-4 ${className}`}>
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
            className="relative w-full max-w-lg origin-center"
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
            {/* Outer dark outline */}
            <div className="rounded-md bg-[#1a1c3a] p-[3px] shadow-[0_8px_32px_rgba(0,0,0,0.55)]">
              {/* Mint border */}
              <div className="rounded-[5px] bg-[#f4fff4] p-[6px] sm:p-[8px]">
                {/* Inner dark outline */}
                <div className="rounded-sm bg-[#1a1c3a] p-[2px]">
                  {/* Indigo panel */}
                  <div
                    className="relative min-h-[160px] rounded-sm bg-[#30346d] px-4 pt-4 pb-3 sm:min-h-[180px] sm:px-5 sm:pt-5 sm:pb-4"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 18% 22%, rgba(244,255,244,0.12) 0 1px, transparent 1.5px),
                        radial-gradient(circle at 72% 38%, rgba(244,255,244,0.1) 0 1px, transparent 1.5px),
                        radial-gradient(circle at 40% 78%, rgba(244,255,244,0.08) 0 1px, transparent 1.5px),
                        radial-gradient(circle at 85% 70%, rgba(244,255,244,0.09) 0 1px, transparent 1.5px)
                      `,
                    }}
                  >
                    <Rivet className="top-2 left-2" />
                    <Rivet className="top-2 right-2" />
                    <Rivet className="bottom-2 left-2" />
                    <Rivet className="right-2 bottom-2" />

                    {title ? (
                      <p className="mb-2 border-b border-[#f4fff4]/25 pb-1 font-pixel text-[10px] tracking-widest text-[#f4fff4]/70 uppercase sm:text-xs">
                        {title}
                      </p>
                    ) : null}

                    <div
                      className={`font-pixel text-sm leading-relaxed text-[#f4fff4] sm:text-base ${characterSrc ? 'pr-16 sm:pr-20' : ''}`}
                      role="log"
                      aria-live="polite"
                    >
                      {lines.slice(0, Math.min(lineIdx + 1, lines.length)).map((line, i) => {
                        const text = i < lineIdx || typingDone ? line : line.slice(0, charIdx)
                        const isCurrent = i === lineIdx && entered && !typingDone
                        return (
                          <p key={i} className={i === 0 ? 'font-bold' : 'mt-1 opacity-95'}>
                            <span className="mr-2 text-[#f4fff4]/60">{'>'}</span>
                            {text}
                            {isCurrent && <span className="ml-0.5 inline-block w-2 animate-pulse bg-[#f4fff4]">▌</span>}
                          </p>
                        )
                      })}
                    </div>

                    {footer ? <div className="relative z-[1] mt-4 flex justify-end">{footer}</div> : null}

                    {characterSrc ? (
                      <img
                        src={characterSrc}
                        alt={characterAlt}
                        className="pointer-events-none absolute right-1 bottom-1 h-14 w-14 object-contain sm:h-16 sm:w-16"
                        draggable={false}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Brief CRT scan flash on open */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-md bg-[#f4fff4]"
              initial={{ opacity: 0.35 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
