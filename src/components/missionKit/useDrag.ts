import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

export interface DragState<T> {
  payload: T
  /** Pointer position in the viewport. */
  x: number
  y: number
  /** Where the drag started (center of the picked element). */
  originX: number
  originY: number
  /** Value of `data-drop` under the pointer, when there is one. */
  over: string | null
}

function dropTargetAt(x: number, y: number): string | null {
  return document.elementFromPoint(x, y)?.closest('[data-drop]')?.getAttribute('data-drop') ?? null
}

/**
 * Pointer drag shared by the mission mini-games.
 * Drop zones mark themselves with `data-drop="id"`; `onDrop` receives the id under the pointer.
 */
export function useDrag<T>(
  onDrop: (payload: T, target: string | null) => void,
  /** Runs on every pointer move, for tools that work while they pass over a target. */
  onMove?: (payload: T, target: string | null) => void,
) {
  const [drag, setDrag] = useState<DragState<T> | null>(null)
  const payloadRef = useRef<T | null>(null)
  const dropRef = useRef(onDrop)
  const moveRef = useRef(onMove)
  const active = drag !== null

  useEffect(() => {
    dropRef.current = onDrop
    moveRef.current = onMove
  }, [onDrop, onMove])

  useEffect(() => {
    if (!active) return
    const move = (e: PointerEvent) => {
      const over = dropTargetAt(e.clientX, e.clientY)
      setDrag((current) => (current ? { ...current, x: e.clientX, y: e.clientY, over } : current))
      if (payloadRef.current !== null) moveRef.current?.(payloadRef.current, over)
    }
    const end = (e: PointerEvent) => {
      const payload = payloadRef.current
      payloadRef.current = null
      setDrag(null)
      if (payload === null) return
      dropRef.current(payload, e.type === 'pointercancel' ? null : dropTargetAt(e.clientX, e.clientY))
    }
    // Keep the browser from selecting text or images while the pointer travels.
    const previousSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    return () => {
      document.body.style.userSelect = previousSelect
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
    }
  }, [active])

  const start = (payload: T, e: ReactPointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    payloadRef.current = payload
    setDrag({
      payload,
      x: e.clientX,
      y: e.clientY,
      originX: rect.left + rect.width / 2,
      originY: rect.top + rect.height / 2,
      over: null,
    })
  }

  return { drag, start }
}
