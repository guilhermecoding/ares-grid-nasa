import { useCallback, useRef, useState, type ReactNode } from 'react'
import { Check, Droplets, Flame, Hand, Lightbulb, Snowflake, Sprout, Thermometer, type LucideIcon } from 'lucide-react'
import { PlantTray } from '../../components/mission4/PlantTray'
import { GROWTH_SCALE, TRAY_BEDS, TRAY_ORDER } from '../../components/mission4/trayLayout'
import { BarMeter, Burst, ChallengeBar, FloatDelta, GameCta } from '../../components/missionKit/kit'
import { useDrag } from '../../components/missionKit/useDrag'
import { MEDIA } from '../../constants/mediaAssets'
import { GROWTH_STAGES, speciesLabel, type PlantGroupId, type SpeciesId } from '../../data/mission4Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  planted: Partial<Record<PlantGroupId, SpeciesId>>
  stage: 0 | 1 | 2
  misted: boolean
  lightOn: boolean
  tempOk: boolean
  harvested: readonly SpeciesId[]
  waterL: number
  onToggleLight: () => void
  onSetTemp: (ok: boolean) => void
  onMist: () => void
  onAdvance: () => void
  onHarvest: (id: SpeciesId) => void
  onStress: (message: string) => void
  onWaterShort: () => void
  onDone: () => void
}

type Temp = 'cold' | 'mild' | 'hot'
type Fault = 'light' | 'temp' | 'mist'

const MIST_WATER_L = 2
const MIST_PER_MOVE = 5

const TEMPS: readonly { id: Temp; label: string; value: string; Icon: LucideIcon; color: string }[] = [
  { id: 'cold', label: 'Frio', value: '8 °C', Icon: Snowflake, color: '#7dd3fc' },
  { id: 'mild', label: 'Ameno', value: '22 °C', Icon: Thermometer, color: '#5ecf9a' },
  { id: 'hot', label: 'Quente', value: '38 °C', Icon: Flame, color: '#ff6b8a' },
]

const LED_COUNT = 12

export function GrowthStep({
  planted,
  stage,
  misted,
  lightOn,
  tempOk,
  harvested,
  waterL,
  onToggleLight,
  onSetTemp,
  onMist,
  onAdvance,
  onHarvest,
  onStress,
  onWaterShort,
  onDone,
}: Props) {
  const [temp, setTemp] = useState<Temp>(tempOk ? 'mild' : 'cold')
  const [humidity, setHumidity] = useState(0)
  const [fault, setFault] = useState<Fault | null>(null)
  const [fx, setFx] = useState<{ key: number; kind: 'grow' | 'mist' | PlantGroupId } | null>(null)
  const humidityRef = useRef(0)
  const lastSprayRef = useRef(0)

  const beds = TRAY_ORDER.filter((group) => planted[group])
  const picked = beds.filter((group) => harvested.includes(planted[group]!)).length
  const allHarvested = picked === beds.length
  const shownHumidity = misted ? 100 : humidity
  const ready = lightOn && tempOk && misted

  const bump = (kind: 'grow' | 'mist' | PlantGroupId) => setFx((current) => ({ key: (current?.key ?? 0) + 1, kind }))

  const onSprayMove = useCallback(
    (_tool: 'mister', target: string | null) => {
      if (target !== 'canopy' || humidityRef.current >= 100) return
      const now = performance.now()
      if (now - lastSprayRef.current > 110) {
        lastSprayRef.current = now
        soundEngine.spray()
      }
      humidityRef.current = Math.min(100, humidityRef.current + MIST_PER_MOVE)
      setHumidity(humidityRef.current)
      if (humidityRef.current >= 100) {
        soundEngine.success()
        setFault((value) => (value === 'mist' ? null : value))
        setFx((current) => ({ key: (current?.key ?? 0) + 1, kind: 'mist' }))
        onMist()
      }
    },
    [onMist],
  )
  const onSprayEnd = useCallback(() => {}, [])
  const { drag, start } = useDrag<'mister'>(onSprayEnd, onSprayMove)

  const tryAdvance = () => {
    const problem: [Fault, string] | null = !lightOn
      ? ['light', 'A luz está errada. As folhas pedem o LED ligado.']
      : !tempOk
        ? ['temp', 'A temperatura saiu do intervalo ameno. Ajuste o controle.']
        : !misted
          ? ['mist', 'Sem névoa, as folhas murcham. Passe o borrifador sobre elas.']
          : null
    if (problem) {
      soundEngine.fail()
      setFault(problem[0])
      onStress(problem[1])
      return
    }
    soundEngine.grow()
    humidityRef.current = 0
    setHumidity(0)
    bump('grow')
    onAdvance()
  }

  const plants = Object.fromEntries(
    beds.filter((group) => !harvested.includes(planted[group]!)).map((group) => [group, GROWTH_SCALE[stage]]),
  ) as Partial<Record<PlantGroupId, number>>

  return (
    <>
      <ChallengeBar
        code="4.4"
        title={stage < 2 ? 'Cuide da luz, da temperatura e da névoa' : 'Hora da colheita'}
        icon={<Sprout className="size-5" aria-hidden />}
        counterLabel={stage < 2 ? 'Estágio' : 'Colheita'}
        value={stage < 2 ? stage + 1 : picked}
        total={stage < 2 ? GROWTH_STAGES.length : beds.length}
      />

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Tray under the LED bar */}
        <div className={`gk-panel relative flex flex-col items-center overflow-hidden p-3 ${fault ? 'gk-shake' : ''}`}>
          <ol className="flex w-full items-center gap-1.5" aria-label="Estágios de crescimento">
            {GROWTH_STAGES.map((label, index) => (
              <li key={label} className="flex flex-1 items-center gap-1.5">
                <span
                  className={`flex flex-1 items-center justify-center gap-1 border px-1.5 py-1 font-pixel text-[10px] leading-none uppercase sm:text-xs ${
                    index === stage
                      ? 'border-life bg-life text-[#04130c]'
                      : index < stage
                        ? 'border-(--gk-line) text-life'
                        : 'border-[#262b4d] text-[#f4fff4]/40'
                  }`}
                  aria-current={index === stage ? 'step' : undefined}
                >
                  {index < stage ? <Check className="size-3" strokeWidth={3} aria-hidden /> : null}
                  {label}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-3 flex w-full max-w-xl gap-1 border-2 border-[#262b4d] bg-[#04080f] p-1" aria-hidden>
            {Array.from({ length: LED_COUNT }, (_, i) => (
              <span
                key={i}
                className="h-2 flex-1 transition-colors duration-300"
                style={{
                  background: lightOn ? (i % 3 === 1 ? '#ffffff' : '#ff6ad5') : '#2a2440',
                  boxShadow: lightOn ? '0 0 10px #ff6ad5' : undefined,
                }}
              />
            ))}
          </div>

          <div data-drop="canopy" className="relative w-full max-w-xl">
            {lightOn ? (
              <div className="gk-glow-breathe pointer-events-none absolute inset-x-0 -top-1 z-10 h-3/4 bg-[linear-gradient(180deg,rgba(255,106,213,0.38),transparent)] mix-blend-screen" />
            ) : (
              <div className="pointer-events-none absolute inset-0 z-10 bg-[#04080f]/45" />
            )}
            <PlantTray plants={plants} dry={!misted}>
              {misted
                ? TRAY_ORDER.map((group, i) => (
                    <span
                      key={group}
                      className="gk-mist-puff pointer-events-none absolute size-6 rounded-full bg-[#d7f6ff]/60 blur-[3px]"
                      style={{ left: `${TRAY_BEDS[group].cx - 3}%`, top: `${TRAY_BEDS[group].cy - 6}%`, animationDelay: `${i * 0.55}s` }}
                    />
                  ))
                : null}
              {beds.map((group) => {
                const bed = TRAY_BEDS[group]
                const species = planted[group]!
                const done = harvested.includes(species)
                return (
                  <span key={group} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${bed.cx}%`, top: `${bed.cy}%` }}>
                    {stage === 2 && !done ? (
                      <button
                        type="button"
                        disabled={!misted}
                        onClick={() => {
                          soundEngine.harvest()
                          bump(group)
                          onHarvest(species)
                        }}
                        aria-label={`Colher ${speciesLabel(species)}`}
                        className={`flex min-h-12 items-center gap-1 border-2 border-[#04080f] bg-energy px-2 font-pixel text-[10px] text-[#1a1203] uppercase shadow-[0_3px_0_#7a5a0c] ${
                          misted ? 'gk-bob' : 'opacity-50'
                        }`}
                        style={{ touchAction: 'manipulation' }}
                      >
                        <Hand className="size-4" aria-hidden /> Colher
                      </button>
                    ) : done ? (
                      <span className="gk-pop flex items-center gap-1 border border-life bg-[#04130c]/90 px-1.5 py-1 font-pixel text-[9px] leading-none whitespace-nowrap text-[#7dffb0] uppercase sm:text-[10px]">
                        <Check className="size-3" strokeWidth={3} aria-hidden /> {speciesLabel(species)}
                      </span>
                    ) : null}
                    {fx && (fx.kind === 'grow' || fx.kind === group) ? <Burst key={fx.key} color={bed.color} /> : null}
                  </span>
                )
              })}
            </PlantTray>
          </div>

          <p className={`mt-1 font-pixel text-[10px] uppercase sm:text-xs ${misted ? 'text-[#7dffb0]' : 'text-[#ffc2cf]'}`} aria-live="polite">
            {misted
              ? stage === 2 && !allHarvested
                ? 'Folhas frescas · toque em Colher'
                : 'Folhas úmidas e saudáveis'
              : 'Folhas secas · passe o borrifador'}
          </p>
        </div>

        {/* Control board */}
        <div className="gk-panel flex flex-col gap-3 p-3">
          <p className="font-pixel text-xs text-(--gk-accent) uppercase">Painel de controle</p>

          <Control label="Luz LED" ok={lightOn} alert={fault === 'light'}>
            <button
              type="button"
              role="switch"
              aria-checked={lightOn}
              aria-label="Luz LED"
              onClick={() => {
                soundEngine.click()
                if (!lightOn) setFault((value) => (value === 'light' ? null : value))
                onToggleLight()
              }}
              className={`flex min-h-12 w-full items-center gap-3 border-2 px-3 font-pixel text-xs uppercase ${
                lightOn ? 'border-[#ff6ad5] bg-[#ff6ad5]/15 text-[#ffc4ee]' : 'border-[#30346d] bg-[#04080f]/70 text-[#f4fff4]/70'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <Lightbulb className="size-5 shrink-0" aria-hidden />
              <span className="flex-1 text-left">{lightOn ? 'Ligada' : 'Apagada'}</span>
              <span className={`relative h-6 w-12 border-2 ${lightOn ? 'border-[#ff6ad5] bg-[#ff6ad5]/30' : 'border-[#30346d] bg-[#04080f]'}`} aria-hidden>
                <span className={`absolute top-0.5 size-4 transition-[left] duration-150 ${lightOn ? 'left-6 bg-[#ff6ad5]' : 'left-0.5 bg-[#5b6190]'}`} />
              </span>
            </button>
          </Control>

          <Control label="Temperatura" ok={tempOk} alert={fault === 'temp'}>
            <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Temperatura da estufa">
              {TEMPS.map((option) => {
                const selected = temp === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      soundEngine.click()
                      setTemp(option.id)
                      if (option.id === 'mild') setFault((value) => (value === 'temp' ? null : value))
                      onSetTemp(option.id === 'mild')
                    }}
                    className={`flex min-h-14 flex-col items-center justify-center gap-0.5 border-2 px-1 font-pixel text-[10px] uppercase ${
                      selected ? 'bg-[#f4fff4]/10 text-[#f4fff4]' : 'border-[#30346d] bg-[#04080f]/70 text-[#f4fff4]/60'
                    }`}
                    style={{ touchAction: 'manipulation', borderColor: selected ? option.color : undefined }}
                  >
                    <option.Icon className="size-4" style={{ color: option.color }} aria-hidden />
                    {option.label}
                    <span style={{ color: option.color }}>{option.value}</span>
                  </button>
                )
              })}
            </div>
          </Control>

          <Control label="Névoa" ok={misted} alert={fault === 'mist'}>
            <div className="relative flex items-center gap-3">
              <button
                type="button"
                disabled={misted}
                onPointerDown={(e) => {
                  if (misted) return
                  if (waterL < MIST_WATER_L) {
                    onWaterShort()
                    return
                  }
                  soundEngine.pickup()
                  start('mister', e)
                }}
                aria-label="Arrastar o borrifador sobre as folhas"
                className={`flex size-16 shrink-0 touch-none items-center justify-center border-2 border-[#38bdf8] bg-[#38bdf8]/10 select-none ${
                  misted ? 'opacity-50' : drag ? 'opacity-30' : 'gk-pulse cursor-grab'
                }`}
                style={{ touchAction: 'none', ['--gk-glow' as string]: 'rgba(56,189,248,0.6)' }}
              >
                <img src={MEDIA.mission4.mister} alt="" className="size-11" draggable={false} />
              </button>
              <div className="min-w-0 flex-1">
                <BarMeter label="Umidade" value={shownHumidity} color="#38bdf8" icon={<Droplets className="size-3" aria-hidden />} />
                <p className="mt-1.5 text-sm leading-snug text-[#f4fff4]/80">
                  {misted ? 'Névoa aplicada.' : `Arraste o borrifador sobre as folhas · −${MIST_WATER_L} L`}
                </p>
              </div>
              {fx?.kind === 'mist' ? (
                <FloatDelta key={fx.key} color="#7dd3fc" className="top-0 right-0">
                  −{MIST_WATER_L} L de água
                </FloatDelta>
              ) : null}
            </div>
          </Control>

          {stage < 2 ? (
            <McButton
              className={`min-h-14 w-full px-4 font-pixel text-sm ${ready ? 'btn-bob' : ''}`}
              onClick={tryAdvance}
            >
              Fazer crescer ▸
            </McButton>
          ) : allHarvested ? null : (
            <p className="border border-[#30346d] bg-[#04080f]/70 px-3 py-2 text-sm text-[#f4fff4]/85">
              {misted ? 'Toque em cada berço para colher.' : 'Borrife as folhas para liberar a colheita.'}
            </p>
          )}
        </div>
      </div>

      {stage === 2 && allHarvested ? <GameCta onClick={onDone}>Abrir o ciclo da base (Desafio 4.5)</GameCta> : null}

      {drag ? (
        <div className="pointer-events-none fixed z-[80]" style={{ left: drag.x - 28, top: drag.y - 56 }} aria-hidden>
          <img src={MEDIA.mission4.mister} alt="" className="size-14 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]" />
          {drag.over === 'canopy'
            ? [0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="gk-mist-puff absolute size-3 rounded-full bg-[#d7f6ff]/80"
                  style={{ left: 8 + i * 10, top: 54 + (i % 2) * 8, animationDuration: '0.7s', animationDelay: `${i * 0.12}s` }}
                />
              ))
            : null}
        </div>
      ) : null}
    </>
  )
}

function Control({ label, ok, alert, children }: { label: string; ok: boolean; alert: boolean; children: ReactNode }) {
  return (
    <div className={`border-l-4 pl-2.5 ${alert ? 'border-danger' : ok ? 'border-life' : 'border-[#30346d]'}`}>
      <p className="mb-1.5 flex items-center gap-1.5 font-pixel text-[10px] text-[#f4fff4]/80 uppercase">
        <span className={`size-2 rounded-full ${ok ? 'bg-life shadow-[0_0_8px_#5ecf9a]' : alert ? 'gk-blink bg-danger' : 'bg-[#5b6190]'}`} aria-hidden />
        {label}
        <span className={ok ? 'text-[#7dffb0]' : alert ? 'text-[#ffc2cf]' : 'text-[#f4fff4]/50'}>{ok ? '· ok' : '· ajustar'}</span>
      </p>
      {children}
    </div>
  )
}
