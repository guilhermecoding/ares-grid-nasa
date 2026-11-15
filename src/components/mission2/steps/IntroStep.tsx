import { useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import { INTRO_HIGHLIGHT_WORDS_M2, INTRO_LINES_M2_A, INTRO_LINES_M2_B } from '../../../data/mission2Data'
import { McButton } from '../../../opening/McButton'
import { PixelDialogBox } from '../../../opening/PixelDialogBox'
import { SciTermM2 } from '../SciTermM2'

interface Props {
  onContinue: () => void
}

export function IntroStep({ onContinue }: Props) {
  const [part, setPart] = useState<1 | 2>(1)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)

  const lines = part === 1 ? INTRO_LINES_M2_A : INTRO_LINES_M2_B

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 px-4 text-center sm:bottom-28">
        <p className="mx-auto max-w-md font-pixel text-[10px] leading-snug text-[#f4fff4]/90 sm:text-xs">
          Rotina diária no habitat — cuidado com{' '}
          <SciTermM2 term="Microgravidade">microgravidade</SciTermM2>, isolamento e sono.
        </p>
      </div>

      <PixelDialogBox
        key={`m2-intro-${part}`}
        open={open}
        lines={[...lines]}
        title="Capi"
        characterSrc={MEDIA.capi.neutral}
        characterAlt="Capi"
        highlightWords={part === 2 ? INTRO_HIGHLIGHT_WORDS_M2 : undefined}
        onTypingComplete={() => setReady(true)}
        onClosed={() => {
          if (part === 1) {
            setReady(false)
            setPart(2)
            setOpen(true)
            return
          }
          onContinue()
        }}
        footer={
          ready ? (
            <McButton
              className="min-h-12 px-6 font-pixel text-lg font-bold"
              style={{ touchAction: 'manipulation' }}
              onClick={() => setOpen(false)}
            >
              {part === 1 ? 'Continuar' : 'Começar o dia'}
            </McButton>
          ) : null
        }
      />
    </>
  )
}
