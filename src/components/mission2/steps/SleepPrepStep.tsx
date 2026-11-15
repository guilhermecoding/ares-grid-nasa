import { motion } from 'framer-motion'
import { MEDIA } from '../../../constants/mediaAssets'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { SciTermM2 } from '../SciTermM2'

interface Props {
  exerciseDone: boolean
  nutritionDone: boolean
  hygieneDone: boolean
  onSleep: () => void
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex min-h-12 items-center gap-3 rounded-md border border-cyan-hud/25 bg-[#0a1628]/8 px-3 py-2">
      <span
        className={`flex size-8 items-center justify-center rounded-full font-pixel text-sm ${
          ok ? 'bg-[#1f8a52] text-[#e8ffe8]' : 'bg-void-800 text-void-400'
        }`}
      >
        {ok ? '✓' : '!'}
      </span>
      <span className="font-pixel text-xs text-[#f4fff4] sm:text-sm">{label}</span>
    </div>
  )
}

export function SleepPrepStep({ exerciseDone, nutritionDone, hygieneDone, onSleep }: Props) {
  const ready = exerciseDone && nutritionDone && hygieneDone

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ touchAction: 'manipulation' }}>
      <div className="pointer-events-none h-[7.5rem] shrink-0 sm:h-32" />

      <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col px-3 sm:px-4">
        <div className="flex items-start gap-3">
          <img src={MEDIA.mission2.bunk} alt="" className="size-12 object-contain" draggable={false} />
          <div>
            <h2 className="font-pixel text-sm text-cyan-hud sm:text-base">Desafio 2.4 — Hora de dormir</h2>
            <p className="mt-1 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
              A Capi revisa o dia. Depois preparamos a cabine. Sensores de{' '}
              <SciTermM2 term="Actigrafia" /> ajudam a medir o sono.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <CheckRow ok={exerciseDone} label="Exercícios registrados" />
          <CheckRow ok={nutritionDone} label="Alimentação e hidratação" />
          <CheckRow ok={hygieneDone} label="Higiene completa" />
        </div>

        <motion.p
          className="mt-4 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {ready
            ? 'Tudo certo, Comandante! Pode preparar a cabine e dormir.'
            : 'Ainda falta algo no checklist. Volte se precisar (nesta missão o fluxo já garante os passos).'}
        </motion.p>
      </div>

      <div className="shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4">
        <McButton
          className="min-h-12 w-full font-pixel text-lg font-bold disabled:opacity-40"
          disabled={!ready}
          onClick={() => {
            soundEngine.dialogClose()
            onSleep()
          }}
        >
          Preparar Cabine e Dormir
        </McButton>
      </div>
    </div>
  )
}
