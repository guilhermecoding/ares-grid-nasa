import { BookOpen, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { GAME_NASA_SOURCES } from '../../data/mission5Data'
import { useI18n } from '../../i18n/locale'
import { soundEngine } from '../../services/soundEngine'

/** Button on the expedition end screen that opens the NASA sources of the whole game. */
export function NasaSources() {
  const { t, locale } = useI18n()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 border-2 border-cyan-hud/60 bg-void-950/60 px-3 font-pixel text-xs text-cyan-hud uppercase"
        style={{ touchAction: 'manipulation' }}
        onClick={() => {
          soundEngine.click()
          setOpen(true)
        }}
      >
        <BookOpen className="size-4 shrink-0" aria-hidden />
        {t('See NASA science sources', 'Ver fontes científicas NASA')}
      </button>
      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex items-center justify-center bg-void-950/80 p-4"
              role="dialog"
              aria-modal="true"
              aria-label={t('Science sources', 'Fontes científicas')}
            >
              <div className="gk-pop max-h-[80dvh] w-full max-w-lg overflow-y-auto border-4 border-cyan-hud bg-[#061018] p-4 text-left">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-pixel text-sm text-cyan-hud uppercase">
                    <BookOpen className="size-4" aria-hidden /> {t('Science sources', 'Fontes científicas')}
                  </p>
                  <button
                    type="button"
                    aria-label={t('Close the sources', 'Fechar as fontes')}
                    className="flex size-11 items-center justify-center border-2 border-cyan-hud text-[#f4fff4]"
                    style={{ touchAction: 'manipulation' }}
                    onClick={() => {
                      soundEngine.click()
                      setOpen(false)
                    }}
                  >
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
                <ul className="mt-3 grid gap-2">
                  {GAME_NASA_SOURCES.map((line) => (
                    <li
                      key={line.en}
                      className="border-l-4 border-cyan-hud bg-[#04080f]/60 py-1.5 pr-2 pl-2 text-sm text-[#f4fff4]"
                    >
                      {line[locale]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
