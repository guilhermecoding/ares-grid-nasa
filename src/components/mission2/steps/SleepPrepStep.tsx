import { MEDIA } from '../../../constants/mediaAssets'
import { McButton } from '../../../opening/McButton'
import { soundEngine } from '../../../services/soundEngine'
import { Mission2Stage } from '../Mission2Stage'
import { SciTermM2 } from '../SciTermM2'

interface Props {
  exerciseDone: boolean
  nutritionDone: boolean
  hygieneDone: boolean
  onSleep: () => void
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex min-h-12 items-center gap-3 border-2 border-cyan-hud/30 bg-[#0a1628]/92 px-3 py-2">
      <span
        className={`flex size-8 shrink-0 items-center justify-center font-pixel text-sm ${
          ok ? 'bg-[#1f8a52] text-[#e8ffe8]' : 'bg-void-800 text-void-400'
        }`}
      >
        {ok ? '✓' : '!'}
      </span>
      <span className="font-pixel text-xs text-[#f4fff4] sm:text-sm">{label}</span>
    </div>
  )
}

/** Desafio 2.4 — review the day and put the habitat to sleep. */
export function SleepPrepStep({ exerciseDone, nutritionDone, hygieneDone, onSleep }: Props) {
  const ready = exerciseDone && nutritionDone && hygieneDone

  const sleep = () => {
    if (!ready) return
    soundEngine.dialogClose()
    onSleep()
  }

  return (
    <Mission2Stage
      title="Desafio 2.4 — Hora de dormir"
      subtitle={
        <>
          A Capi conferiu o dia. Os sensores de <SciTermM2 term="Actigrafia" /> vão medir o descanso.
        </>
      }
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-2">
        <CheckRow ok={exerciseDone} label="Exercícios" />
        <CheckRow ok={nutritionDone} label="Alimentação e hidratação" />
        <CheckRow ok={hygieneDone} label="Higiene" />
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 border-2 border-[#c47848]/70 bg-[#0a1628]/92 p-4">
        <img src={MEDIA.mission2.bunk} alt="" className="size-16 object-contain" draggable={false} />
        <p className="text-center text-sm text-void-100">
          {ready
            ? 'Luzes baixas, cabine pronta. Pode dormir.'
            : 'Ainda falta uma etapa do dia.'}
        </p>
        <McButton
          className="min-h-12 w-full font-pixel text-base font-bold disabled:opacity-40 sm:text-lg"
          disabled={!ready}
          onClick={sleep}
        >
          Preparar Cabine e Dormir
        </McButton>
      </div>
    </Mission2Stage>
  )
}
