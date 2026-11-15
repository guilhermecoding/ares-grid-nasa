import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { soundEngine } from '../services/soundEngine'

interface Props {
  open: boolean
  missionNumber: number
  title: string
  onComplete: () => void
}

type Phase = 'idle' | 'closing' | 'hold' | 'opening'

/**
 * Pixel-style vertical gate: top + bottom shutters meet at center with a white plaque,
 * then open to reveal the mission screen.
 */
export function MissionGateTransition({ open, missionNumber, title, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!open) {
      setPhase('idle')
      setVisible(false)
      return
    }
    setVisible(true)
    setPhase('closing')
    soundEngine.dialogOpen()
  }, [open])

  useEffect(() => {
    if (phase !== 'closing') return
    const id = window.setTimeout(() => setPhase('hold'), 520)
    return () => clearTimeout(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'hold') return
    const id = window.setTimeout(() => setPhase('opening'), 550)
    return () => clearTimeout(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'opening') return
    const id = window.setTimeout(() => {
      onComplete()
      setVisible(false)
      setPhase('idle')
    }, 480)
    return () => clearTimeout(id)
  }, [phase, onComplete])

  const shut = phase === 'closing' || phase === 'hold'
  const openShutters = phase === 'opening' || phase === 'idle'

  if (!visible && !open) return null

  return (
    <AnimatePresence>
      {visible && (
        <div className="pointer-events-auto fixed inset-0 z-[80]" style={{ imageRendering: 'pixelated' }}>
          {/* Top shutter */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 origin-top border-b-4 border-[#f4fff4]"
            style={{
              background: `
                repeating-linear-gradient(
                  90deg,
                  #1a1c3a 0 8px,
                  #30346d 8px 16px
                ),
                linear-gradient(180deg, #0a1628 0%, #30346d 100%)
              `,
              backgroundBlendMode: 'overlay',
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: shut ? 1 : openShutters && phase === 'opening' ? 0 : shut ? 1 : 0 }}
            transition={{ duration: 0.48, ease: [0.22, 0.08, 0.25, 1] }}
          />
          {/* Bottom shutter */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 origin-bottom border-t-4 border-[#f4fff4]"
            style={{
              background: `
                repeating-linear-gradient(
                  90deg,
                  #1a1c3a 0 8px,
                  #30346d 8px 16px
                ),
                linear-gradient(0deg, #0a1628 0%, #30346d 100%)
              `,
              backgroundBlendMode: 'overlay',
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: shut ? 1 : phase === 'opening' ? 0 : 0 }}
            transition={{ duration: 0.48, ease: [0.22, 0.08, 0.25, 1] }}
          />

          {/* Plaque */}
          <AnimatePresence>
            {(phase === 'hold' || phase === 'closing') && (
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
