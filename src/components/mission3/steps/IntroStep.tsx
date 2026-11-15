import { useState } from 'react'
import { MEDIA } from '../../../constants/mediaAssets'
import { INTRO_HIGHLIGHT_WORDS_M3, INTRO_PARTS_M3 } from '../../../data/mission3Data'
import { McButton } from '../../../opening/McButton'
import { PixelDialogBox } from '../../../opening/PixelDialogBox'
import { SciTermM3 } from '../SciTermM3'

interface Props {
  onContinue: () => void
}

export function IntroStep({ onContinue }: Props) {
  const [part, setPart] = useState(0)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)

  const lines = INTRO_PARTS_M3[part]!
  const isLast = part >= INTRO_PARTS_M3.length - 1

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-16 z-20 px-3 sm:px-4">
        <div className="mx-auto max-w-xl rounded border border-cyan-hud/40 bg-[#0a1628]/9 px-3 py-2 font-pixel text-[10px] text-cyan-hud sm:text-xs">
          Sol 03 · Arcadia Planitia · Missão científica — gelo no{' '}
          <SciTermM3 term="Subsolo">subsolo</SciTermM3>
        </div>
      </div>

      <PixelDialogBox
        key={`m3-intro-${part}`}
        open={open}
        lines={[...lines]}
        title="Capi"
        dialogId={`m3-intro-${part}`}
        onSkip={() => setOpen(false)}
        characterSrc={MEDIA.capi.neutral}
        characterAlt="Capi"
        highlightWords={[...INTRO_HIGHLIGHT_WORDS_M3]}
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
              {isLast ? 'Começar investigação' : 'Continuar'}
            </McButton>
          ) : null
        }
      />
    </>
  )
}
