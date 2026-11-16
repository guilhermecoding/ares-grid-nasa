import { useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Check, Droplets, HeartPulse, RadioTower, SatelliteDish, ShieldAlert, Sprout, Sun, type LucideIcon } from 'lucide-react'
import { EXPEDITION_MISSIONS } from '../../data/mission5Data'
import { useI18n } from '../../i18n/locale'
import { soundEngine } from '../../services/soundEngine'
import { BarMeter, GameCta, Tag } from '../missionKit/kit'
import { MISSION_THEMES } from '../missionKit/themes'

interface Props {
  onDone: () => void
}

type Stage = 'idle' | 'search' | 'send' | 'done'

const ICONS: readonly LucideIcon[] = [Sun, HeartPulse, Droplets, Sprout, ShieldAlert]
const SEARCH_MS = 1800
const PACKET_MS = 750
const LINK = 'M 96 74 Q 300 -6 504 74'
const STARS = [
  [8, 20], [17, 62], [24, 12], [33, 40], [41, 78], [47, 18], [55, 55], [62, 28], [69, 80], [76, 14], [84, 48], [93, 70],
] as const

/** Cena 6: the five mission reports travel from Mars to Earth one packet at a time. */
export function EarthTransmission({ onDone }: Props) {
  const { t, locale } = useI18n()
  const reduceMotion = useReducedMotion()
  const [stage, setStage] = useState<Stage>('idle')
  const [sent, setSent] = useState(0)
  const total = EXPEDITION_MISSIONS.length
  const status = useMemo<Record<Stage, string>>(
    () => ({
      idle: t('Packet ready', 'Pacote preparado'),
      search: t('Searching for a signal from Earth…', 'Buscando sinal com a Terra…'),
      send: t('Link open · sending data', 'Conexão estabelecida · enviando dados'),
      done: t('Data received on Earth', 'Dados recebidos na Terra'),
    }),
    [t],
  )

  useEffect(() => {
    if (stage !== 'search') return
    const ping = window.setInterval(() => soundEngine.telemetry(), 450)
    const id = window.setTimeout(() => setStage('send'), SEARCH_MS)
    return () => {
      window.clearInterval(ping)
      window.clearTimeout(id)
    }
  }, [stage])

  useEffect(() => {
    if (stage !== 'send') return
    const id = window.setTimeout(() => {
      if (sent >= total) {
        soundEngine.success()
        setStage('done')
        return
      }
      soundEngine.uplink()
      setSent((value) => value + 1)
    }, PACKET_MS)
    return () => window.clearTimeout(id)
  }, [sent, stage, total])

  const linkColor = stage === 'idle' ? '#5b6b8c' : stage === 'search' ? '#f0b429' : '#5ecf9a'
  const live = stage === 'send' || stage === 'done'

  return (
    <div className="gk-panel mx-auto flex max-h-full w-full max-w-3xl flex-col gap-3 overflow-y-auto p-3 md:p-4" style={MISSION_THEMES.comms}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-pixel text-sm text-(--gk-accent) uppercase md:text-base">
          <SatelliteDish className="size-5" aria-hidden /> {t('Communication center', 'Central de comunicação')}
        </h2>
        <Tag tone={stage === 'done' ? 'accent' : stage === 'idle' ? 'muted' : 'energy'}>
          <span className={stage === 'search' || stage === 'send' ? 'gk-blink' : ''}>●</span> {status[stage]}
        </Tag>
      </div>

      {/* Mars ↔ Earth link */}
      <div className="relative aspect-[600/150] min-h-28 overflow-hidden border-2 border-(--gk-line) bg-[#02050c]">
        {STARS.map(([x, y], i) => (
          <span
            key={`${x}-${y}`}
            className={`absolute size-0.5 bg-white ${i % 3 === 0 ? 'gk-blink' : ''}`}
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.2}s` }}
            aria-hidden
          />
        ))}
        <svg viewBox="0 0 600 150" className="absolute inset-0 h-full w-full" role="img" aria-label={t(`Link between Mars and Earth: ${status[stage]}`, `Ligação entre Marte e a Terra: ${status[stage]}`)}>
          <path
            d={LINK}
            fill="none"
            stroke={linkColor}
            strokeWidth={live ? 4 : 3}
            strokeDasharray={live ? '10 8' : '4 10'}
            strokeLinecap="round"
            className={stage === 'idle' ? '' : stage === 'search' ? 'gk-flow-slow' : 'gk-flow'}
            style={{ filter: live ? `drop-shadow(0 0 6px ${linkColor})` : undefined }}
          />
          {stage === 'send' && !reduceMotion
            ? [0, 0.4, 0.8].map((delay) => (
                <rect key={delay} x="-5" y="-5" width="10" height="10" fill="#f4fff4" stroke="#5ecf9a" strokeWidth="2">
                  <animateMotion dur="1.2s" begin={`${delay}s`} repeatCount="indefinite" path={LINK} />
                </rect>
              ))
            : null}
          {/* Mars */}
          <circle cx="70" cy="92" r="40" fill="#c2552d" />
          <circle cx="58" cy="80" r="9" fill="#9a3a19" />
          <circle cx="86" cy="104" r="12" fill="#a8431f" />
          <circle cx="70" cy="92" r="40" fill="none" stroke="#04080f" strokeWidth="4" />
          {/* Earth */}
          <circle cx="530" cy="92" r="40" fill="#2f7fe0" />
          <path d="M 508 70 q 14 -10 26 0 q 6 12 -6 20 q -16 6 -20 -6 z" fill="#5ecf9a" />
          <path d="M 536 100 q 14 -4 20 8 q -4 14 -16 12 q -10 -8 -4 -20 z" fill="#5ecf9a" />
          <circle cx="530" cy="92" r="40" fill="none" stroke="#04080f" strokeWidth="4" />
          {stage === 'done' ? <circle cx="530" cy="92" r="46" fill="none" stroke="#5ecf9a" strokeWidth="3" className="gk-blink" /> : null}
        </svg>
        {stage === 'search' ? (
          <span className="pointer-events-none absolute top-[38%] left-[14%] size-8" aria-hidden>
            <span className="gk-ping absolute inset-0 rounded-full border-2 border-energy" />
            <span className="gk-ping absolute inset-0 rounded-full border-2 border-energy" style={{ animationDelay: '0.5s' }} />
          </span>
        ) : null}
        <Tag tone="energy" className="absolute bottom-1.5 left-1.5">
          <RadioTower className="size-3" aria-hidden /> {t('Mars · Arcadia Planitia', 'Marte · Arcadia Planitia')}
        </Tag>
        <Tag tone="water" className="absolute right-1.5 bottom-1.5">
          {t('Earth · NASA', 'Terra · NASA')}
        </Tag>
      </div>

      {/* Report packets */}
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {EXPEDITION_MISSIONS.map((mission, index) => {
          const Icon = ICONS[index]
          const ok = index < sent
          const sending = stage === 'send' && index === sent
          return (
            <li
              key={mission.en}
              className={`relative flex min-h-20 flex-col items-center justify-center gap-1 border-2 px-1.5 py-2 text-center ${
                ok ? 'gk-pop border-life bg-life/15' : sending ? 'gk-pulse border-energy bg-[#1c1608]' : 'border-[#30346d] bg-[#04080f]/70'
              } ${index === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
              style={{ ['--gk-glow' as string]: 'rgba(240,180,41,0.6)' }}
            >
              <Icon className={`size-6 ${ok ? 'text-[#7dffb0]' : sending ? 'text-energy' : 'text-[#f4fff4]/60'}`} aria-hidden />
              <span className="font-pixel text-[9px] leading-tight text-[#f4fff4] uppercase sm:text-[10px]">
                {index + 1}. {mission[locale]}
              </span>
              <span className={`font-pixel text-[8px] uppercase ${ok ? 'text-[#7dffb0]' : sending ? 'text-energy' : 'text-[#f4fff4]/45'}`}>
                {ok ? t('Received', 'Recebido') : sending ? t('Sending…', 'Enviando…') : t('Ready', 'Pronto')}
              </span>
              {ok ? (
                <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full border-2 border-[#04080f] bg-life text-[#04140a]">
                  <Check className="size-3" strokeWidth={4} aria-hidden />
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>

      <BarMeter label={t('Report sent', 'Relatório transmitido')} value={(sent / total) * 100} display={`${sent}/${total}`} color="#5ecf9a" />

      {stage === 'idle' ? (
        <GameCta
          onClick={() => {
            soundEngine.scan()
            setStage('search')
          }}
        >
          {t('Send the report to Earth', 'Transmitir relatório para a Terra')}
        </GameCta>
      ) : stage === 'done' ? (
        <GameCta onClick={onDone}>{t('See the finished base', 'Ver a base pronta')}</GameCta>
      ) : (
        <p className="min-h-14 text-center font-pixel text-xs leading-[3.5rem] text-energy uppercase" aria-live="polite">
          {status[stage]}
        </p>
      )}
    </div>
  )
}
