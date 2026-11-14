import { useEffect, useState } from 'react'

interface TypewriterHudProps {
  lines: readonly string[]
  charMs?: number
  linePauseMs?: number
  onComplete?: () => void
  className?: string
}

export function TypewriterHud({
  lines,
  charMs = 28,
  linePauseMs = 420,
  onComplete,
  className = '',
}: TypewriterHudProps) {
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [status, setStatus] = useState<'typing' | 'done'>('typing')

  useEffect(() => {
    if (status !== 'typing') return

    const line = lines[lineIdx]
    if (line === undefined) return

    if (charIdx < line.length) {
      const id = window.setTimeout(() => setCharIdx((c) => c + 1), charMs)
      return () => clearTimeout(id)
    }

    if (lineIdx >= lines.length - 1) {
      const id = window.setTimeout(() => setStatus('done'), linePauseMs)
      return () => clearTimeout(id)
    }

    const id = window.setTimeout(() => {
      setLineIdx((i) => i + 1)
      setCharIdx(0)
    }, linePauseMs)
    return () => clearTimeout(id)
  }, [lines, lineIdx, charIdx, charMs, linePauseMs, status])

  useEffect(() => {
    if (status !== 'done') return
    onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- invoke once when done
  }, [status])

  const finished = status === 'done'

  return (
    <div
      className={`rounded-xl border-2 border-cyan-hud/40 bg-void-950/80 p-4 font-mono text-sm leading-relaxed text-cyan-hud shadow-[0_0_24px_rgba(94,231,255,0.15)] backdrop-blur-sm sm:text-base ${className}`}
      role="log"
      aria-live="polite"
    >
      {lines.slice(0, Math.min(lineIdx + 1, lines.length)).map((line, i) => {
        const text = i < lineIdx || finished ? line : line.slice(0, charIdx)
        const isCurrent = i === lineIdx && !finished
        return (
          <p key={i} className={i === 0 ? 'font-bold text-star' : ''}>
            <span className="mr-2 text-star-dim">{'>'}</span>
            {text}
            {isCurrent && <span className="ml-0.5 inline-block w-2 animate-pulse bg-cyan-hud">▌</span>}
          </p>
        )
      })}
    </div>
  )
}
