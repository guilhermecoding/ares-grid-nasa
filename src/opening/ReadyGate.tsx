import { useState } from 'react'
import { MEDIA } from '../constants/mediaAssets'
import { LaunchSpaceCanvas } from './LaunchSpaceCanvas'

interface ReadyGateProps {
  openingCompleted: boolean
  playerName: string
  onStartIntro: () => void
  onContinue: () => void
  onReplayIntro: () => void
}

export function ReadyGate({ openingCompleted, playerName, onStartIntro, onContinue, onReplayIntro }: ReadyGateProps) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden" style={{ touchAction: 'manipulation' }}>
      <LaunchSpaceCanvas warp={0.15} />

      <div className="relative z-10 flex max-w-lg flex-col items-center gap-4 px-5 py-8 text-center">
        <p className="font-pixel text-sm tracking-widest text-cyan-hud/80 uppercase">Missão Arcadia Planitia</p>
        <h1 className="font-pixel text-5xl leading-none text-void-100 drop-shadow-[0_0_18px_rgba(78,161,255,0.45)] sm:text-6xl">
          Ares Grid
        </h1>

        <div className="relative mt-2">
          <div className="absolute inset-0 rounded-full bg-cyan-hud/20 blur-2xl" aria-hidden />
          {!imgFailed ? (
            <img
              src={MEDIA.capi.neutral}
              alt="Capi, assistente virtual"
              className="relative h-36 w-36 object-contain drop-shadow-[0_0_20px_rgba(94,231,255,0.35)] sm:h-44 sm:w-44"
              onError={() => setImgFailed(true)}
              draggable={false}
            />
          ) : (
            <div
              className="relative flex h-36 w-36 items-center justify-center rounded-full border-2 border-cyan-hud/50 bg-void-800 font-pixel text-4xl text-cyan-hud sm:h-44 sm:w-44"
              aria-label="Capi"
            >
              C
            </div>
          )}
        </div>

        <p className="max-w-sm font-body text-base text-void-200">
          {openingCompleted
            ? `Bem-vindo de volta, ${playerName}! Pronto para voltar à base?`
            : 'Sua assistente Capi te espera. Prepare-se para decolar rumo a Marte!'}
        </p>

        {openingCompleted ? (
          <div className="mt-2 flex w-full flex-col gap-3">
            <button
              type="button"
              className="pixel-btn min-h-12 w-full rounded-xl bg-star px-6 font-pixel text-xl font-bold text-void-950"
              onClick={onContinue}
            >
              CONTINUAR
            </button>
            <button
              type="button"
              className="min-h-12 w-full rounded-xl border border-void-500/60 bg-void-800/60 px-4 font-body text-sm text-void-300 hover:text-void-100"
              onClick={onReplayIntro}
            >
              Ver introdução
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="pixel-btn mt-2 min-h-14 w-full max-w-xs rounded-xl bg-star px-6 font-pixel text-xl font-bold text-void-950 sm:text-2xl"
            onClick={onStartIntro}
          >
            INICIAR AVENTURA
          </button>
        )}
      </div>
    </div>
  )
}
