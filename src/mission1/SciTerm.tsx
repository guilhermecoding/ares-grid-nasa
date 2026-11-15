import { useState, type ReactNode } from 'react'
import { SCI_TERMS } from '../data/mission1Data'

interface Props {
  term: keyof typeof SCI_TERMS
  children?: ReactNode
}

/** Underlined science word with a one-sentence kid-friendly tooltip. */
export function SciTerm({ term, children }: Props) {
  const [open, setOpen] = useState(false)
  const tip = SCI_TERMS[term]

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="cursor-help border-0 bg-transparent p-0 font-inherit text-inherit underline decoration-dotted decoration-cyan-hud underline-offset-2"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        aria-expanded={open}
      >
        {children ?? term}
      </button>
      {open && tip ? (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-40 mb-1 w-max max-w-[14rem] -translate-x-1/2 rounded border border-cyan-hud/50 bg-[#0a1628] px-2 py-1 font-pixel text-[10px] leading-snug text-[#f4fff4] shadow-lg"
        >
          {tip}
        </span>
      ) : null}
    </span>
  )
}
