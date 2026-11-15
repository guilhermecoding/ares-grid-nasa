import { useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import { INSTALL_SITES, type SiteId } from '../../data/mission1Data'
import { McButton } from '../../opening/McButton'
import { PixelDialogBox } from '../../opening/PixelDialogBox'

interface Props {
  onConfirm: (site: SiteId) => void
}

export function LocationChallenge({ onConfirm }: Props) {
  const [selected, setSelected] = useState<SiteId | null>(null)
  const [capiOpen, setCapiOpen] = useState(false)
  const [capiLines, setCapiLines] = useState<string[]>([])
  const [capiReady, setCapiReady] = useState(false)
  const [pendingAdvance, setPendingAdvance] = useState(false)

  const site = INSTALL_SITES.find((s) => s.id === selected)
  const markerSrc = {
    A: MEDIA.mission1.pointA,
    B: MEDIA.mission1.pointB,
    C: MEDIA.mission1.pointC,
  }

  const tryConfirm = () => {
    if (!site) return
    if (site.ideal) {
      onConfirm(site.id)
      return
    }
    setCapiLines([site.capiFeedback, 'Você pode confirmar mesmo assim ou escolher outro ponto.'])
    setCapiReady(false)
    setPendingAdvance(true)
    setCapiOpen(true)
  }

  return (
    <div className="relative z-10 flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-3 pt-3 sm:px-4">
        <p className="font-pixel text-sm text-[#f4fff4] sm:text-base">Desafio 1.1 — Escolha o local dos painéis</p>
        <p className="mt-1 text-sm text-void-200">Toque nos pontos A, B ou C. Veja prós e contras.</p>
      </div>

      <div className="relative min-h-0 flex-1">
        {INSTALL_SITES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 ${
              selected === s.id ? 'scale-110' : ''
            }`}
            style={{ left: `${s.leftPct}%`, top: `${s.topPct}%` }}
            onClick={() => setSelected(s.id)}
            aria-label={`Ponto ${s.id}: ${s.name}`}
          >
            <img
              src={markerSrc[s.id]}
              alt=""
              className="size-14 object-contain drop-shadow-lg sm:size-16"
              style={{ imageRendering: 'pixelated' }}
              draggable={false}
            />
          </button>
        ))}
      </div>

      {site && (
        <div className="z-20 shrink-0 border-t-2 border-cyan-hud/40 bg-[#0a1628]/95 p-3 sm:p-4">
          <p className="font-pixel text-cyan-hud">
            Ponto {site.id}: {site.name}
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold text-life">Prós</p>
              <ul className="text-sm text-void-100">
                {site.pros.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-danger">Contras</p>
              <ul className="text-sm text-void-100">
                {site.cons.map((c) => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            </div>
          </div>
          <McButton className="mt-3 min-h-12 w-full font-pixel text-lg font-bold" onClick={tryConfirm}>
            Confirmar este local
          </McButton>
        </div>
      )}

      <PixelDialogBox
        open={capiOpen}
        lines={capiLines}
        title="Capi"
        characterSrc={MEDIA.capi.neutral}
        onTypingComplete={() => setCapiReady(true)}
        onClosed={() => {
          if (pendingAdvance && selected) {
            setPendingAdvance(false)
            onConfirm(selected)
          }
        }}
        footer={
          capiReady ? (
            <div className="flex flex-wrap justify-center gap-2">
              <McButton
                className="min-h-12 px-4 font-pixel"
                onClick={() => {
                  setPendingAdvance(false)
                  setCapiOpen(false)
                }}
              >
                Escolher outro
              </McButton>
              <McButton className="min-h-12 px-4 font-pixel" onClick={() => setCapiOpen(false)}>
                Confirmar mesmo assim
              </McButton>
            </div>
          ) : null
        }
      />
    </div>
  )
}
