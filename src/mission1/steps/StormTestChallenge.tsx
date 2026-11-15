import { useEffect, useState } from 'react'
import { STORM_ALERT } from '../../data/mission1Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  baseEfficiency: number
  onDone: (choice: 'save' | 'max') => void
}

export function StormTestChallenge({ baseEfficiency, onDone }: Props) {
  const [alertOn, setAlertOn] = useState(false)
  const [gen, setGen] = useState(4.2)
  const [battery, setBattery] = useState(78)
  const [consume, setConsume] = useState(2.1)
  const [chose, setChose] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => {
      setAlertOn(true)
      soundEngine.fail()
      setGen((g) => +(g * 0.35).toFixed(2))
    }, 900)
    return () => clearTimeout(id)
  }, [])

  const pick = (choice: 'save' | 'max') => {
    if (chose) return
    setChose(true)
    if (choice === 'save') {
      setConsume(1.1)
      setBattery((b) => Math.min(100, b + 4))
    } else {
      setConsume(2.4)
      setBattery((b) => Math.max(8, b - 18))
    }
    window.setTimeout(() => onDone(choice), 700)
  }

  return (
    <div className="relative z-10 flex h-full min-h-0 flex-col gap-3 p-3 sm:p-4">
      <p className="font-pixel text-sm text-cyan-hud sm:text-base">Desafio 1.3 — Tempestade de poeira</p>
      <p className="text-xs text-void-300">Eficiência da instalação: {baseEfficiency}%</p>

      {alertOn && (
        <div className="animate-pulse rounded border-2 border-danger bg-danger/20 px-3 py-2 font-pixel text-xs text-[#ffd0d8] sm:text-sm">
          {STORM_ALERT}
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-3">
        <Meter label="Geração Solar (kW)" value={`${gen}`} fill={Math.min(100, (gen / 5) * 100)} color="#f0b429" />
        <Meter label="Bateria (%)" value={`${battery}`} fill={battery} color="#5ecf9a" />
        <Meter label="Consumo Habitat (kW)" value={`${consume}`} fill={Math.min(100, (consume / 3) * 100)} color="#7b8cff" />
      </div>

      {alertOn && !chose && (
        <div className="mt-auto grid gap-2 sm:grid-cols-2">
          <McButton className="min-h-14 font-pixel text-sm font-bold sm:text-base" onClick={() => pick('save')}>
            Reduzir luzes e aquecimento auxiliar
          </McButton>
          <McButton className="min-h-14 font-pixel text-sm font-bold sm:text-base" onClick={() => pick('max')}>
            Manter potência máxima (arriscar bateria)
          </McButton>
        </div>
      )}
    </div>
  )
}

function Meter({
  label,
  value,
  fill,
  color,
}: {
  label: string
  value: string
  fill: number
  color: string
}) {
  return (
    <div className="rounded border border-cyan-hud/35 bg-[#0a1628]/9 p-3">
      <p className="font-pixel text-[10px] text-void-300">{label}</p>
      <p className="mt-1 font-pixel text-xl text-[#f4fff4]">{value}</p>
      <div className="mt-2 h-3 overflow-hidden rounded bg-void-950">
        <div className="h-full transition-all duration-500" style={{ width: `${fill}%`, background: color }} />
      </div>
    </div>
  )
}
