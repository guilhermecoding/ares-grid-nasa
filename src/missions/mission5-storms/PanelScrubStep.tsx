import { useEffect, useRef, useState } from 'react'
import { Brush, Lock, Sun, Wind, Zap } from 'lucide-react'
import { DustScrubCanvas } from '../../components/DustScrubCanvas'
import { BarMeter, ChallengeBar, GameCta, Tag } from '../../components/missionKit/kit'
import { MISSION5_META } from '../../data/mission5Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  /** The wind countdown waits while Capi is talking. */
  paused?: boolean
  windSafe: boolean
  panelsClean: boolean
  onWindSafe: () => void
  onEarly: () => void
  onClean: () => void
  onDone: () => void
}

const WAIT_S = 6
const WIND_CALM = 18
const WIND_PER_S = 13
const WIND_MAX = 110
const SAFE_BELOW = 40
const DUSTY_SHARE = 0.25
const CELLS = Array.from({ length: 18 }, (_, i) => i)

function arc(from: number, to: number): string {
  const point = (wind: number) => {
    const angle = Math.PI * (1 - wind / WIND_MAX)
    return `${(100 + 78 * Math.cos(angle)).toFixed(1)} ${(100 - 78 * Math.sin(angle)).toFixed(1)}`
  }
  return `M ${point(from)} A 78 78 0 0 1 ${point(to)}`
}

export function PanelScrubStep({ paused = false, windSafe, panelsClean, onWindSafe, onEarly, onClean, onDone }: Props) {
  const [left, setLeft] = useState(windSafe ? 0 : WAIT_S)
  const [progress, setProgress] = useState(0)
  const lastScrubRef = useRef(0)

  useEffect(() => {
    if (paused || windSafe || left <= 0) return
    const id = window.setTimeout(() => setLeft((value) => value - 1), 1000)
    return () => window.clearTimeout(id)
  }, [left, paused, windSafe])

  const wind = windSafe ? WIND_CALM : WIND_CALM + left * WIND_PER_S
  const calm = wind < SAFE_BELOW
  const share = panelsClean ? 1 : DUSTY_SHARE + (1 - DUSTY_SHARE) * progress
  const generation = Math.round(share * 100)
  const watts = Math.round(MISSION5_META.panelWatts * share)

  return (
    <>
      <ChallengeBar
        code="5.2"
        title="Limpe os painéis com o vento seguro"
        icon={<Brush className="size-5" aria-hidden />}
        counterLabel="Geração"
        value={`${generation}%`}
        hint="Espere o sensor de vento chegar ao verde. Depois esfregue a poeira do painel. A água da base fica guardada."
      />

      <div className="grid gap-3 lg:grid-cols-[0.75fr_1.25fr]">
        {/* Wind sensor */}
        <div className="gk-panel flex flex-col items-center gap-2 p-3">
          <p className="self-start font-pixel text-xs text-(--gk-accent) uppercase">Sensor de vento</p>
          <svg viewBox="0 0 200 118" className="w-full max-w-xs" role="img" aria-label={`Vento a ${wind} quilômetros por hora`}>
            <path d={arc(0, SAFE_BELOW)} fill="none" stroke="#5ecf9a" strokeWidth="14" />
            <path d={arc(SAFE_BELOW, 70)} fill="none" stroke="#f0b429" strokeWidth="14" />
            <path d={arc(70, WIND_MAX)} fill="none" stroke="#ff6b8a" strokeWidth="14" />
            <g
              style={{
                transformOrigin: '100px 100px',
                transform: `rotate(${-90 + (wind / WIND_MAX) * 180}deg)`,
                transition: 'transform 1s linear',
              }}
            >
              <path d="M 96 100 L 100 30 L 104 100 Z" fill="#f4fff4" stroke="#04080f" strokeWidth="2" />
            </g>
            <circle cx="100" cy="100" r="9" fill="#f4fff4" stroke="#04080f" strokeWidth="3" />
          </svg>
          <p className="font-pixel text-xl leading-none" style={{ color: calm ? '#5ecf9a' : wind < 70 ? '#f0b429' : '#ff6b8a' }} aria-live="polite">
            {wind} km/h
          </p>
          <Tag tone={calm ? 'ok' : 'danger'}>
            <Wind className={`size-3 ${calm ? '' : 'gk-blink'}`} aria-hidden />
            {windSafe ? 'Vento seguro · limpeza liberada' : calm ? 'Vento seguro' : `Vento forte · ${left}s`}
          </Tag>
          {!windSafe ? (
            <McButton
              className={`mt-1 min-h-14 w-full px-3 font-pixel text-base ${calm ? 'mc-btn-green btn-bob' : ''}`}
              onClick={() => {
                if (!calm) {
                  soundEngine.fail()
                  onEarly()
                  return
                }
                onWindSafe()
              }}
            >
              Liberar a limpeza
            </McButton>
          ) : null}
        </div>

        {/* Solar panel under the dust */}
        <div className="gk-panel flex flex-col gap-3 p-3">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
            <BarMeter className="min-w-40 flex-1" label="Geração solar" value={generation} color="#ffb15a" icon={<Sun className="size-3" aria-hidden />} />
            <p className="flex items-center gap-1 font-pixel text-sm text-energy" aria-live="polite">
              <Zap className="size-4" aria-hidden />
              <span key={watts} className="gk-pop inline-block">
                {watts} W
              </span>
              <span className="text-[#f4fff4]/50">/ {MISSION5_META.panelWatts} W</span>
            </p>
          </div>

          <div className={`relative border-4 ${panelsClean ? 'border-life' : 'border-[#30346d]'}`}>
            {panelsClean ? (
              <div className="relative h-56 overflow-hidden md:h-64">
                <SolarCells />
                <div className="gk-sweep absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]" aria-hidden />
                <Tag tone="ok" className="absolute top-2 left-2">Painel limpo · {MISSION5_META.panelWatts} W</Tag>
              </div>
            ) : (
              <DustScrubCanvas
                className="h-56 w-full md:h-64"
                ariaLabel="Esfregar a poeira do painel solar"
                brushRadius={30}
                disabled={!windSafe}
                onProgress={(fraction) => {
                  setProgress(fraction)
                  const now = performance.now()
                  if (fraction > 0 && now - lastScrubRef.current > 140) {
                    lastScrubRef.current = now
                    soundEngine.scrub()
                  }
                }}
                onClean={() => {
                  soundEngine.success()
                  onClean()
                }}
              >
                <SolarCells />
              </DustScrubCanvas>
            )}
            {!windSafe ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#04080f]/55">
                <span className="flex items-center gap-2 border-2 border-energy bg-[#04080f]/90 px-3 py-2 font-pixel text-xs text-energy uppercase">
                  <Lock className="size-4" aria-hidden /> Painel travado até o vento baixar
                </span>
              </div>
            ) : !panelsClean && progress < 0.05 ? (
              <span className="gk-bob pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 border-2 border-[#04080f] bg-energy px-3 py-1.5 font-pixel text-xs whitespace-nowrap text-[#1a1203] uppercase">
                <Brush className="size-4" aria-hidden /> Esfregue aqui
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {panelsClean ? <GameCta onClick={onDone}>Alerta solar (Desafio 5.3)</GameCta> : null}
    </>
  )
}

function SolarCells() {
  return (
    <div className="grid h-full w-full grid-cols-6 grid-rows-3 gap-1 bg-[#0b1730] p-2" aria-hidden>
      {CELLS.map((cell) => (
        <span
          key={cell}
          className="border border-[#6f9bff]/50 bg-[linear-gradient(135deg,#3a6fe0,#16306e_70%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
        />
      ))}
    </div>
  )
}
