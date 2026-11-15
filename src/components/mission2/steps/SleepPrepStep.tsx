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

      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col justify-center px-3 pb-24 sm:px-4">
        <h2 className="font-pixel text-sm text-cyan-hud sm:text-base">Etapa — Sono</h2>
        <p className="mt-1 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
          Checklist do dia. Sensores de <SciTermM2 term="Actigrafia" /> medem o descanso.
        </p>

        <div className="mt-4 space-y-2">
          <CheckRow ok={exerciseDone} label="Exercícios registrados" />
          <CheckRow ok={nutritionDone} label="Alimentação e hidratação" />
          <CheckRow ok={hygieneDone} label="Higiene completa" />
        </div>

        <motion.button
          type="button"
          whileTap={ready ? { scale: 0.98 } : undefined}
          disabled={!ready}
          onClick={() => {
            soundEngine.dialogClose()
            onSleep()
          }}
          className={`mt-5 flex min-h-[7.5rem] w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition ${
            ready
              ? 'border-[#c47848] bg-[#0a1628]/95 shadow-[inset_0_0_0_2px_#c4784899]'
              : 'border-void-600/40 bg-[#0a1628]/60 opacity-50'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <span className="flex size-16 shrink-0 items-center justify-center rounded-md border-2 border-[#c47848] bg-[#c47848]/25">
            <img src={MEDIA.mission2.bunk} alt="" className="size-12 object-contain" draggable={false} />
          </span>
          <span className="min-w-0">
            <span className="block font-pixel text-sm text-[#f4fff4] sm:text-base">Preparar cabine</span>
            <span className="mt-1 block font-pixel text-[10px] text-void-300 sm:text-xs">
              Luz baixa, bunk pronta, sensores de sono ativos.
            </span>
            <span className="mt-2 block font-pixel text-xs font-bold text-[#c47848]">+ bem-estar ao amanhecer</span>
          </span>
        </motion.button>

        <motion.p
          className="mt-3 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {ready
            ? 'Tudo certo, Comandante! Toque no card para dormir.'
            : 'Ainda falta algo no checklist.'}
        </motion.p>
      </div>

      <div className="absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex justify-end px-3 sm:px-4">
        <McButton
          className="min-h-12 min-w-[10rem] font-pixel text-lg font-bold disabled:opacity-40"
          disabled={!ready}
          onClick={() => {
            soundEngine.dialogClose()
            onSleep()
          }}
        >
          Dormir
        </McButton>
      </div>
    </div>
  )
}
