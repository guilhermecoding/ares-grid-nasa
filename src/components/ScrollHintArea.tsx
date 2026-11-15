import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Classes on the scrolling viewport */
  className?: string
  /** Classes on the relative frame that holds the arrows */
  frameClassName?: string
  /** Light panel (logbook) vs dark HUD */
  variant?: 'light' | 'dark'
}

function ScrollArrow({
  direction,
  variant,
}: {
  direction: 'up' | 'down'
  variant: 'light' | 'dark'
}) {
  const isUp = direction === 'up'
  const tone =
    variant === 'light'
      ? 'border-[#1a1c3a] bg-[#30346d] text-[#f4fff4]'
      : 'border-cyan-hud/60 bg-[#0a1628]/92 text-cyan-hud'

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-[5] flex justify-center ${
        isUp ? 'top-1' : 'bottom-1'
      }`}
      aria-hidden
    >
      <span
        className={`scroll-hint-float flex size-7 items-center justify-center border-2 ${tone} ${
          isUp ? 'scroll-hint-float-up' : ''
        }`}
      >
        <svg viewBox="0 0 16 16" className="size-4" fill="currentColor">
          {isUp ? (
            <path d="M8 3 L13 10 H3 Z" />
          ) : (
            <path d="M3 6 H13 L8 13 Z" />
          )}
        </svg>
      </span>
    </div>
  )
}

/** Scroll container with always-visible game scrollbar + floating up/down hints. */
export function ScrollHintArea({
  children,
  className = '',
  frameClassName = '',
  variant = 'dark',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [canUp, setCanUp] = useState(false)
  const [canDown, setCanDown] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    const max = scrollHeight - clientHeight
    const epsilon = 4
    if (max <= epsilon) {
      setCanUp(false)
      setCanDown(false)
      return
    }
    setCanUp(scrollTop > epsilon)
    setCanDown(scrollTop < max - epsilon)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    ro?.observe(el)
    // Content size changes (images, checklist reveals)
    const mo =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver(() => {
            requestAnimationFrame(update)
          })
        : null
    mo?.observe(el, { childList: true, subtree: true, characterData: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      ro?.disconnect()
      mo?.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [update])

  const scrollClass = variant === 'light' ? 'scroll-game' : 'scroll-game-dark'

  return (
    <div className={`relative min-h-0 min-w-0 ${frameClassName}`.trim()}>
      <div ref={ref} className={`${scrollClass} ${className}`.trim()} onScroll={update}>
        {children}
      </div>
      {canUp ? <ScrollArrow direction="up" variant={variant} /> : null}
      {canDown ? <ScrollArrow direction="down" variant={variant} /> : null}
    </div>
  )
}
