import { useEffect, useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import {
  PLANT_GROUPS,
  type PlantGroupId,
  type SpeciesId,
} from '../../data/mission4Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

const ICONS: Record<PlantGroupId, string> = {
  veggie: MEDIA.mission4.leaf,
  fruit: MEDIA.mission4.berry,
  grain: MEDIA.mission4.grain,
  flower: MEDIA.mission4.flower,
}

interface Props {
  planted: Partial<Record<PlantGroupId, SpeciesId>>
  onPlant: (group: PlantGroupId, species: SpeciesId) => void
  onMismatch: () => void
  onDone: () => void
}

export function PlantStep({ planted, onPlant, onMismatch, onDone }: Props) {
  const [drag, setDrag] = useState<{ species: SpeciesId; group: PlantGroupId; x: number; y: number } | null>(null)
  const full = PLANT_GROUPS.every((g) => planted[g.id])

  useEffect(() => {
    if (!drag) return
    const current = { species: drag.species, group: drag.group }
    const move = (e: PointerEvent) =>
      setDrag({ species: current.species, group: current.group, x: e.clientX, y: e.clientY })
    const up = (e: PointerEvent) => {
      setDrag(null)
      const bed = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-bed]')
      const group = bed?.getAttribute('data-bed')
      if (group !== current.group) {
        soundEngine.fail()
        onMismatch()
        return
      }
      soundEngine.success()
      onPlant(current.group, current.species)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    // Restart only when a new species is picked up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag?.species, drag?.group])

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-3 lg:grid-cols-2">
      <div className="grid gap-2">
        {PLANT_GROUPS.map((group) => (
          <div key={group.id} className="border-4 border-[#30346d] bg-[#0a1628]/85 p-2">
            <p className="font-pixel text-xs text-cyan-hud">{group.title}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.species.map((species) => {
                const used = planted[group.id] === species.id
                return (
                  <button
                    key={species.id}
                    type="button"
                    disabled={Boolean(planted[group.id])}
                    onPointerDown={(e) => {
                      if (planted[group.id]) return
                      setDrag({ species: species.id, group: group.id, x: e.clientX, y: e.clientY })
                    }}
                    className="flex min-h-12 touch-none items-center gap-2 border-4 border-energy px-2 select-none"
                    style={{ touchAction: 'none' }}
                  >
                    <img src={ICONS[group.id]} alt="" className="h-8 w-8" draggable={false} />
                    <span className="font-pixel text-[10px] text-[#f4fff4]">{used ? '✓ ' : 'ARRASTE '}{species.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PLANT_GROUPS.map((group) => {
          const species = group.species.find((s) => s.id === planted[group.id])
          return (
            <div
              key={group.id}
              data-bed={group.id}
              className={`flex min-h-28 flex-col items-center justify-center border-4 border-dashed p-2 text-center ${
                species ? 'border-life' : 'border-cyan-hud'
              }`}
            >
              <img src={ICONS[group.id]} alt="" className="h-10 w-10" />
              <span className="font-pixel text-[10px] text-[#f4fff4]">
                {species ? species.label : `Berço de ${group.title.toLowerCase()}`}
              </span>
            </div>
          )
        })}
        {full ? (
          <McButton className="col-span-2" onClick={onDone}>
            Acompanhar o crescimento
          </McButton>
        ) : null}
      </div>
      {drag ? (
        <img
          src={ICONS[drag.group]}
          alt=""
          className="pointer-events-none fixed z-[80] h-12 w-12"
          style={{ left: drag.x - 24, top: drag.y - 24 }}
        />
      ) : null}
    </div>
  )
}
