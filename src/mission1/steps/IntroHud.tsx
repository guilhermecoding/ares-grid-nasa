import { PixelDialogBox } from '../../opening/PixelDialogBox'
import { McButton } from '../../opening/McButton'
import { MEDIA } from '../../constants/mediaAssets'
import { INTRO_LINES } from '../../data/mission1Data'
import { SciTerm } from '../SciTerm'
import { useState } from 'react'

interface Props {
  onContinue: () => void
}

export function IntroHud({ onContinue }: Props) {
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto max-w-3xl border-2 border-cyan-hud/50 bg-[#0a1628]/9 px-3 py-2 font-pixel text-[10px] text-cyan-hud sm:text-xs">
          <p>
            Local: <SciTerm term="Arcadia Planitia" />
          </p>
          <p>Suporte à Vida: OK</p>
          <p className="text-energy">Energia Externa: NÃO INSTALADA</p>
        </div>
      </div>

      <PixelDialogBox
        open={open}
        lines={INTRO_LINES}
        title="Capi"
        characterSrc={MEDIA.capi.neutral}
        characterAlt="Capi"
        onTypingComplete={() => setReady(true)}
        onClosed={onContinue}
        footer={
          ready ? (
            <McButton
              className="min-h-12 px-6 font-pixel text-lg font-bold"
              onClick={() => setOpen(false)}
            >
              Avançar
            </McButton>
          ) : null
        }
      />
    </>
  )
}
