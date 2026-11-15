import { useEffect, useState } from 'react'
import { EXPEDITION_MISSIONS } from '../../data/mission5Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  onDone: () => void
}

const PHASES = [
  'Pacote preparado',
  'Buscando sinal com a Terra',
  'Conexão estabelecida e dados recebidos',
] as const

export function EarthTransmission({ onDone }: Props) {
  const [phase, setPhase] = useState(-1)

  useEffect(() => {
    if (phase < 0 || phase >= PHASES.length - 1) return
    const id = window.setTimeout(() => {
      soundEngine.telemetry()
      setPhase((value) => value + 1)
    }, 900)
    return () => window.clearTimeout(id)
  }, [phase])

  return (
    <div className="mx-auto w-full max-w-xl border-4 border-[#30346d] bg-[#0a1628]/92 p-4">
      <p className="font-pixel text-sm text-cyan-hud">Relatório da expedição</p>
      <ul className="mt-3 grid gap-2">
        {EXPEDITION_MISSIONS.map((mission) => (
          <li key={mission} className="min-h-12 border-2 border-life px-3 py-2 text-sm text-[#7dffb0]">
            ✓ {mission}
          </li>
        ))}
      </ul>
      {phase < 0 ? (
        <McButton
          className="mt-4"
          onClick={() => {
            soundEngine.click()
            setPhase(0)
          }}
        >
          Transmitir relatório para a Terra
        </McButton>
      ) : (
        <p className="mt-4 font-pixel text-sm text-energy">{PHASES[phase]}</p>
      )}
      {phase >= PHASES.length - 1 ? (
        <McButton className="mt-4" onClick={onDone}>
          Ver a base pronta
        </McButton>
      ) : null}
    </div>
  )
}
