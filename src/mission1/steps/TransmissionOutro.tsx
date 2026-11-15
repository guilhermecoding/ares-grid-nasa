import { useEffect, useState } from 'react'
import { TRANSMISSION_LINES } from '../../data/mission1Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  onDone: () => void
}

export function TransmissionOutro({ onDone }: Props) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (idx >= TRANSMISSION_LINES.length - 1) return
    soundEngine.telemetry()
    const id = window.setTimeout(() => setIdx((i) => i + 1), 1400)
    return () => clearTimeout(id)
  }, [idx])

  const done = idx >= TRANSMISSION_LINES.length - 1

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-void-950/80 p-4">
      <div className="w-full max-w-md border-2 border-cyan-hud bg-[#0a1628] p-5 text-center">
        <p className="font-pixel text-xs tracking-widest text-cyan-hud uppercase">Transmissão</p>
        <div className="mt-4 space-y-2 font-pixel text-sm text-[#f4fff4] sm:text-base">
          {TRANSMISSION_LINES.slice(0, idx + 1).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        {done && (
          <McButton className="mt-6 min-h-12 w-full font-pixel text-lg font-bold" onClick={onDone}>
            Voltar ao mapa
          </McButton>
        )}
      </div>
    </div>
  )
}
