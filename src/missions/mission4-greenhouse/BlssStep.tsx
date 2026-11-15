import { BLSS_LINKS, SCI_TERMS_M4, type BlssLinkId } from '../../data/mission4Data'
import { SciTerm } from '../../components/SciTerm'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  linked: readonly BlssLinkId[]
  foodPct: number
  o2Pct: number
  onLink: (id: BlssLinkId) => void
  onDone: () => void
}

export function BlssStep({ linked, foodPct, o2Pct, onLink, onDone }: Props) {
  const done = BLSS_LINKS.every((link) => linked.includes(link.id))
  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-sm text-[#f4fff4]/85 md:text-base">
        Toque nas setas do ciclo <SciTerm term="Bioregenerativo" terms={SCI_TERMS_M4} />. A{' '}
        <SciTerm term="Fotossíntese" terms={SCI_TERMS_M4} /> liga planta, astronauta, água e ar.
      </p>
      <div className="mt-4 grid gap-3">
        {BLSS_LINKS.map((link) => {
          const on = linked.includes(link.id)
          return (
            <button
              key={link.id}
              type="button"
              disabled={on}
              onClick={() => {
                soundEngine.success()
                onLink(link.id)
              }}
              className={`min-h-16 border-4 px-3 text-left ${on ? 'border-life' : 'animate-pulse border-energy'}`}
              style={{ touchAction: 'manipulation' }}
            >
              <span className="font-pixel text-sm text-energy">{on ? '✓' : '→'} {link.label}</span>
              <span className="mt-1 block text-sm text-[#f4fff4]">{link.detail}</span>
            </button>
          )
        })}
      </div>
      {done ? (
        <div className="mt-4 border-4 border-life bg-[#0a1628]/90 p-3">
          <p className="font-pixel text-sm text-[#7dffb0]">Comida {foodPct}% · Oxigênio {o2Pct}%</p>
          <p className="mt-1 text-sm text-[#f4fff4]">O bem-estar da base sobe um pouco. Os medidores globais continuam energia, água e bem-estar.</p>
          <McButton className="mt-3" onClick={onDone}>
            Registrar no diário
          </McButton>
        </div>
      ) : null}
    </div>
  )
}
