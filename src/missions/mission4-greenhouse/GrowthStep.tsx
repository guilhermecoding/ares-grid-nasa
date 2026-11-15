import { useEffect, useRef, useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import {
  GROWTH_STAGES,
  PLANT_GROUPS,
  speciesLabel,
  type PlantGroupId,
  type SpeciesId,
} from '../../data/mission4Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  planted: Partial<Record<PlantGroupId, SpeciesId>>
  stage: 0 | 1 | 2
  misted: boolean
  lightOn: boolean
  tempOk: boolean
  harvested: readonly SpeciesId[]
  waterL: number
  onToggleLight: () => void
  onToggleTemp: () => void
  onMist: () => void
  onAdvance: () => void
  onHarvest: (id: SpeciesId) => void
  onStress: (message: string) => void
  onWaterShort: () => void
  onDone: () => void
}

const MIST_WATER_L = 2

export function GrowthStep({
  planted,
  stage,
  misted,
  lightOn,
  tempOk,
  harvested,
  waterL,
  onToggleLight,
  onToggleTemp,
  onMist,
  onAdvance,
  onHarvest,
  onStress,
  onWaterShort,
  onDone,
}: Props) {
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const hitRef = useRef(false)
  const spraying = drag !== null
  const species = PLANT_GROUPS.map((g) => planted[g.id]).filter((id): id is SpeciesId => Boolean(id))
  const allHarvested = species.every((id) => harvested.includes(id))

  useEffect(() => {
    if (!spraying) return
    const move = (e: PointerEvent) => {
      setDrag({ x: e.clientX, y: e.clientY })
      if (document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-canopy]')) hitRef.current = true
    }
    const up = () => {
      const sprayed = hitRef.current
      hitRef.current = false
      setDrag(null)
      if (!sprayed) return
      if (waterL < MIST_WATER_L) {
        onWaterShort()
        return
      }
      soundEngine.success()
      onMist()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [onMist, onWaterShort, spraying, waterL])

  const tryAdvance = () => {
    if (!lightOn) {
      onStress('A luz está errada. As folhas pedem o LED ligado.')
      return
    }
    if (!tempOk) {
      onStress('A temperatura saiu do intervalo ameno. Ajuste o controle.')
      return
    }
    if (!misted) {
      onStress('Sem névoa, as folhas murcham. Passe o borrifador sobre elas.')
      return
    }
    soundEngine.step()
    onAdvance()
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-3 lg:grid-cols-[1fr_0.8fr]">
      <div
        data-canopy
        className={`flex min-h-56 flex-col items-center justify-center border-4 p-4 ${
          misted && lightOn && tempOk ? 'border-life' : 'border-danger'
        }`}
      >
        <p className="font-pixel text-sm text-energy">
          Estágio {stage + 1}/3 · {GROWTH_STAGES[stage]}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {species.map((id) => {
            const picked = harvested.includes(id)
            return (
              <button
                key={id}
                type="button"
                disabled={stage < 2 || picked || !misted}
                onClick={() => {
                  soundEngine.harvest()
                  onHarvest(id)
                }}
                className="min-h-16 min-w-16 border-4 border-[#30346d] bg-[#0a1628] px-2"
                style={{ touchAction: 'manipulation' }}
              >
                <span className="block text-2xl">{stage === 0 ? '·' : stage === 1 ? '↑' : '✿'}</span>
                <span className="font-pixel text-[10px] text-[#f4fff4]">{picked ? '✓ ' : ''}{speciesLabel(id)}</span>
              </button>
            )
          })}
        </div>
        {!misted ? <p className="mt-2 text-sm text-[#ffb4b4]">As folhas estão secas.</p> : null}
      </div>
      <div className="grid gap-2">
        <Toggle label={lightOn ? 'LED ligado' : 'Luz apagada'} ok={lightOn} onClick={onToggleLight} />
        <Toggle label={tempOk ? 'Temperatura amena' : 'Temperatura fora'} ok={tempOk} onClick={onToggleTemp} />
        <button
          type="button"
          disabled={misted}
          onPointerDown={(e) => {
            if (misted) return
            setDrag({ x: e.clientX, y: e.clientY })
          }}
          className="flex min-h-16 touch-none items-center gap-2 border-4 border-cyan-hud px-2 select-none"
          style={{ touchAction: 'none' }}
        >
          <img src={MEDIA.mission4.mister} alt="" className="h-10 w-10" draggable={false} />
          <span className="text-left text-sm text-[#f4fff4]">
            {misted ? 'Névoa aplicada' : `Arraste o borrifador sobre as folhas · −${MIST_WATER_L} L`}
          </span>
        </button>
        {stage < 2 ? (
          <McButton onClick={tryAdvance}>Próximo estágio</McButton>
        ) : allHarvested ? (
          <McButton onClick={onDone}>Abrir o ciclo da base</McButton>
        ) : (
          <p className="text-sm text-[#f4fff4]/80">Toque em cada fruto para colher.</p>
        )}
      </div>
      {drag ? (
        <img
          src={MEDIA.mission4.mister}
          alt=""
          className="pointer-events-none fixed z-[80] h-14 w-14"
          style={{ left: drag.x - 28, top: drag.y - 28 }}
        />
      ) : null}
    </div>
  )
}

function Toggle({ label, ok, onClick }: { label: string; ok: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        soundEngine.click()
        onClick()
      }}
      className={`min-h-12 border-4 px-3 text-left font-pixel text-xs text-[#f4fff4] ${ok ? 'border-life' : 'border-energy'}`}
      style={{ touchAction: 'manipulation' }}
    >
      {label}
    </button>
  )
}
