import { MEDIA } from '../../constants/mediaAssets'
import { INSPECTION_POINTS, type InspectId } from '../../data/mission5Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

const ICONS: Record<InspectId, string> = {
  panels: MEDIA.mission4.cable,
  habitat: MEDIA.mission5.hatch,
  greenhouse: MEDIA.mission4.greenhouse,
  antenna: MEDIA.mission5.antenna,
}

interface Props {
  inspected: readonly InspectId[]
  integrity: number
  onInspect: (id: InspectId) => void
  onDone: () => void
}

export function InspectionStep({ inspected, integrity, onInspect, onDone }: Props) {
  const done = INSPECTION_POINTS.every((point) => inspected.includes(point.id))
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-2">
      {INSPECTION_POINTS.map((point) => {
        const ok = inspected.includes(point.id)
        return (
          <button
            key={point.id}
            type="button"
            disabled={ok}
            onClick={() => {
              soundEngine.success()
              onInspect(point.id)
            }}
            className={`min-h-24 border-4 px-3 py-2 text-left ${ok ? 'border-life' : 'animate-pulse border-energy'}`}
            style={{ touchAction: 'manipulation' }}
          >
            <img src={ICONS[point.id]} alt="" className="h-10 w-10" />
            <span className="mt-1 block font-pixel text-xs text-[#f4fff4]">{ok ? '✓ ' : 'TOQUE AQUI · '}{point.title}</span>
            <span className="block text-sm text-[#f4fff4]/80">{point.detail}</span>
          </button>
        )
      })}
      <p className="font-pixel text-sm text-[#7dffb0] sm:col-span-2">Integridade da base {Math.round(integrity)}%</p>
      {done ? (
        <McButton className="sm:col-span-2" onClick={onDone}>
          Registrar o alerta
        </McButton>
      ) : null}
    </div>
  )
}
