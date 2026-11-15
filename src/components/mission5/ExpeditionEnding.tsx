import { useEffect, useState, type CSSProperties } from 'react'
import { BookOpen, Droplets, HeartPulse, RotateCcw, ShieldAlert, Sprout, Sun, Trophy, X, type LucideIcon } from 'lucide-react'
import { MEDIA } from '../../constants/mediaAssets'
import { EXPEDITION_MISSIONS, GAME_NASA_SOURCES } from '../../data/mission5Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'
import { Tag } from '../missionKit/kit'
import { MISSION_THEMES } from '../missionKit/themes'

interface Props {
  playerName: string
  onReplay: () => void
}

const MEDALS: readonly { icon: LucideIcon; color: string }[] = [
  { icon: Sun, color: '#f0b429' },
  { icon: HeartPulse, color: '#ff6b8a' },
  { icon: Droplets, color: '#38bdf8' },
  { icon: Sprout, color: '#5ecf9a' },
  { icon: ShieldAlert, color: '#ffb15a' },
]
const CONFETTI_COLORS = ['#f0b429', '#5ecf9a', '#38bdf8', '#ff6b8a', '#b78bff', '#ffffff']
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 7) * 0.35,
  duration: 2.6 + (i % 5) * 0.4,
  drift: ((i % 5) - 2) * 26,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}))
const MEDAL_MS = 420

/** Cena 7: the finished base, one medal per mission and the science sources. */
export function ExpeditionEnding({ playerName, onReplay }: Props) {
  const [sources, setSources] = useState(false)
  const [medals, setMedals] = useState(0)

  useEffect(() => {
    if (medals >= MEDALS.length) return
    const id = window.setTimeout(() => {
      if (medals === MEDALS.length - 1) soundEngine.missionComplete()
      else soundEngine.cycle(medals)
      setMedals((value) => value + 1)
    }, MEDAL_MS)
    return () => window.clearTimeout(id)
  }, [medals])

  return (
    <div className="gk-panel relative mx-auto flex max-h-full w-full max-w-3xl flex-col overflow-y-auto" style={{ ...MISSION_THEMES.greenhouse, borderColor: '#f0b429', borderWidth: 4 }}>
      <div className="relative aspect-[620/250] min-h-36 shrink-0 overflow-hidden border-b-4 border-energy">
        <img src={MEDIA.mission5.baseClear} alt="Base em Arcádia pronta, com painéis solares e habitat" className="gk-pixelated absolute inset-0 h-full w-full object-cover object-[50%_40%]" draggable={false} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,15,0.1),rgba(4,8,15,0.75))]" />
        <Tag tone="energy" className="absolute top-2 left-2">
          <Trophy className="size-3" aria-hidden /> Expedição concluída
        </Tag>
        <div className="absolute inset-x-3 bottom-2">
          <p className="font-pixel text-[10px] text-energy uppercase md:text-xs">Comandante</p>
          <h2 className="gk-pop font-pixel text-xl leading-tight text-[#f4fff4] uppercase [text-shadow:3px_3px_0_#04080f] md:text-3xl">{playerName}</h2>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-3 md:p-4">
        <p className="text-sm leading-snug text-[#f4fff4] md:text-base">
          A base em Arcádia está de pé: energia, saúde, água, estufa e proteção contra as tempestades.
        </p>

        <ol className="grid grid-cols-5 gap-1.5 sm:gap-2" aria-label="Medalhas das cinco missões">
          {EXPEDITION_MISSIONS.map((mission, index) => {
            const medal = MEDALS[index]
            const Icon = medal.icon
            const earned = index < medals
            return (
              <li key={mission} className="flex flex-col items-center gap-1.5 text-center">
                <span
                  className={`flex size-12 items-center justify-center rounded-full border-4 border-[#04080f] sm:size-16 ${earned ? 'gk-pop' : 'opacity-25'}`}
                  style={{
                    background: earned ? medal.color : '#30346d',
                    boxShadow: earned ? `0 0 0 3px ${medal.color}55, 0 0 18px ${medal.color}` : undefined,
                  }}
                >
                  <Icon className="size-6 text-[#04080f] sm:size-8" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="font-pixel text-[8px] leading-tight text-[#f4fff4]/90 uppercase sm:text-[10px]">{mission}</span>
              </li>
            )
          })}
        </ol>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            className="flex min-h-14 items-center justify-center gap-2 border-4 border-cyan-hud bg-[#04080f]/80 px-3 font-pixel text-xs text-[#f4fff4] uppercase"
            style={{ touchAction: 'manipulation' }}
            onClick={() => {
              soundEngine.click()
              setSources(true)
            }}
          >
            <BookOpen className="size-4" aria-hidden /> Ver fontes científicas NASA
          </button>
          <McButton className="mc-btn-green min-h-14 px-3 font-pixel text-xs md:text-sm" onClick={onReplay}>
            <span className="flex items-center justify-center gap-2">
              <RotateCcw className="size-4" aria-hidden /> Jogar novamente
            </span>
          </McButton>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 z-[35] overflow-hidden" aria-hidden>
        {CONFETTI.map((piece, i) => (
          <span
            key={i}
            className="absolute -top-3 h-2.5 w-1.5"
            style={
              {
                left: `${piece.left}%`,
                background: piece.color,
                '--confetti-drift': `${piece.drift}px`,
                '--confetti-spin': `${360 + i * 40}deg`,
                animation: `confetti-fall ${piece.duration}s linear ${piece.delay}s infinite`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      {sources ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-void-950/80 p-4" role="dialog" aria-modal="true" aria-label="Fontes científicas">
          <div className="gk-pop max-h-[80dvh] w-full max-w-lg overflow-y-auto border-4 border-cyan-hud bg-[#061018] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 font-pixel text-sm text-cyan-hud uppercase">
                <BookOpen className="size-4" aria-hidden /> Fontes científicas
              </p>
              <button
                type="button"
                aria-label="Fechar as fontes"
                className="flex size-11 items-center justify-center border-2 border-cyan-hud text-[#f4fff4]"
                style={{ touchAction: 'manipulation' }}
                onClick={() => {
                  soundEngine.click()
                  setSources(false)
                }}
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <ul className="mt-3 grid gap-2">
              {GAME_NASA_SOURCES.map((line) => (
                <li key={line} className="border-l-4 border-cyan-hud bg-[#04080f]/60 py-1.5 pr-2 pl-2 text-sm text-[#f4fff4]">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
