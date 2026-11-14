import { useState } from 'react'
import { MEDIA } from '../constants/mediaAssets'
import { soundEngine } from '../services/soundEngine'
import { LaunchSpaceCanvas } from './LaunchSpaceCanvas'
import { McButton } from './McButton'

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
    <div
      className="absolute inset-0 flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden"
      style={{ touchAction: 'manipulation' }}
    >
      <LaunchSpaceCanvas warp={0.18} cockpit={false} className="z-0" />

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
          <div className="mt-2 flex w-full flex-col items-center gap-3">
            <McButton className="min-h-14 w-full max-w-xs px-6 font-pixel text-xl font-bold sm:text-2xl" onClick={onContinue}>
              CONTINUAR
            </McButton>
            <button
              type="button"
              className="min-h-12 w-full max-w-xs border-0 bg-transparent px-4 font-body text-sm text-void-300 underline-offset-2 hover:text-void-100 hover:underline"
              onClick={() => {
                soundEngine.goStart()
                onReplayIntro()
              }}
            >
              Ver introdução
            </button>
          </div>
        ) : (
          <McButton className="mt-2 min-h-14 w-full max-w-xs px-6 font-pixel text-xl font-bold sm:text-2xl" onClick={onStartIntro}>
            INICIAR AVENTURA
          </McButton>
        )}
      </div>
    </div>
  )
}
