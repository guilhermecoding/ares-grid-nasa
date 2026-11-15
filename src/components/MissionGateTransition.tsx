import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { soundEngine } from '../services/soundEngine'

interface Props {
  open: boolean
  /** When true, shutters may open (mission screen mounted & ready behind the gate). */
  contentReady: boolean
  missionNumber: number
  title: string
  /** Fired once shutters are fully closed — mount the mission under the gate. */
  onClosed: () => void
  /** Fired once shutters have opened again — clear the gate overlay. */
  onOpened: () => void
}

type Phase = 'idle' | 'closing' | 'closed' | 'opening'

/**
 * Pixel-style vertical gate: closes first, waits until contentReady, then opens.
 * Close SFX on shut; open SFX on reveal.
 */
export function MissionGateTransition({
  open,
  contentReady,
  missionNumber,
  title,
  onClosed,
  onOpened,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [visible, setVisible] = useState(false)
  const closedNotified = useRef(false)
  const openedNotified = useRef(false)

  useEffect(() => {
    if (!open) {
      setPhase('idle')
      setVisible(false)
      closedNotified.current = false
      openedNotified.current = false
      return
    }
    closedNotified.current = false
    openedNotified.current = false
    setVisible(true)
    setPhase('closing')
    soundEngine.dialogClose()
  }, [open])

  useEffect(() => {
    if (phase !== 'closing') return
    const id = window.setTimeout(() => {
      setPhase('closed')
      if (!closedNotified.current) {
        closedNotified.current = true
        onClosed()
      }
    }, 520)
    return () => clearTimeout(id)
  }, [phase, onClosed])

  useEffect(() => {
    if (phase !== 'closed' || !contentReady) return
    const hold = window.setTimeout(() => {
      setPhase('opening')
      soundEngine.dialogOpen()
    }, 280)
    return () => clearTimeout(hold)
  }, [phase, contentReady])

  useEffect(() => {
    if (phase !== 'opening') return
    const id = window.setTimeout(() => {
      if (!openedNotified.current) {
        openedNotified.current = true
        onOpened()
      }
      setVisible(false)
      setPhase('idle')
    }, 500)
    return () => clearTimeout(id)
  }, [phase, onOpened])

  const shut = phase === 'closing' || phase === 'closed'
  const showPlaque = phase === 'closing' || phase === 'closed'

  if (!visible && !open) return null

  return (
    <AnimatePresence>
      {visible && (
        <div className="pointer-events-auto fixed inset-0 z-[80]" style={{ imageRendering: 'pixelated' }}>
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 origin-top border-b-4 border-[#f4fff4]"
            style={{
              background: `
                repeating-linear-gradient(90deg, #1a1c3a 0 8px, #30346d 8px 16px),
                linear-gradient(180deg, #0a1628 0%, #30346d 100%)
              `,
              backgroundBlendMode: 'overlay',
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: shut ? 1 : 0 }}
            transition={{ duration: 0.48, ease: [0.22, 0.08, 0.25, 1] }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 origin-bottom border-t-4 border-[#f4fff4]"
            style={{
              background: `
                repeating-linear-gradient(90deg, #1a1c3a 0 8px, #30346d 8px 16px),
                linear-gradient(0deg, #0a1628 0%, #30346d 100%)
              `,
              backgroundBlendMode: 'overlay',
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: shut ? 1 : 0 }}
            transition={{ duration: 0.48, ease: [0.22, 0.08, 0.25, 1] }}
          />

          <AnimatePresence>
            {showPlaque && (
              <motion.div
                className="absolute top-1/2 left-1/2 z-10 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 border-4 border-[#1a1c3a] bg-[#f4fff4] px-4 py-3 text-center shadow-[0_0_0_3px_#30346d]"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <p className="font-pixel text-sm leading-snug text-[#1a1c3a] sm:text-base md:text-lg">
                  Missão {missionNumber} - {title}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  )
}
