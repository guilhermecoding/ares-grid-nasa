import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/locale'

interface Props {
  className: string
}

function isFullscreen(): boolean {
  const doc = document as Document & { webkitFullscreenElement?: Element | null }
  return Boolean(document.fullscreenElement || doc.webkitFullscreenElement)
}

function requestGameFullscreen() {
  const root = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => void
  }
  const request = root.requestFullscreen?.bind(root) ?? root.webkitRequestFullscreen?.bind(root)
  if (!request) return
  void Promise.resolve(request()).catch(() => {})
}

function exitGameFullscreen() {
  const doc = document as Document & { webkitExitFullscreen?: () => void }
  const exit = document.exitFullscreen?.bind(document) ?? doc.webkitExitFullscreen?.bind(document)
  if (!exit) return
  void Promise.resolve(exit()).catch(() => {})
}

/** Toggle fullscreen. Sits beside the leave button on the map and in missions. */
export function FullscreenButton({ className }: Props) {
  const { t } = useI18n()
  const [active, setActive] = useState(() => isFullscreen())

  useEffect(() => {
    const sync = () => setActive(isFullscreen())
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [])

  const label = active ? t('Exit full screen', 'Sair da tela cheia') : t('Full screen', 'Tela cheia')

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      title={label}
      onClick={() => (active ? exitGameFullscreen() : requestGameFullscreen())}
    >
      {active ? (
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
          <path d="M4 9h5V4" />
          <path d="M15 4v5h5" />
          <path d="M4 15h5v5" />
          <path d="M20 15h-5v5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
          <path d="M4 9V4h5" />
          <path d="M20 9V4h-5" />
          <path d="M4 15v5h5" />
          <path d="M20 15v5h-5" />
        </svg>
      )}
    </button>
  )
}
