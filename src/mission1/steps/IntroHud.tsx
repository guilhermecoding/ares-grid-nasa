import { useMemo, useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import { INTRO_HIGHLIGHT_WORDS, INTRO_PARTS } from '../../data/mission1Data'
import { useI18n } from '../../i18n/locale'
import { McButton } from '../../opening/McButton'
import { PixelDialogBox } from '../../opening/PixelDialogBox'
import { useHideFollowingDialogs } from '../../opening/useHideFollowingDialogs'
import { SciTerm } from '../SciTerm'

interface Props {
  onContinue: () => void
}

export function IntroHud({ onContinue }: Props) {
  const { t, locale } = useI18n()
  const [part, setPart] = useState(0)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(true)

  const partCopy = INTRO_PARTS[part]!
  const lines = useMemo(() => partCopy.map((line) => t(line.en, line.pt)), [partCopy, t])
  const isLast = part >= INTRO_PARTS.length - 1
  const { blocked, hideDialog, afterClose } = useHideFollowingDialogs('m1', onContinue)

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto max-w-3xl border-2 border-cyan-hud/50 bg-[#0a1628]/9 px-3 py-2 font-pixel text-[10px] text-cyan-hud sm:text-xs">
          <p>
            {t('Location', 'Local')}: <SciTerm term="Arcadia Planitia" />
          </p>
          <p>{t('Life support', 'Suporte à Vida')}: OK</p>
          <p className="text-energy">{t('Outside power', 'Energia Externa')}: {t('NOT INSTALLED', 'NÃO INSTALADA')}</p>
        </div>
      </div>

      {!blocked && (
      <PixelDialogBox
        key={`m1-intro-${part}`}
        open={open}
        lines={lines}
        title="Capi"
        dialogId={`m1-intro-${part}`}
        onSkip={() => {
          hideDialog()
          setOpen(false)
        }}
        characterSrc={MEDIA.capi.neutral}
        characterAlt="Capi"
        highlightWords={part === 1 ? INTRO_HIGHLIGHT_WORDS[locale] : undefined}
        onTypingComplete={() => setReady(true)}
        onClosed={() => {
          afterClose(isLast, () => {
            setReady(false)
            setPart((p) => p + 1)
            setOpen(true)
          })
        }}
        footer={
          ready ? (
            <McButton
              className="min-h-12 px-6 font-pixel text-lg font-bold"
              style={{ touchAction: 'manipulation' }}
              onClick={() => setOpen(false)}
            >
              {isLast ? t('Next', 'Avançar') : t('Continue', 'Continuar')}
            </McButton>
          ) : null
        }
      />
      )}
    </>
  )
}
