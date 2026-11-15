import { useEffect, useRef, useState } from 'react'
import { SHELTERS } from '../../data/mission5Data'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  onFail: (reason: string) => void
  onSafe: () => void
}

const ROCKS = [
  { x: 38, y: 32 },
  { x: 58, y: 68 },
]

export function RadiationRun({ onFail, onSafe }: Props) {
  const [pos, setPos] = useState({ x: 8, y: 50 })
  const [bar, setBar] = useState(12)
  const target = useRef<{ x: number; y: number } | null>(null)
  const posRef = useRef(pos)
  const barRef = useRef(12)
  const failed = useRef(false)
  const failRef = useRef(onFail)
  const safeRef = useRef(onSafe)
  useEffect(() => {
    failRef.current = onFail
    safeRef.current = onSafe
  })

  useEffect(() => {
    const id = window.setInterval(() => soundEngine.siren(), 1400)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    let frame = 0
    const tick = () => {
      const goal = target.current
      barRef.current = Math.min(100, barRef.current + 0.35)
      setBar(barRef.current)
      if (barRef.current >= 100 && !failed.current) {
        failed.current = true
        failRef.current('A barra de radiação encheu. Corra de novo até o abrigo certo.')
      }
      if (goal && !failed.current) {
        const current = posRef.current
        const dx = goal.x - current.x
        const dy = goal.y - current.y
        const step = 1.6
        const dist = Math.hypot(dx, dy) || 1
        let x = current.x + (dx / dist) * Math.min(step, dist)
        let y = current.y + (dy / dist) * Math.min(step, dist)
        for (const rock of ROCKS) {
          if (Math.hypot(x - rock.x, y - rock.y) < 8) {
            x = current.x
            y = current.y
          }
        }
        const next = { x: Math.max(4, Math.min(92, x)), y: Math.max(8, Math.min(92, y)) }
        posRef.current = next
        setPos(next)
        if (next.x > 86 && !failed.current) {
          failed.current = true
          const door = next.y < 34 ? 'greenhouse' : next.y < 67 ? 'surface' : 'shield'
          if (door === 'shield') safeRef.current()
          else failRef.current('Essa porta não segura a radiação. A estufa de vidro e o módulo comum não bastam.')
        }
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const current = posRef.current
      const next = { ...current }
      if (e.key === 'ArrowLeft') next.x -= 6
      if (e.key === 'ArrowRight') next.x += 6
      if (e.key === 'ArrowUp') next.y -= 8
      if (e.key === 'ArrowDown') next.y += 8
      if (next.x !== current.x || next.y !== current.y) {
        e.preventDefault()
        target.current = next
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-2 h-4 border-2 border-[#30346d] bg-[#0a1628]">
        <div className="h-full bg-danger" style={{ width: `${bar}%` }} />
      </div>
      <p className="mb-2 text-sm text-[#f4fff4]/80">Toque no caminho ou use as setas. Duas rochas no meio. A porta de baixo é o abrigo com água e regolito.</p>
      <div
        className="relative h-72 touch-none border-4 border-[#30346d] bg-[#3b140c]/80 select-none"
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          target.current = {
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          }
        }}
      >
        {ROCKS.map((rock) => (
          <span
            key={`${rock.x}-${rock.y}`}
            className="absolute size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7c2d12]"
            style={{ left: `${rock.x}%`, top: `${rock.y}%` }}
          />
        ))}
        {SHELTERS.map((door, index) => (
          <span
            key={door.id}
            className={`absolute right-1 flex h-[30%] w-16 items-center border-2 px-1 text-center font-pixel text-[8px] text-[#f4fff4] ${
              door.safe ? 'border-life' : 'border-danger'
            }`}
            style={{ top: `${index * 33}%` }}
          >
            {door.title}
          </span>
        ))}
        <span
          className="absolute size-8 -translate-x-1/2 -translate-y-1/2 border-2 border-energy bg-cyan-hud"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        />
      </div>
    </div>
  )
}
