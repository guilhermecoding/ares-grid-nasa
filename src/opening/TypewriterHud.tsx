import { useEffect, useState, type ReactNode } from 'react'
import { soundEngine } from '../services/soundEngine'

const SCRAMBLE_GLYPHS = '01アイウエオカキクケコ#@$%*+=<>/\\|░▒▓'

interface TypewriterHudProps {
  lines: readonly string[]
  charMs?: number
  linePauseMs?: number
  onComplete?: () => void
  className?: string
  /** Default = cyan HUD; matrix = white panel + scramble decode */
  variant?: 'hud' | 'matrix'
  footer?: ReactNode
}

function randomGlyph(): string {
  return SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)] ?? '#'
}

export function TypewriterHud({
  lines,
  charMs = 28,
  linePauseMs = 420,
  onComplete,
  className = '',
  variant = 'hud',
  footer,
}: TypewriterHudProps) {
  const isMatrix = variant === 'matrix'
  const effectiveCharMs = isMatrix ? Math.max(18, charMs - 6) : charMs
  const scrambleSteps = isMatrix ? 3 : 0

  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [scrambleStep, setScrambleStep] = useState(0)
  const [scrambleChar, setScrambleChar] = useState('')
  const [status, setStatus] = useState<'typing' | 'done'>('typing')

  useEffect(() => {
    if (status !== 'typing') return

    const line = lines[lineIdx]
    if (line === undefined) return

    if (charIdx < line.length) {
      if (scrambleSteps > 0 && scrambleStep < scrambleSteps) {
        const id = window.setTimeout(() => {
          setScrambleChar(randomGlyph())
          setScrambleStep((s) => s + 1)
          soundEngine.typeTick()
        }, Math.max(12, effectiveCharMs * 0.45))
        return () => clearTimeout(id)
      }

      const id = window.setTimeout(() => {
        setCharIdx((c) => c + 1)
        setScrambleStep(0)
        setScrambleChar('')
        if (isMatrix) soundEngine.typeTick()
      }, effectiveCharMs)
      return () => clearTimeout(id)
    }

    if (lineIdx >= lines.length - 1) {
      const id = window.setTimeout(() => setStatus('done'), linePauseMs)
      return () => clearTimeout(id)
    }

    const id = window.setTimeout(() => {
      setLineIdx((i) => i + 1)
      setCharIdx(0)
      setScrambleStep(0)
      setScrambleChar('')
    }, linePauseMs)
    return () => clearTimeout(id)
  }, [
    lines,
    lineIdx,
    charIdx,
    scrambleStep,
    scrambleSteps,
    effectiveCharMs,
    linePauseMs,
    status,
    isMatrix,
  ])

  useEffect(() => {
    if (status !== 'done') return
    onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- invoke once when done
  }, [status])

  const finished = status === 'done'

  const panelClass = isMatrix
    ? 'rounded-2xl border-2 border-white bg-black p-3 font-pixel text-sm leading-relaxed text-[#7dffa0] shadow-[0_4px_18px_rgba(0,0,0,0.45)] sm:rounded-3xl sm:p-4 sm:text-base'
    : 'rounded-xl border-2 border-cyan-hud/40 bg-void-950/80 p-4 font-mono text-sm leading-relaxed text-cyan-hud shadow-[0_0_24px_rgba(94,231,255,0.15)] backdrop-blur-sm sm:text-base'

  const cursorClass = isMatrix ? 'bg-[#7dffa0]' : 'bg-cyan-hud'
  const promptClass = isMatrix ? 'text-white/80' : 'text-star-dim'
  const firstLineClass = isMatrix ? 'font-bold text-white' : 'font-bold text-star'
  const scrambleClass = isMatrix ? 'text-[#3dff7a]/70' : 'text-cyan-hud/70'

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className={panelClass} role="log" aria-live="polite">
        {isMatrix && (
          <p className="mb-2 border-b border-white/30 pb-1 font-pixel text-[10px] tracking-widest text-white/50 uppercase">
            SYS // MISSION BRIEF
          </p>
        )}
        {lines.slice(0, Math.min(lineIdx + 1, lines.length)).map((line, i) => {
          const committed = i < lineIdx || finished ? line : line.slice(0, charIdx)
          const isCurrent = i === lineIdx && !finished
          const showScramble = isCurrent && scrambleChar.length > 0
          return (
            <p key={i} className={i === 0 ? firstLineClass : ''}>
              <span className={`mr-2 ${promptClass}`}>{'>'}</span>
              {committed}
              {showScramble && <span className={scrambleClass}>{scrambleChar}</span>}
              {isCurrent && (
                <span className={`ml-0.5 inline-block w-2 animate-pulse ${cursorClass}`}>▌</span>
              )}
            </p>
          )
        })}
      </div>
      {footer ? <div className="flex justify-start">{footer}</div> : null}
    </div>
  )
}
