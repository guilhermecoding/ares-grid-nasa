import { CULTIVATION_METHODS, SCI_TERMS_M4, type CultivationMethodId } from '../../data/mission4Data'
import { SciTerm } from '../../components/SciTerm'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  method: CultivationMethodId | null
  energy: number
  waterL: number
  onChoose: (id: CultivationMethodId) => void
  onEnergyShort: () => void
  onWaterShort: () => void
  onDone: () => void
}

export function MethodStep({ method, energy, waterL, onChoose, onEnergyShort, onWaterShort, onDone }: Props) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-sm text-[#f4fff4]/85 md:text-base">
        Escolha como as raízes vão viver. A{' '}
        <SciTerm term="Hidroponia" terms={SCI_TERMS_M4} /> gasta mais água. A{' '}
        <SciTerm term="Aeroponia" terms={SCI_TERMS_M4} /> gasta menos água e mais energia. O{' '}
        <SciTerm term="Regolito" terms={SCI_TERMS_M4} /> cru tem{' '}
        <SciTerm term="Percloratos" terms={SCI_TERMS_M4} /> e só entra depois do aviso.
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {CULTIVATION_METHODS.map((item) => {
          const chosen = method === item.id
          return (
            <button
              key={item.id}
              type="button"
              disabled={method != null}
              onClick={() => {
                if (energy < item.energyCost) {
                  onEnergyShort()
                  return
                }
                if (waterL < item.waterL) {
                  onWaterShort()
                  return
                }
                soundEngine.click()
                onChoose(item.id)
              }}
              className={`min-h-36 border-4 px-3 py-3 text-left ${
                chosen ? 'border-life bg-[#0a1628]/92' : 'border-energy bg-[#0a1628]/92'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <span className="font-pixel text-base text-energy">{chosen ? '✓ ' : ''}{item.title}</span>
              <span className="mt-2 block text-sm text-[#f4fff4]">{item.detail}</span>
              <span className="mt-2 block font-pixel text-sm text-[#f4fff4]/80">
                −{item.energyCost}% energia · −{item.waterL} L
              </span>
            </button>
          )
        })}
      </div>
      {method ? (
        <button
          type="button"
          className="mt-4 min-h-12 border-4 border-life bg-life/15 px-4 font-pixel text-sm text-[#f4fff4]"
          style={{ touchAction: 'manipulation' }}
          onClick={onDone}
        >
          Plantar as espécies
        </button>
      ) : null}
    </div>
  )
}
