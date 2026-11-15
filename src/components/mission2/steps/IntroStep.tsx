import { useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import { INTRO_HIGHLIGHT_WORDS_M2, INTRO_PARTS_M2 } from '../../../data/mission2Data'
import { McButton } from '../../../opening/McButton'
import { PixelDialogBox } from '../../../opening/PixelDialogBox'
import { SciTermM2 } from '../SciTermM2'

interface Props {
  onContinue: () => void
}

export function IntroStep({ onContinue }: Props) {
  const [part, setPart] = useState(0)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)

  const lines = INTRO_PARTS_M2[part]!
  const isLast = part >= INTRO_PARTS_M2.length - 1

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
        dialogId={`m2-intro-${part}`}
        onSkip={() => setOpen(false)}
        characterSrc={MEDIA.capi.neutral}
        characterAlt="Capi"
        highlightWords={INTRO_HIGHLIGHT_WORDS_M2}
        onTypingComplete={() => setReady(true)}
        onClosed={() => {
          if (!isLast) {
            setReady(false)
            setPart((p) => p + 1)
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
              {isLast ? 'Começar o dia' : 'Continuar'}
            </McButton>
          ) : null
        }
      />
    </>
  )
}
