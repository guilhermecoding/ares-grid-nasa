import { ARCADIA_SITE } from '../data/arcadiaSiteData'

interface Props {
  playerName: string
  level: number
  solsPlayed: number
  onNameChange: (name: string) => void
  onStart: () => void
}

export function HomeScreen({ playerName, level, solsPlayed, onNameChange, onStart }: Props) {
  return (
    <div className="relative flex h-full flex-col overflow-auto">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 10%, rgba(139,92,246,0.4), transparent 45%), radial-gradient(ellipse at 80% 90%, rgba(78,161,255,0.25), transparent 40%), #07040f',
        }}
        aria-hidden
      />

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-4 py-8 sm:px-8">
        <div className="text-center">
          <p className="mb-2 text-5xl" aria-hidden>
            🤖🌌☀️
          </p>
          <h1 className="font-pixel text-5xl text-void-100 sm:text-6xl">Mars Adventures</h1>
          <p className="mx-auto mt-3 max-w-xl text-base font-bold text-void-300 sm:text-lg">
            Sua fazendinha espacial em{' '}
            <span className="text-star">
              {ARCADIA_SITE.name} ({ARCADIA_SITE.sector})
            </span>
            . Ande, trabalhe, durma — e cuide da base com o clima real da NASA.
          </p>
        </div>

        <div className="glass-panel mx-auto w-full max-w-md rounded-2xl p-5">
          <label className="block text-sm font-bold text-nebula" htmlFor="pilot-name">
            Nome do robô
          </label>
          <input
            id="pilot-name"
            value={playerName}
            onChange={(e) => onNameChange(e.target.value)}
            maxLength={20}
            className="mt-2 w-full touch-target rounded-xl border-2 border-panel-edge bg-void-900 px-3 font-bold text-void-100 placeholder:text-void-400"
            placeholder="Robô Jr."
          />
          <p className="mt-2 text-xs font-bold text-void-400">
            Nível {level} · {solsPlayed} Sols jogados neste aparelho
          </p>
          <button
            type="button"
            onClick={onStart}
            className="pixel-btn mt-4 w-full touch-target rounded-xl bg-star font-pixel text-xl font-bold text-void-950"
          >
            Entrar na base
          </button>
        </div>

        <ul className="mx-auto grid max-w-2xl gap-2 text-sm font-bold text-void-200 sm:grid-cols-3">
          <li className="space-panel rounded-xl p-3">Ande com as setas</li>
          <li className="space-panel rounded-xl p-3">Interaja e suba de nível</li>
          <li className="space-panel rounded-xl p-3">Clima DONKI a cada Sol</li>
        </ul>
      </main>
    </div>
  )
}
