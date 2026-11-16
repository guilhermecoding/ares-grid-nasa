import { useCallback, useState } from 'react'
import {
  Activity,
  Cable,
  Check,
  Droplets,
  Fan,
  Lightbulb,
  Lock,
  Shield,
  Thermometer,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Burst, ChallengeBar, FloatDelta, GameCta, Tag } from '../../components/missionKit/kit'
import { useDrag } from '../../components/missionKit/useDrag'
import { MEDIA } from '../../constants/mediaAssets'
import { GREENHOUSE_MODULES, type GreenhouseModuleId } from '../../data/mission4Data'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  installed: readonly GreenhouseModuleId[]
  energyLinked: boolean
  waterLinked: boolean
  energy: number
  onInstall: (id: GreenhouseModuleId) => void
  onLinkEnergy: () => void
  onLinkWater: () => void
  onEnergyShort: () => void
  onDone: () => void
}

type LinkId = 'energy' | 'water'

const ORDER = GREENHOUSE_MODULES.map((m) => m.id)
const TOTAL = ORDER.length + 2

const MODULE_ICONS: Record<GreenhouseModuleId, LucideIcon> = {
  shell: Shield,
  led: Lightbulb,
  air: Fan,
  temp: Thermometer,
  monitor: Activity,
}

const LINKS: Record<LinkId, { source: string; terminal: string; color: string; done: string; wait: string; Icon: LucideIcon }> = {
  energy: {
    source: 'Cabo solar · 480 W',
    terminal: 'Domo · Energia',
    color: '#f0b429',
    done: 'Solar conectado (480 W)',
    wait: 'Aguardando o cabo solar',
    Icon: Zap,
  },
  water: {
    source: 'Tubo de água H₂O',
    terminal: 'Domo · Válvula H₂O',
    color: '#38bdf8',
    done: 'Água potável ligada',
    wait: 'Aguardando o tubo de água',
    Icon: Droplets,
  },
}

/** The dome starts as a grey blueprint and gains color with each subsystem. */
function domeFilter(count: number, shell: boolean, online: boolean): string {
  if (online) return 'drop-shadow(0 0 14px rgba(125,255,224,0.55))'
  if (!shell) return 'grayscale(1) brightness(0.55) opacity(0.35)'
  const gray = Math.max(0.12, 1 - count * 0.2)
  return `grayscale(${gray}) brightness(${0.62 + count * 0.07})`
}

export function BuildStep({
  installed,
  energyLinked,
  waterLinked,
  energy,
  onInstall,
  onLinkEnergy,
  onLinkWater,
  onEnergyShort,
  onDone,
}: Props) {
  const [fx, setFx] = useState<{ key: number; id: GreenhouseModuleId | LinkId; cost?: number } | null>(null)
  const [shake, setShake] = useState<LinkId | null>(null)

  const linked: Record<LinkId, boolean> = { energy: energyLinked, water: waterLinked }
  const next = ORDER.find((id) => !installed.includes(id))
  const modulesReady = installed.length === ORDER.length
  const online = modulesReady && energyLinked && waterLinked
  const progress = installed.length + Number(energyLinked) + Number(waterLinked)
  const has = (id: GreenhouseModuleId) => installed.includes(id)

  const onDrop = useCallback(
    (id: LinkId, target: string | null) => {
      if (target === id) {
        if (id === 'energy') {
          soundEngine.zap()
          onLinkEnergy()
        } else {
          soundEngine.flow()
          onLinkWater()
        }
        setFx((current) => ({ key: (current?.key ?? 0) + 1, id }))
        return
      }
      if (target === 'energy' || target === 'water') {
        soundEngine.fail()
        setShake(target)
      }
    },
    [onLinkEnergy, onLinkWater],
  )
  const { drag, start } = useDrag<LinkId>(onDrop)

  const install = (id: GreenhouseModuleId, cost: number) => {
    if (energy < cost) {
      onEnergyShort()
      return
    }
    soundEngine.snap()
    onInstall(id)
    setFx((current) => ({ key: (current?.key ?? 0) + 1, id, cost }))
  }

  const sceneLabel = online
    ? 'Estufa integrada e online'
    : modulesReady
      ? 'Domo pronto · falta energia e água'
      : `Domo em montagem · ${installed.length}/${ORDER.length}`

  return (
    <>
      <ChallengeBar
        code="4.1"
        title="Montagem do domo e conexões por arraste"
        icon={<Wrench className="size-5" aria-hidden />}
        counterLabel="Subsistemas"
        value={progress}
        total={TOTAL}
      />

      <div className="grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Scene */}
        <div
          className={`relative aspect-[16/9] overflow-hidden border-4 bg-[radial-gradient(70%_80%_at_62%_55%,#5a2416,#2a0f0c_75%)] transition-colors duration-500 ${
            online ? 'border-life' : 'border-[#38bdf8]'
          }`}
        >
          <div className="absolute inset-x-0 bottom-0 h-[22%] border-t-4 border-[#9a3a19] bg-[#45190f]" />
          <Tag className="absolute top-2 left-2 z-10" tone={online ? 'accent' : 'water'}>
            {online ? <span className="gk-blink size-1.5 bg-life" /> : null}
            {sceneLabel}
          </Tag>
          <img
            src={MEDIA.mission4.astronaut}
            alt=""
            className="gk-pixelated gk-bob absolute bottom-[5%] left-[9%] h-[30%]"
            draggable={false}
          />
          <div className="absolute right-[5%] bottom-[3%] aspect-[726/648] h-[88%]">
            {!has('shell') ? (
              <div className="gk-blink absolute inset-x-[4%] top-[6%] bottom-[10%] rounded-t-full border-2 border-dashed border-[#38bdf8]/70" />
            ) : null}
            <img
              src={MEDIA.mission4.dome}
              alt={online ? 'Estufa em domo, ligada' : 'Estufa em domo, em montagem'}
              className="gk-pixelated relative h-full w-full transition-[filter] duration-700"
              style={{ filter: domeFilter(installed.length, has('shell'), online) }}
              draggable={false}
            />
            {has('led') ? (
              <div className="gk-glow-breathe absolute inset-x-[14%] top-[8%] h-[46%] rounded-full bg-[radial-gradient(closest-side,rgba(255,110,220,0.5),transparent)] mix-blend-screen" />
            ) : null}
            {has('air')
              ? [0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="gk-mist-puff absolute size-2 rounded-full bg-[#d7fff4]/80"
                    style={{ left: `${30 + i * 16}%`, top: `${52 - i * 7}%`, animationDelay: `${i * 0.7}s` }}
                  />
                ))
              : null}
            {has('temp') ? (
              <Tag tone="energy" className="gk-pop absolute top-[2%] left-[-6%]">
                <Thermometer className="size-3" aria-hidden /> 22 °C
              </Tag>
            ) : null}
            {has('monitor') ? (
              <Tag className="gk-pop absolute top-[16%] left-[-10%]">
                <span className="gk-blink size-1.5 bg-life" /> Sensores
              </Tag>
            ) : null}
            {energyLinked ? (
              <span className="absolute bottom-[7%] left-[52%] size-3">
                <span className="gk-ping absolute inset-0 rounded-full bg-energy" />
                <span className="absolute inset-0 rounded-full bg-energy" />
              </span>
            ) : null}
            {waterLinked ? (
              <span className="absolute top-[52%] right-[21%] size-3">
                <span className="gk-ping absolute inset-0 rounded-full bg-[#38bdf8]" />
                <span className="absolute inset-0 rounded-full bg-[#38bdf8]" />
              </span>
            ) : null}
            {fx ? <Burst key={fx.key} color={fx.id === 'water' ? '#38bdf8' : fx.id === 'energy' ? '#f0b429' : '#7dffe0'} /> : null}
          </div>
        </div>

        {/* Subsystem cards */}
        <div className="grid content-start gap-2 sm:grid-cols-2">
          {GREENHOUSE_MODULES.map((mod, index) => {
            const done = has(mod.id)
            const current = mod.id === next
            const Icon = MODULE_ICONS[mod.id]
            return (
              <button
                key={mod.id}
                type="button"
                disabled={done || !current}
                onClick={() => install(mod.id, mod.energyCost)}
                className={`relative flex min-h-24 flex-col border-2 px-3 py-2.5 text-left transition-colors ${
                  done
                    ? 'border-life bg-[#0b2a26]/90'
                    : current
                      ? 'gk-pulse border-energy bg-[#1c1608]/95'
                      : 'border-[#262b4d] bg-[#091422]/80 opacity-55'
                } ${index === ORDER.length - 1 ? 'sm:col-span-2' : ''}`}
                style={{ touchAction: 'manipulation', ['--gk-glow' as string]: 'rgba(240,180,41,0.6)' }}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className={`flex items-center gap-1.5 font-pixel text-xs leading-snug uppercase ${done ? 'text-[#7dffb0]' : current ? 'text-energy' : 'text-[#f4fff4]/70'}`}>
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {index + 1}. {mod.title}
                  </span>
                  {done ? (
                    <span className="gk-pop flex size-5 shrink-0 items-center justify-center rounded-full border border-life text-life">
                      <Check className="size-3" strokeWidth={3} aria-label="Instalado" />
                    </span>
                  ) : current ? null : (
                    <Lock className="size-4 shrink-0 text-[#f4fff4]/50" aria-label="Bloqueado" />
                  )}
                </span>
                <span className="mt-1 text-sm leading-snug text-[#f4fff4]/80">{mod.detail}</span>
                {current ? (
                  <span className="mt-2 flex min-h-10 w-full items-center justify-center gap-1.5 border-2 border-[#04080f] bg-energy px-2 py-1 text-center font-pixel text-xs leading-snug text-[#1a1203] uppercase shadow-[0_3px_0_#7a5a0c]">
                    <Zap className="size-4 shrink-0" aria-hidden /> Instalar · −{mod.energyCost}% energia
                  </span>
                ) : null}
                {fx?.id === mod.id ? (
                  <FloatDelta key={fx.key} className="top-1 right-8">
                    −{fx.cost}% energia
                  </FloatDelta>
                ) : null}
              </button>
            )
          })}
        </div>

        {/* Connections */}
        <div className="gk-panel p-3">
          <p className="flex items-center gap-2 font-pixel text-xs leading-snug text-(--gk-accent) uppercase">
            <Cable className="size-4 shrink-0" aria-hidden />
            6 e 7. Arraste o cabo e o tubo até os terminais do domo
          </p>
          <div className="mt-3 grid gap-3">
            {(['energy', 'water'] as const).map((id) => {
              const link = LINKS[id]
              const isLinked = linked[id]
              const dragging = drag?.payload === id
              const wanted = dragging && !isLinked
              const hovered = wanted && drag.over === id
              return (
                <div key={id} className="grid grid-cols-[1fr_minmax(2rem,0.5fr)_1fr] items-center">
                  <button
                    type="button"
                    disabled={!modulesReady || isLinked}
                    onPointerDown={(e) => {
                      if (!modulesReady || isLinked) return
                      soundEngine.pickup()
                      start(id, e)
                    }}
                    aria-label={`Arrastar: ${link.source}`}
                    className={`flex min-h-14 touch-none items-center gap-2 border-2 px-2.5 font-pixel text-xs leading-snug uppercase select-none ${
                      !modulesReady ? 'opacity-45' : isLinked ? '' : dragging ? 'opacity-60' : 'gk-pulse cursor-grab'
                    }`}
                    style={{
                      touchAction: 'none',
                      borderColor: link.color,
                      color: link.color,
                      background: `${link.color}1f`,
                      ['--gk-glow' as string]: `${link.color}99`,
                    }}
                  >
                    {modulesReady ? <link.Icon className="size-5 shrink-0" aria-hidden /> : <Lock className="size-4 shrink-0" aria-hidden />}
                    {link.source}
                  </button>

                  <div className="relative h-2" aria-hidden>
                    {isLinked ? (
                      <>
                        <div
                          className="gk-flow-x absolute inset-0"
                          style={{
                            backgroundImage: `repeating-linear-gradient(90deg, ${link.color} 0 10px, transparent 10px 18px)`,
                            filter: `drop-shadow(0 0 4px ${link.color})`,
                          }}
                        />
                        <span className="gk-blink absolute top-1/2 left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: link.color, boxShadow: `0 0 10px ${link.color}` }} />
                      </>
                    ) : (
                      <div className="absolute inset-x-1 top-1/2 border-t-2 border-dotted border-[#f4fff4]/20" />
                    )}
                  </div>

                  <div
                    data-drop={id}
                    onAnimationEnd={() => setShake((value) => (value === id ? null : value))}
                    className={`relative flex min-h-14 items-center gap-2 border-2 px-2.5 font-pixel text-[10px] leading-snug uppercase transition-transform sm:text-xs ${
                      isLinked
                        ? 'border-solid border-life bg-life/15 text-[#f4fff4]'
                        : hovered
                          ? 'scale-105 border-solid bg-[#f4fff4]/15 text-[#f4fff4]'
                          : wanted
                            ? 'gk-pulse border-dashed text-[#f4fff4]'
                            : 'border-dashed border-[#5ecf9a]/60 text-[#f4fff4]/75'
                    } ${shake === id ? 'gk-shake' : ''}`}
                    style={wanted ? { borderColor: link.color, ['--gk-glow' as string]: `${link.color}99` } : undefined}
                  >
                    <span className="size-3 shrink-0 rounded-full border-2" style={{ borderColor: link.color, background: isLinked ? link.color : 'transparent' }} />
                    <span className="flex-1">{wanted ? 'Solte aqui' : link.terminal}</span>
                    {isLinked ? <Check className="gk-pop size-4 shrink-0 text-life" strokeWidth={3} aria-label="Ligado" /> : null}
                    {fx?.id === id ? <Burst key={fx.key} color={link.color} className="top-1/2 left-3" /> : null}
                  </div>
                </div>
              )
            })}
          </div>
          {!modulesReady ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-[#f4fff4]/70">
              <Lock className="size-4 shrink-0" aria-hidden /> Instale os cinco subsistemas para liberar o cabo e o tubo.
            </p>
          ) : null}
        </div>

        {/* Status + CTA */}
        <div className="flex flex-col gap-3">
          <div className="gk-panel px-3 py-2.5">
            <p className="font-pixel text-[10px] leading-relaxed text-[#f4fff4]/70 uppercase sm:text-xs" aria-live="polite">
              Status da integração:{' '}
              <span className={energyLinked ? 'text-energy' : ''}>{energyLinked ? LINKS.energy.done : LINKS.energy.wait}</span>
              {' · '}
              <span className={waterLinked ? 'text-[#7dd3fc]' : ''}>{waterLinked ? LINKS.water.done : LINKS.water.wait}</span>
            </p>
          </div>
          {online ? <GameCta onClick={onDone}>Escolher o método de cultivo (Desafio 4.2)</GameCta> : null}
        </div>
      </div>

      {drag ? <DragCable from={{ x: drag.originX, y: drag.originY }} to={{ x: drag.x, y: drag.y }} color={LINKS[drag.payload].color} locked={drag.over === drag.payload} /> : null}
    </>
  )
}

/** Cable or pipe that sags from its source to the pointer. */
function DragCable({
  from,
  to,
  color,
  locked,
}: {
  from: { x: number; y: number }
  to: { x: number; y: number }
  color: string
  locked: boolean
}) {
  const sag = 30 + Math.hypot(to.x - from.x, to.y - from.y) * 0.18
  const path = `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${Math.max(from.y, to.y) + sag} ${to.x} ${to.y}`
  return (
    <svg className="pointer-events-none fixed inset-0 z-[80] h-full w-full" aria-hidden>
      <path d={path} fill="none" stroke="#04080f" strokeWidth="11" strokeLinecap="round" />
      <path d={path} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
      <path d={path} fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" className="gk-flow" />
      <circle cx={to.x} cy={to.y} r={locked ? 15 : 10} fill={color} stroke="#04080f" strokeWidth="3" />
      <circle cx={to.x} cy={to.y} r={locked ? 24 : 16} fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="2" />
    </svg>
  )
}
