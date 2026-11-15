import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useEffect } from 'react'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  onExit: () => void
}

/** Centered soft-lock when base energy is too low to finish the stage. */
export function EnergyDepletedOverlay({ onExit }: Props) {
  useEffect(() => {
    soundEngine.fail()
  }, [])

  return (
    <div
      className="absolute inset-0 z-[100] flex items-center justify-center bg-void-950/85 p-4"
      style={{ touchAction: 'manipulation' }}
      role="alertdialog"
      aria-labelledby="m2-energy-title"
      aria-describedby="m2-energy-body"
    >
      <motion.div
        className="w-full max-w-sm border-2 border-danger bg-[#0a1628] p-5 text-center shadow-[0_0_28px_rgba(255,107,138,0.35)]"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <span
          className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-danger bg-danger/15"
          aria-hidden
        >
          <Zap className="size-9 text-danger" strokeWidth={2.5} fill="currentColor" fillOpacity={0.35} />
        </span>
        <h2 id="m2-energy-title" className="mt-3 font-pixel text-lg tracking-wide text-danger sm:text-xl">
          Energia esgotada
        </h2>
        <p id="m2-energy-body" className="mt-3 font-pixel text-[11px] leading-snug text-[#f4fff4] sm:text-sm">
          A bateria da base acabou — não dá para concluir esta etapa.
        </p>
        <p className="mt-2 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
          Volte ao mapa e tente mexer nos painéis solares para obter mais energia.
        </p>
        <McButton className="mt-5 min-h-12 w-full font-pixel text-lg font-bold" onClick={onExit}>
          Sair e ajustar painéis
        </McButton>
      </motion.div>
    </div>
  )
}
