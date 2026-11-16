import { useEffect, useRef, useState } from 'react'

interface Props {
  message: string | null
}

const SHOW_MS = 3000

export function MessageBadge({ message }: Props) {
  const [visible, setVisible] = useState(false)
  const [text, setText] = useState('')
  const prev = useRef<string | null>(null)

  useEffect(() => {
    if (!message || message === prev.current) return
    prev.current = message
    const showId = window.setTimeout(() => {
      setText(message)
      setVisible(true)
    }, 0)
    const hideId = window.setTimeout(() => setVisible(false), SHOW_MS)
    return () => {
      window.clearTimeout(showId)
      window.clearTimeout(hideId)
    }
  }, [message])

  if (!text) return null

  return (
    <div
      className={`pointer-events-none absolute left-1/2 z-40 w-[min(92vw,28rem)] -translate-x-1/2 rounded-xl bg-white px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition-all duration-300 sm:w-[min(70vw,32rem)] sm:rounded-2xl sm:px-4 sm:py-2.5 md:w-[min(50vw,36rem)] md:px-5 md:py-3 ${
        visible
          ? 'top-[max(0.75rem,env(safe-area-inset-top))] translate-y-0 opacity-100 sm:top-4'
          : 'top-2 -translate-y-1 opacity-0 sm:top-3'
      }`}
      role="status"
      aria-live="polite"
    >
      <p className="text-center font-pixel text-xs leading-snug text-[#1a1028] sm:text-sm md:text-base">
        {text}
      </p>
    </div>
  )
}
