import { useState } from 'react'
import { ScrollHintArea } from '../../components/ScrollHintArea'
import { MEDIA } from '../../constants/mediaAssets'
import { INSTALL_SITES, type SiteId } from '../../data/mission1Data'
import { McButton } from '../../opening/McButton'
import { PixelDialogBox } from '../../opening/PixelDialogBox'

interface Props {
  onConfirm: (site: SiteId) => void
  /** Pre-select last saved site when replaying. */
  initialSite?: SiteId
}

export function LocationChallenge({ onConfirm, initialSite }: Props) {
  const [selected, setSelected] = useState<SiteId | null>(initialSite ?? null)
  const [capiOpen, setCapiOpen] = useState(false)
  const [capiLines, setCapiLines] = useState<string[]>([])
  const [capiReady, setCapiReady] = useState(false)
  const [pendingAdvance, setPendingAdvance] = useState(false)

  const tryConfirm = (id: SiteId) => {
    const option = INSTALL_SITES.find((item) => item.id === id)
    if (!option) return
    setSelected(id)
    if (option.ideal) {
      onConfirm(option.id)
      return
    }
    setCapiLines([option.capiFeedback, 'Você pode confirmar mesmo assim ou escolher outro ponto.'])
    setCapiReady(false)
    setPendingAdvance(true)
    setCapiOpen(true)
  }

  return (
    <div className={`relative flex h-full min-h-0 flex-col ${capiOpen ? 'z-[60]' : 'z-10'}`}>
      <ScrollHintArea
        variant="dark"
        frameClassName="h-full min-h-0 flex-1"
        className="flex h-full flex-col gap-3 px-3 pt-16 pb-4 sm:px-4 md:gap-4 md:px-6 lg:gap-5 lg:px-8"
      >
        <div className="mx-auto w-full max-w-lg md:max-w-5xl lg:max-w-6xl xl:max-w-7xl">
          <p className="font-pixel text-sm text-[#f4fff4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] md:text-base lg:text-lg">
            Desafio 1.1 — Escolha o local dos painéis
          </p>
          <p className="mt-1 text-sm text-void-100/90 md:text-base">
            Compare o sprite, os prós e os contras. Confirme no cartão escolhido.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-lg grid-cols-1 gap-3 md:max-w-5xl md:grid-cols-3 md:gap-4 lg:max-w-6xl lg:gap-6 xl:max-w-7xl">
          {INSTALL_SITES.map((option) => {
            const active = selected === option.id
            return (
              <div
                key={option.id}
                className={`flex flex-col border-2 bg-[#0a1628]/92 text-left shadow-[0_8px_20px_rgba(0,0,0,0.35)] ${
                  active ? 'border-cyan-hud' : 'border-cyan-hud/30'
                }`}
              >
                <img
                  src={MEDIA.mission1.sites[option.id]}
                  alt=""
                  draggable={false}
                  className="aspect-[16/10] w-full object-cover md:aspect-[4/3] lg:aspect-[5/4] xl:aspect-square"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="flex flex-1 flex-col gap-2 p-3 md:gap-3 md:p-4 lg:p-5">
                  <p className="font-pixel text-sm text-cyan-hud md:text-base lg:text-lg">{option.name}</p>
                  <div>
                    <p className="text-xs font-bold tracking-wide text-life md:text-sm">Prós</p>
                    <ul className="mt-1 space-y-1 text-sm leading-snug text-void-100 md:text-base">
                      {option.pros.map((pro) => (
                        <li key={pro}>+ {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-wide text-danger md:text-sm">Contras</p>
                    <ul className="mt-1 space-y-1 text-sm leading-snug text-void-100 md:text-base">
                      {option.cons.map((con) => (
                        <li key={con}>− {con}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto pt-3">
                    <McButton
                      className="min-h-12 w-full font-pixel text-base font-bold sm:text-lg"
                      aria-label={`Confirmar ${option.name}`}
                      onClick={() => tryConfirm(option.id)}
                    >
                      Confirmar
                    </McButton>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollHintArea>

      <PixelDialogBox
        key={selected ? `m1-site-warn-${selected}` : 'site-warn'}
        open={capiOpen}
        position="center"
        lines={capiLines}
        title="Capi"
        dialogId={selected ? `m1-site-warn-${selected}` : undefined}
        characterSrc={MEDIA.capi.duvida}
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
