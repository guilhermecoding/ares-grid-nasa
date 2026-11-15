import { Check, Droplets, Mountain, Radiation, ScanLine, ShieldCheck } from 'lucide-react'
import { BarMeter, ChallengeBar, GameCta, Tag } from '../../components/missionKit/kit'
import { MEDIA } from '../../constants/mediaAssets'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  radiation: number
  checked: boolean
  onCheck: () => void
  onLeave: () => void
}

const SAFE_MSV = 1.2
const PEAK_MSV = 8
const PARTICLES = [6, 15, 24, 33, 42, 51, 60, 69, 78, 87, 94]

/** Cutaway of the shelter: solar particles rain down and stop in the regolith and the water. */
export function ShieldMonitor({ radiation, checked, onCheck, onLeave }: Props) {
  const green = radiation <= SAFE_MSV
  const color = green ? '#5ecf9a' : radiation <= 3 ? '#f0b429' : '#ff6b8a'

  return (
    <>
      <ChallengeBar
        code="5.3"
        title="Dentro do abrigo com água e regolito"
        icon={<ShieldCheck className="size-5" aria-hidden />}
        counterLabel="Radiação"
        value={`${radiation.toFixed(1)} mSv`}
        hint="Confira a blindagem e espere o medidor voltar ao verde antes de sair."
      />

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative aspect-[16/10] overflow-hidden border-4 border-life bg-[#1a0b12]" role="img" aria-label="Corte do abrigo: regolito em cima, água no meio e a cabine protegida embaixo">
          {/* Sky with incoming particles */}
          <div className="absolute inset-x-0 top-0 h-[34%] bg-[linear-gradient(180deg,#3a0f1c,#6a2416)]">
            {PARTICLES.map((left, i) => (
              <span
                key={left}
                className="gk-particle-fall absolute top-0 h-3 w-1 bg-[#fff4b4] shadow-[0_0_6px_#fff4b4]"
                style={{
                  left: `${left}%`,
                  animationDelay: `${(i * 0.37) % 1.2}s`,
                  animationDuration: green ? '2.4s' : '1s',
                  ['--gk-fall' as string]: `${90 + (i % 3) * 22}px`,
                  opacity: green ? 0.4 : 1,
                }}
              />
            ))}
            <Tag tone="danger" className="absolute top-2 left-2">
              <Radiation className="size-3" aria-hidden /> Partículas solares
            </Tag>
          </div>
          {/* Regolith */}
          <div className="absolute inset-x-0 top-[34%] flex h-[22%] items-center justify-center border-y-4 border-[#2a0f0c] bg-[#8a4424] bg-[radial-gradient(circle,rgba(0,0,0,0.3)_1.5px,transparent_2px)] bg-[length:14px_14px]">
            <Tag tone="energy">
              <Mountain className="size-3" aria-hidden /> Regolito · 1 m
            </Tag>
          </div>
          {/* Water */}
          <div className="gk-glow-breathe absolute inset-x-0 top-[56%] flex h-[14%] items-center justify-center border-b-4 border-[#0b2a4a] bg-[linear-gradient(180deg,#38bdf8,#1d6fb8)]">
            <Tag tone="water">
              <Droplets className="size-3" aria-hidden /> Água · hidrogênio
            </Tag>
          </div>
          {/* Cabin */}
          <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[linear-gradient(180deg,#14233a,#0a1422)]">
            <div className="absolute inset-x-[30%] top-0 h-full bg-[radial-gradient(closest-side,rgba(94,207,154,0.3),transparent)]" />
            <img src={MEDIA.mission4.astronaut} alt="" className="gk-pixelated gk-bob absolute bottom-[6%] left-1/2 h-[78%] -translate-x-1/2" draggable={false} />
            <Tag className="absolute bottom-2 left-2">Cabine protegida</Tag>
          </div>
          {checked ? (
            <div key="scan" className="gk-sweep pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-[linear-gradient(90deg,transparent,rgba(125,255,224,0.55),transparent)]" aria-hidden />
          ) : null}
        </div>

        <div className="gk-panel flex flex-col gap-3 p-3">
          <p className="font-pixel text-xs text-(--gk-accent) uppercase">Monitor da blindagem</p>
          <p className="font-pixel text-3xl leading-none" style={{ color, textShadow: `0 0 14px ${color}` }} aria-live="polite">
            {radiation.toFixed(1)} <span className="text-base">mSv</span>
          </p>
          <BarMeter
            label={green ? 'Nível seguro' : 'Nível alto'}
            value={(radiation / PEAK_MSV) * 100}
            display={green ? 'Verde' : 'Baixando'}
            color={color}
            icon={<Radiation className="size-3" aria-hidden />}
          />
          <button
            type="button"
            disabled={checked}
            onClick={() => {
              soundEngine.scan()
              onCheck()
            }}
            className={`flex min-h-12 items-center gap-2 border-2 px-3 text-left font-pixel text-xs uppercase ${
              checked ? 'border-life bg-life/15 text-[#7dffb0]' : 'gk-pulse border-energy bg-[#1c1608] text-energy'
            }`}
            style={{ touchAction: 'manipulation', ['--gk-glow' as string]: 'rgba(240,180,41,0.6)' }}
          >
            {checked ? <Check className="size-4 shrink-0" strokeWidth={3} aria-hidden /> : <ScanLine className="size-4 shrink-0" aria-hidden />}
            {checked ? 'Monitor da blindagem conferido' : 'Conferir o monitor da blindagem'}
          </button>
          {checked ? (
            <ul className="gk-pop grid gap-1.5 text-sm leading-snug text-[#f4fff4]/90">
              <li className="border-l-4 border-energy pl-2">O regolito grosso freia as partículas mais pesadas.</li>
              <li className="border-l-4 border-[#38bdf8] pl-2">O hidrogênio da água segura os prótons do Sol.</li>
            </ul>
          ) : null}
          {checked && green ? null : (
            <p className="text-sm text-[#f4fff4]/75">
              {green ? 'O medidor está verde. Falta conferir o monitor.' : 'Espere aqui. O medidor volta ao verde em instantes.'}
            </p>
          )}
        </div>
      </div>

      {checked && green ? <GameCta onClick={onLeave}>Sair do abrigo (Desafio 5.4)</GameCta> : null}
    </>
  )
}
