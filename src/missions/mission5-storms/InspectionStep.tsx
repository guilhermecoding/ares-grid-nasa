import { useState } from 'react'
import { Check, DoorClosed, RadioTower, ScanSearch, ShieldCheck, Sprout, Sun, type LucideIcon } from 'lucide-react'
import { BarMeter, Burst, ChallengeBar, FloatDelta, GameCta, Tag } from '../../components/missionKit/kit'
import { MEDIA } from '../../constants/mediaAssets'
import { INSPECTION_POINTS, type InspectId } from '../../data/mission5Data'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  inspected: readonly InspectId[]
  integrity: number
  onInspect: (id: InspectId) => void
  onDone: () => void
}

/** Pin position over the base art, in percent of the scene. */
const SPOTS: Record<InspectId, { x: number; y: number; icon: LucideIcon }> = {
  panels: { x: 27, y: 53, icon: Sun },
  antenna: { x: 41, y: 22, icon: RadioTower },
  habitat: { x: 51.5, y: 43, icon: DoorClosed },
  greenhouse: { x: 68, y: 37, icon: Sprout },
}

export function InspectionStep({ inspected, integrity, onInspect, onDone }: Props) {
  const [last, setLast] = useState<InspectId | null>(null)
  const done = INSPECTION_POINTS.every((point) => inspected.includes(point.id))

  const inspect = (id: InspectId) => {
    if (inspected.includes(id)) return
    soundEngine.scan()
    setLast(id)
    onInspect(id)
  }

  return (
    <>
      <ChallengeBar
        code="5.4"
        title="Inspeção da base depois da tempestade"
        icon={<ScanSearch className="size-5" aria-hidden />}
        counterLabel="Pontos"
        value={inspected.length}
        total={INSPECTION_POINTS.length}
        hint="Toque em cada marcador que pisca na base para escanear o sistema."
      />

      <div className="grid gap-3 lg:grid-cols-[1.45fr_0.55fr]">
        <div className="relative aspect-[620/341] overflow-hidden border-4 border-(--gk-line) bg-[#3b140c]">
          <img src={MEDIA.mission5.baseClear} alt="Base em Arcádia com o céu limpo" className="gk-pixelated absolute inset-0 h-full w-full object-cover" draggable={false} />
          <Tag className="absolute top-2 left-2">Céu limpo · varredura</Tag>

          {INSPECTION_POINTS.map((point) => {
            const spot = SPOTS[point.id]
            const ok = inspected.includes(point.id)
            const Icon = spot.icon
            return (
              <div key={point.id} className="absolute" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
                {ok && last === point.id ? (
                  <>
                    <span className="gk-scan-ring pointer-events-none absolute top-0 left-0 size-14 rounded-full border-4 border-[#7dffe0]" aria-hidden />
                    <Burst color="#7dffe0" className="top-0 left-0" />
                    <FloatDelta color="#7dffb0" className="-top-12 -left-8 whitespace-nowrap">
                      +7,5% integridade
                    </FloatDelta>
                  </>
                ) : null}
                <button
                  type="button"
                  disabled={ok}
                  aria-label={ok ? `${point.title}: ${point.detail}` : `Inspecionar: ${point.title}`}
                  onClick={() => inspect(point.id)}
                  className={`absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 md:size-12 ${
                    ok ? 'border-[#04080f] bg-life text-[#04140a]' : 'gk-pulse border-[#04080f] bg-energy text-[#1a1203]'
                  }`}
                  style={{ touchAction: 'manipulation', ['--gk-glow' as string]: 'rgba(240,180,41,0.75)' }}
                >
                  {ok ? <Check className="size-5" strokeWidth={4} aria-hidden /> : <Icon className="size-5" aria-hidden />}
                  {ok ? null : <span className="gk-ping pointer-events-none absolute -inset-1 rounded-full border-2 border-energy" aria-hidden />}
                </button>
                <span
                  className={`pointer-events-none absolute top-7 left-0 hidden -translate-x-1/2 border-2 sm:block border-[#04080f] px-1.5 py-0.5 font-pixel text-[8px] whitespace-nowrap uppercase sm:text-[10px] ${
                    ok ? 'bg-life text-[#04140a]' : 'bg-[#04080f]/85 text-[#f4fff4]'
                  }`}
                  aria-hidden
                >
                  {point.title}
                </span>
              </div>
            )
          })}
        </div>

        <div className="gk-panel flex flex-col gap-2 p-3">
          <BarMeter label="Integridade da base" value={integrity} color="#5ecf9a" icon={<ShieldCheck className="size-3" aria-hidden />} />
          <ul className="mt-1 grid gap-1.5">
            {INSPECTION_POINTS.map((point) => {
              const ok = inspected.includes(point.id)
              const Icon = SPOTS[point.id].icon
              return (
                <li
                  key={point.id}
                  className={`flex min-h-11 items-center gap-2 border-2 px-2 py-1 ${ok ? 'gk-pop border-life bg-life/10' : 'border-[#30346d] bg-[#04080f]/60'}`}
                >
                  <Icon className={`size-4 shrink-0 ${ok ? 'text-[#7dffb0]' : 'text-[#f4fff4]/50'}`} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block font-pixel text-[10px] text-[#f4fff4] uppercase">{point.title}</span>
                    <span className={`block text-xs ${ok ? 'text-[#7dffb0]' : 'text-[#f4fff4]/50'}`}>{ok ? point.detail : 'Aguardando varredura'}</span>
                  </span>
                  {ok ? <Check className="size-4 shrink-0 text-[#7dffb0]" strokeWidth={3} aria-hidden /> : null}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {done ? <GameCta onClick={onDone}>Registrar o alerta</GameCta> : null}
    </>
  )
}
