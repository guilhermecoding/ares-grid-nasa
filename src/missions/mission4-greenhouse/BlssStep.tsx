import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Check, Droplets, Heart, Leaf, Recycle, Utensils, Wind, type LucideIcon } from 'lucide-react'
import { PlayerChibi } from '../../components/PlayerChibi'
import { BarMeter, Burst, ChallengeBar, GameCta, Tag } from '../../components/missionKit/kit'
import { SciTerm } from '../../components/SciTerm'
import { MEDIA } from '../../constants/mediaAssets'
import { BLSS_LINKS, SCI_TERMS_M4, SCI_TERMS_M4_EN, type BlssLinkId } from '../../data/mission4Data'
import { useI18n } from '../../i18n/locale'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  linked: readonly BlssLinkId[]
  foodPct: number
  o2Pct: number
  onLink: (id: BlssLinkId) => void
  onDone: () => void
}

/** Diagram space is 600×300: crew on the left, greenhouse on the right. */
const ROUTES: Record<BlssLinkId, { path: string; color: string; x: number; y: number; Icon: LucideIcon; flowEn: string; flowPt: string }> = {
  air: { path: 'M 128 108 C 215 12, 385 12, 472 104', color: '#7dffe0', x: 50, y: 13, Icon: Wind, flowEn: 'CO₂ → O₂', flowPt: 'CO₂ → O₂' },
  water: {
    path: 'M 138 152 C 240 136, 360 136, 462 152',
    color: '#38bdf8',
    x: 50,
    y: 47,
    Icon: Droplets,
    flowEn: 'Vapor → clean water',
    flowPt: 'Vapor → água limpa',
  },
  nutrient: {
    path: 'M 128 198 C 215 292, 385 292, 472 202',
    color: '#f0b429',
    x: 50,
    y: 86,
    Icon: Leaf,
    flowEn: 'Leftovers → nutrients',
    flowPt: 'Sobras → nutrientes',
  },
}

const PARTICLES = [0, 1, 2]

export function BlssStep({ linked, foodPct, o2Pct, onLink, onDone }: Props) {
  const { t, locale } = useI18n()
  const terms = locale === 'en' ? SCI_TERMS_M4_EN : SCI_TERMS_M4
  const reduceMotion = useReducedMotion()
  const [fx, setFx] = useState<{ key: number; id: BlssLinkId } | null>(null)
  const done = BLSS_LINKS.every((link) => linked.includes(link.id))

  return (
    <>
      <ChallengeBar
        code="4.5"
        title={t('Close the base cycle', 'Feche o ciclo da base')}
        icon={<Recycle className="size-5" aria-hidden />}
        counterLabel={t('Cycle', 'Ciclo')}
        value={linked.length}
        total={BLSS_LINKS.length}
        hint={
          locale === 'en' ? (
            <>
              Turn on the three paths of the <SciTerm term="Bioregenerative" terms={terms} /> cycle.{' '}
              <SciTerm term="Photosynthesis" terms={terms} /> ties the plants, the crew, the water, and the air together.
            </>
          ) : (
            <>
              Ligue os três caminhos do ciclo <SciTerm term="Bioregenerativo" terms={terms} />. A{' '}
              <SciTerm term="Fotossíntese" terms={terms} /> une planta, tripulação, água e ar.
            </>
          )
        }
      />

      <div className="grid gap-3 lg:grid-cols-[1.45fr_0.55fr]">
        <div className="gk-panel p-3">
          <div className="relative mx-auto aspect-[2/1] w-full max-w-3xl">
            <svg viewBox="0 0 600 300" className="absolute inset-0 h-full w-full" aria-hidden>
              {BLSS_LINKS.map((link) => {
                const route = ROUTES[link.id]
                const on = linked.includes(link.id)
                return (
                  <g key={link.id}>
                    <path d={route.path} fill="none" stroke="#04080f" strokeWidth={on ? 11 : 7} strokeLinecap="round" />
                    <path
                      d={route.path}
                      fill="none"
                      stroke={on ? route.color : '#3a4468'}
                      strokeWidth={on ? 5 : 3}
                      strokeLinecap="round"
                      strokeDasharray={on ? undefined : '4 10'}
                      className={on ? 'gk-flow' : 'gk-flow-slow'}
                      style={on ? { filter: `drop-shadow(0 0 6px ${route.color})` } : undefined}
                    />
                    {on && !reduceMotion
                      ? PARTICLES.map((i) => (
                          <circle key={i} r="6" fill="#ffffff" stroke={route.color} strokeWidth="3">
                            <animateMotion dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" path={route.path} />
                          </circle>
                        ))
                      : null}
                  </g>
                )
              })}
            </svg>

            <figure className="absolute top-1/2 left-[2%] flex w-[19%] -translate-y-1/2 flex-col items-center gap-1">
              <PlayerChibi className="gk-pixelated gk-bob w-[88%]" />
              <Tag tone="water">{t('Crew', 'Tripulação')}</Tag>
            </figure>
            <figure className="absolute top-1/2 right-[1%] flex w-[22%] -translate-y-1/2 flex-col items-center gap-1">
              <img
                src={MEDIA.mission4.dome}
                alt=""
                className="gk-pixelated w-full transition-[filter] duration-700"
                style={{ filter: done ? 'drop-shadow(0 0 12px rgba(94,207,154,0.8))' : undefined }}
                draggable={false}
              />
              <Tag>{t('Greenhouse', 'Estufa')}</Tag>
            </figure>

            {BLSS_LINKS.map((link, index) => {
              const route = ROUTES[link.id]
              const on = linked.includes(link.id)
              return (
                <span key={link.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${route.x}%`, top: `${route.y}%` }}>
                  <button
                    type="button"
                    disabled={on}
                    onClick={() => {
                      soundEngine.cycle(linked.length)
                      if (linked.length === BLSS_LINKS.length - 1) window.setTimeout(() => soundEngine.success(), 260)
                      setFx((current) => ({ key: (current?.key ?? 0) + 1, id: link.id }))
                      onLink(link.id)
                    }}
                    aria-label={
                      on
                        ? t(`${link.labelEn}: on`, `${link.label}: ligado`)
                        : t(`Turn on the path: ${link.labelEn}`, `Ligar o caminho: ${link.label}`)
                    }
                    className={`flex min-h-12 items-center gap-1.5 border-2 px-2.5 font-pixel text-xs whitespace-nowrap uppercase ${
                      on ? 'bg-[#04080f]/90 text-[#f4fff4]' : 'gk-pulse bg-[#04080f] text-[#f4fff4]'
                    }`}
                    style={{
                      touchAction: 'manipulation',
                      borderColor: route.color,
                      ['--gk-glow' as string]: `${route.color}99`,
                      animationDelay: `${index * 0.25}s`,
                    }}
                  >
                    <route.Icon className="size-4 shrink-0" style={{ color: route.color }} aria-hidden />
                    {on ? t(route.flowEn, route.flowPt) : t(`Turn on ${link.labelEn}`, `Ligar ${link.label}`)}
                    {on ? <Check className="size-4 shrink-0 text-life" strokeWidth={3} aria-hidden /> : null}
                  </button>
                  {fx?.id === link.id ? <Burst key={fx.key} color={route.color} /> : null}
                </span>
              )
            })}
          </div>
        </div>

        <div className="gk-panel flex flex-col gap-3 p-3">
          <p className="font-pixel text-xs text-(--gk-accent) uppercase">{t('Life support', 'Suporte à vida')}</p>
          <BarMeter label={t('Food', 'Comida')} value={foodPct} color="#5ecf9a" icon={<Utensils className="size-3" aria-hidden />} />
          <BarMeter label={t('Oxygen', 'Oxigênio')} value={o2Pct} color="#7dffe0" icon={<Wind className="size-3" aria-hidden />} />
          <ul className="grid gap-1.5">
            {BLSS_LINKS.map((link) => {
              const on = linked.includes(link.id)
              return (
                <li
                  key={link.id}
                  className={`border-l-4 pl-2 text-sm leading-snug ${on ? 'text-[#f4fff4]' : 'border-[#30346d] text-[#f4fff4]/40'}`}
                  style={on ? { borderColor: ROUTES[link.id].color } : undefined}
                >
                  <span className="font-pixel text-[10px] uppercase" style={on ? { color: ROUTES[link.id].color } : undefined}>
                    {t(link.labelEn, link.label)}
                  </span>
                  <br />
                  {on ? t(link.detailEn, link.detail) : t('Path is off.', 'Caminho desligado.')}
                </li>
              )
            })}
          </ul>
          {done ? (
            <p className="gk-pop flex items-center gap-2 border-2 border-wellbeing bg-wellbeing/15 px-2 py-1.5 font-pixel text-[10px] text-[#ffd0cf] uppercase sm:text-xs">
              <Heart className="size-4 shrink-0" aria-hidden /> {t('Base wellbeing +8', 'Bem-estar da base +8')}
            </p>
          ) : null}
        </div>
      </div>

      {done ? <GameCta onClick={onDone}>{t('Write it in the logbook', 'Registrar no diário')}</GameCta> : null}
    </>
  )
}
