import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { setMuted, soundEngine, unlockAudio } from '../services/soundEngine'

interface CountdownSceneProps {
  onComplete: () => void
}

export function CountdownScene({ onComplete }: CountdownSceneProps) {
  const [started, setStarted] = useState(false)
  const [count, setCount] = useState(10)
  const [finished, setFinished] = useState(false)

  const start = useCallback(() => {
    void unlockAudio()
    setMuted(false)
    soundEngine.click()
    setStarted(true)
  }, [])

  useEffect(() => {
    if (!started || finished) return

    soundEngine.telemetry()
    if (count <= 3) soundEngine.ignition(count)

    const id = window.setTimeout(() => {
      if (count <= 0) setFinished(true)
      else setCount((c) => c - 1)
    }, 1000)
    return () => clearTimeout(id)
  }, [started, count, finished])

  useEffect(() => {
    if (!finished) return
    onComplete()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- invoke once when finished
  }, [finished])

  const shake = started && !finished && count <= 3 ? 0.4 + (3 - count) * 0.35 : 0
  const shakeX = shake > 0 ? [0, -6 * shake, 5 * shake, -4 * shake, 3 * shake, 0] : 0
  const shakeY = shake > 0 ? [0, 4 * shake, -5 * shake, 3 * shake, -2 * shake, 0] : 0

  return (
    <motion.div
      className="relative flex h-full w-full items-center justify-center bg-black"
      style={{ touchAction: 'manipulation' }}
      animate={{ x: shakeX, y: shakeY }}
      transition={{ duration: 0.45, repeat: shake > 0 ? Infinity : 0 }}
    >
      {!started ? (
        <button
          type="button"
          className="pixel-btn min-h-14 rounded-xl border-2 border-void-400 bg-void-900 px-8 font-pixel text-xl font-bold text-void-100"
          onClick={start}
        >
          INICIAR CONTAGEM
        </button>
      ) : (
        <AnimatePresence mode="wait">
          {!finished && (
            <motion.span
              key={count}
              className="font-pixel text-[7rem] leading-none text-void-100 sm:text-[9rem]"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  )
}
