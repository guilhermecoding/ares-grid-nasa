import { motion } from 'framer-motion'
import { MEDIA } from '../../../constants/mediaAssets'
import type { Mission2Scores } from '../../../data/mission2Data'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'

interface Props {
  playerName: string
  scores: Mission2Scores
  onAdvance: () => void
}

export function MorningWakeupStep({ playerName, scores, onAdvance }: Props) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-void-950/50 p-4" style={{ touchAction: 'manipulation' }}>
      <motion.div
        className="w-full max-w-md border-2 border-cyan-hud bg-[#0a1628] p-5 text-center shadow-[0_0_24px_rgba(94,231,255,0.2)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <img
          src={MEDIA.capi.excited2}
          alt="Capi"
          className="mx-auto size-20 rounded object-cover"
          draggable={false}
        />
        <p className="mt-3 font-pixel text-sm text-cyan-hud sm:text-base">
          Bom dia, Comandante {playerName}!
        </p>
        <p className="mt-2 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
          O Sol nasce em Arcadia. Seu corpo e a base estão prontos para a próxima exploração.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-left">
          <div className="rounded border border-cyan-hud/30 bg-void-950/60 px-2 py-2">
            <p className="font-pixel text-[9px] text-void-300">Pontos de ciência</p>
            <p className="font-pixel text-lg text-cyan-hud">{scores.sciencePoints}</p>
          </div>
          <div className="rounded border border-cyan-hud/30 bg-void-950/60 px-2 py-2">
            <p className="font-pixel text-[9px] text-void-300">Pontos de saúde</p>
            <p className="font-pixel text-lg text-[#5ecf9a]">{scores.healthPoints}</p>
          </div>
          <div className="rounded border border-cyan-hud/30 bg-void-950/60 px-2 py-2">
            <p className="font-pixel text-[9px] text-void-300">Sleep Score</p>
            <p className="font-pixel text-lg text-[#f0b429]">{scores.sleepScore}</p>
          </div>
          <div className="rounded border border-cyan-hud/30 bg-void-950/60 px-2 py-2">
            <p className="font-pixel text-[9px] text-void-300">Saúde</p>
            <p className="font-pixel text-lg text-[var(--color-wellbeing)]">{scores.wellbeing}%</p>
          </div>
        </div>

        <McButton
          className="mt-5 min-h-12 w-full font-pixel text-sm font-bold leading-tight sm:text-base"
          onClick={() => {
            soundEngine.missionComplete()
            onAdvance()
          }}
        >
          AVANÇAR PARA A MISSÃO 03: O MISTÉRIO DO GELO
        </McButton>
      </motion.div>
    </div>
  )
}
