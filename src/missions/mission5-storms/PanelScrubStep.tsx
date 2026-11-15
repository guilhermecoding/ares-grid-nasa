import { useEffect, useState } from 'react'
import { DustScrubCanvas } from '../../components/DustScrubCanvas'
import { MISSION5_META } from '../../data/mission5Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  windSafe: boolean
  panelsClean: boolean
  onWindSafe: () => void
  onEarly: () => void
  onClean: () => void
  onDone: () => void
}

const WAIT_S = 6

export function PanelScrubStep({ windSafe, panelsClean, onWindSafe, onEarly, onClean, onDone }: Props) {
  const [left, setLeft] = useState(windSafe ? 0 : WAIT_S)

  useEffect(() => {
    if (windSafe || left <= 0) return
    const id = window.setTimeout(() => setLeft((value) => value - 1), 1000)
    return () => window.clearTimeout(id)
  }, [left, windSafe])

  const watts = panelsClean ? MISSION5_META.panelWatts : Math.round(MISSION5_META.panelWatts * 0.25)

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-sm text-[#f4fff4]/85">
        Geração atual: {panelsClean ? '100' : '25'}% · {watts} W. A água da base não muda.
      </p>
      {!windSafe ? (
        <button
          type="button"
          className="mt-3 min-h-16 w-full border-4 border-energy bg-[#0a1628]/90 px-3 text-left"
          style={{ touchAction: 'manipulation' }}
          onClick={() => {
            if (left > 0) {
              soundEngine.fail()
              onEarly()
              return
            }
            soundEngine.success()
            onWindSafe()
          }}
        >
          <span className="font-pixel text-sm text-energy">{left > 0 ? `Vento forte · espere ${left}s` : 'Vento seguro · liberar o painel'}</span>
          <span className="mt-1 block text-sm text-[#f4fff4]">Limpar antes da hora não abre o painel.</span>
        </button>
      ) : panelsClean ? (
        <div className="mt-3 border-4 border-life p-3">
          <p className="font-pixel text-sm text-[#7dffb0]">Painel limpo · {MISSION5_META.panelWatts} W</p>
          <McButton className="mt-3" onClick={onDone}>
            Alerta solar
          </McButton>
        </div>
      ) : (
        <DustScrubCanvas
          className="mt-3 h-56 w-full"
          ariaLabel="Esfregar a poeira do painel solar"
          onClean={() => {
            soundEngine.success()
            onClean()
          }}
        >
          <div className="flex h-56 items-center justify-center bg-[#123] font-pixel text-sm text-energy">
            Painel solar · esfregue até 90%
          </div>
        </DustScrubCanvas>
      )}
    </div>
  )
}
