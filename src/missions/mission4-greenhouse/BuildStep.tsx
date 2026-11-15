import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MEDIA } from '../../constants/mediaAssets'
import { GREENHOUSE_MODULES, type GreenhouseModuleId } from '../../data/mission4Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  installed: readonly GreenhouseModuleId[]
  energyLinked: boolean
  waterLinked: boolean
  energy: number
  onInstall: (id: GreenhouseModuleId) => void
  onLinkEnergy: () => void
  onLinkWater: () => void
  onEnergyShort: () => void
  onDone: () => void
}

const ORDER = GREENHOUSE_MODULES.map((m) => m.id)

export function BuildStep({
  installed,
  energyLinked,
  waterLinked,
  energy,
  onInstall,
  onLinkEnergy,
  onLinkWater,
  onEnergyShort,
  onDone,
}: Props) {
  const [drag, setDrag] = useState<{ id: 'energy' | 'water'; x: number; y: number } | null>(null)
  const [spark, setSpark] = useState<'energy' | 'water' | null>(null)

  useEffect(() => {
    if (!drag) return
    const id = drag.id
    const move = (e: PointerEvent) => setDrag({ id, x: e.clientX, y: e.clientY })
    const up = (e: PointerEvent) => {
      setDrag(null)
      const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-socket]')
      if (hit?.getAttribute('data-socket') !== id) {
        soundEngine.fail()
        return
      }
      setSpark(id)
      soundEngine.success()
      window.setTimeout(() => setSpark(null), 500)
      if (id === 'energy') onLinkEnergy()
      else onLinkWater()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    // Listeners stay for this drag. A new id starts a new pair.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag?.id])
  const next = ORDER.find((id) => !installed.includes(id))
  const modulesReady = installed.length === ORDER.length
  const ready = modulesReady && energyLinked && waterLinked

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-3 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-2">
        {GREENHOUSE_MODULES.map((mod) => {
          const done = installed.includes(mod.id)
          const current = mod.id === next
          return (
            <button
              key={mod.id}
              type="button"
              disabled={done || !current}
              onClick={() => {
                if (energy < mod.energyCost) {
                  onEnergyShort()
                  return
                }
                soundEngine.click()
                onInstall(mod.id)
              }}
              className={`min-h-16 border-4 px-3 py-2 text-left ${
                done
                  ? 'border-life bg-[#0a1628]/90'
                  : current
                    ? 'animate-pulse border-energy bg-[#0a1628]/90 shadow-[0_0_16px_rgba(255,177,90,0.45)]'
                    : 'border-[#30346d] bg-[#0a1628]/70 opacity-70'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <span className="font-pixel text-sm text-[#f4fff4]">{done ? '✓ ' : ''}{mod.title}</span>
              <span className="mt-1 block text-sm text-[#f4fff4]/80">
                {done ? mod.detail : current ? `TOQUE AQUI · −${mod.energyCost}% de energia` : 'Depois do módulo anterior'}
              </span>
            </button>
          )
        })}
      </div>

      <div className="border-4 border-[#30346d] bg-[#0a1628]/80 p-3">
        <p className="font-pixel text-xs text-cyan-hud">Conectores — nada começa ligado</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Socket id="energy" label="Energia solar" linked={energyLinked} spark={spark === 'energy'} />
          <Socket id="water" label="Água potável" linked={waterLinked} spark={spark === 'water'} />
        </div>
        {modulesReady ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <DragSource
              label="Cabo amarelo"
              src={MEDIA.mission4.cable}
              done={energyLinked}
              onStart={(x, y) => setDrag({ id: 'energy', x, y })}
            />
            <DragSource
              label="Tubo azul"
              src={MEDIA.mission4.pipe}
              done={waterLinked}
              onStart={(x, y) => setDrag({ id: 'water', x, y })}
            />
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#f4fff4]/80">Encaixe os cinco módulos. Aí o cabo e o tubo aparecem.</p>
        )}
        {ready ? (
          <McButton className="mt-4" onClick={onDone}>
            Estufa montada
          </McButton>
        ) : null}
      </div>

      {drag ? (
        <img
          src={drag.id === 'energy' ? MEDIA.mission4.cable : MEDIA.mission4.pipe}
          alt=""
          className="pointer-events-none fixed z-[80] h-14 w-14"
          style={{ left: drag.x - 28, top: drag.y - 28 }}
        />
      ) : null}
    </div>
  )
}

function Socket({ id, label, linked, spark }: { id: string; label: string; linked: boolean; spark: boolean }) {
  return (
    <div
      data-socket={id}
      className={`flex min-h-24 flex-col items-center justify-center border-4 border-dashed px-2 text-center ${
        linked ? 'border-life bg-life/10' : 'border-cyan-hud'
      }`}
    >
      <span className="font-pixel text-[10px] text-[#f4fff4]">{linked ? '✓ LIGADO' : 'ENCAIXE AQUI'}</span>
      <span className="text-sm text-[#f4fff4]/80">{label}</span>
      {spark ? <motion.span animate={{ scale: [1, 1.4, 1] }} className="text-energy">faísca</motion.span> : null}
    </div>
  )
}

function DragSource({
  label,
  src,
  done,
  onStart,
}: {
  label: string
  src: string
  done: boolean
  onStart: (x: number, y: number) => void
}) {
  return (
    <button
      type="button"
      disabled={done}
      onPointerDown={(e) => {
        if (done) return
        onStart(e.clientX, e.clientY)
      }}
      className="flex min-h-16 touch-none items-center gap-2 border-4 border-energy bg-[#0a1628] px-2 select-none"
      style={{ touchAction: 'none' }}
      aria-label={label}
    >
      <img src={src} alt="" className="h-10 w-10" draggable={false} />
      <span className="font-pixel text-[10px] text-[#f4fff4]">{done ? '✓' : 'ARRASTE'} {label}</span>
    </button>
  )
}

