import { useState } from 'react'
import { GAME_NASA_SOURCES } from '../../data/mission5Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  playerName: string
  onReplay: () => void
}

export function ExpeditionEnding({ playerName, onReplay }: Props) {
  const [sources, setSources] = useState(false)
  return (
    <div className="mx-auto w-full max-w-xl border-4 border-energy bg-[#0a1628]/92 p-4">
      <p className="font-pixel text-sm text-energy">Comandante {playerName}</p>
      <p className="mt-2 text-sm text-[#f4fff4]">
        A base em Arcádia está de pé: energia, saúde, água, estufa e proteção contra as tempestades.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-12 border-4 border-cyan-hud px-3 font-pixel text-xs text-[#f4fff4]"
          style={{ touchAction: 'manipulation' }}
          onClick={() => {
            soundEngine.click()
            setSources(true)
          }}
        >
          Ver fontes científicas NASA
        </button>
        <McButton onClick={onReplay}>Jogar novamente</McButton>
      </div>
      {sources ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-void-950/75 p-4">
          <div className="max-h-[80dvh] w-full max-w-lg overflow-y-auto border-4 border-cyan-hud bg-[#061018] p-4">
            <p className="font-pixel text-sm text-cyan-hud">Fontes científicas</p>
            <ul className="mt-3 grid gap-2">
              {GAME_NASA_SOURCES.map((line) => (
                <li key={line} className="text-sm text-[#f4fff4]">
                  {line}
                </li>
              ))}
            </ul>
            <McButton
              className="mt-4"
              onClick={() => {
                soundEngine.click()
                setSources(false)
              }}
            >
              Fechar
            </McButton>
          </div>
        </div>
      ) : null}
    </div>
  )
}
