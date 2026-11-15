import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  onExit: () => void
}

/** Full-screen GAME OVER when outdoor wellbeing hits zero. */
export function GameOverOverlay({ onExit }: Props) {
  useEffect(() => {
    soundEngine.fail()
  }, [])

  return (
    <div
      className="absolute inset-0 z-[100] flex items-center justify-center bg-void-950/90 p-4"
      style={{ touchAction: 'manipulation' }}
      role="alertdialog"
      aria-labelledby="m1-game-over-title"
      aria-describedby="m1-game-over-body"
    >
      <motion.div
        className="w-full max-w-md border-2 border-danger bg-[#0a1628] p-5 text-center shadow-[0_0_28px_rgba(255,107,138,0.35)]"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <img
          src={MEDIA.capi.duvida}
          alt=""
          className="mx-auto size-20 rounded object-cover"
          draggable={false}
        />
        <h2 id="m1-game-over-title" className="mt-3 font-pixel text-xl tracking-wide text-danger sm:text-2xl">
          GAME OVER
        </h2>
        <p id="m1-game-over-body" className="mt-3 font-pixel text-[11px] leading-snug text-[#f4fff4] sm:text-sm">
          A saúde chegou a zero — volte à base! A Saúde volta a 70. Se a missão não foi concluída, ela começa do início.
        </p>
        <McButton className="mt-5 min-h-12 w-full font-pixel text-lg font-bold" onClick={onExit}>
          Voltar ao mapa
        </McButton>
      </motion.div>
    </div>
  )
}
