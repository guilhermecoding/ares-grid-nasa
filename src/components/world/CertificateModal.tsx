import { Lock, X } from 'lucide-react'
import { MEDIA } from '../../constants/mediaAssets'
import { completedMissions, MISSION_BADGES, TOTAL_MISSIONS, TROPHY_SPRITE } from '../../data/missionBadges'
import { INSIGNIAS, type InsigniaId } from '../../data/openingData'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'
import { ConfettiBurst } from '../ConfettiBurst'
import { MissionMedal } from '../MissionMedal'
import { ScrollHintArea } from '../ScrollHintArea'
import { useEscapeKey } from './useEscapeKey'

interface Props {
  playerName: string
  insignia: InsigniaId
  level: number
  /** Epoch ms of the day the expedition was completed, when known. */
  completedAt: number | null
  /** First time the certificate is shown: add confetti. */
  celebrate?: boolean
  onClose: () => void
}

const DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

/** The patch the player picked for the suit in the opening. */
function SuitInsignia({ id }: { id: InsigniaId }) {
  return (
    <svg viewBox="0 0 24 24" className="size-7 shrink-0" aria-hidden>
      <rect x="1" y="1" width="22" height="22" rx="4" fill="#1a1c3a" stroke="#c9962b" strokeWidth="2" />
      {id === 'star' ? (
        <polygon points="12,4 14.2,9.6 20,9.8 15.4,13.4 17,19 12,15.8 7,19 8.6,13.4 4,9.8 9.8,9.6" fill="#f0b429" />
      ) : id === 'mars' ? (
        <circle cx="12" cy="12" r="6.5" fill="#e67a2e" stroke="#8a3d22" strokeWidth="1.5" />
      ) : (
        <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#4ea1ff" fontFamily="sans-serif">
          A
        </text>
      )}
    </svg>
  )
}

/** Player certificate: name, insignias and missions completed. */
export function CertificateModal({ playerName, insignia, level, completedAt, celebrate = false, onClose }: Props) {
  useEscapeKey(onClose)
  const done = completedMissions(level)
  const earned = done >= TOTAL_MISSIONS
  const name = playerName.trim() || 'Astronauta'
  const insigniaLabel = INSIGNIAS.find((item) => item.id === insignia)?.label ?? 'Ares'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void-950/80 p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-title"
    >
      {celebrate && earned ? <ConfettiBurst count={90} /> : null}
      <ScrollHintArea
        variant="light"
        frameClassName="gk-pop relative z-10 w-full max-w-2xl border-4 border-[#1a1c3a] bg-[#fff8e6] text-[#1a1c3a] shadow-[0_0_0_3px_#c9962b,0_0_40px_rgba(240,180,41,0.35)]"
        className="max-h-[min(94dvh,48rem)] p-2.5 sm:p-3"
      >
        <div className="relative border-2 border-[#c9962b] px-3 py-4 text-center outline-1 outline-offset-[-6px] outline-[#c9962b]/60 sm:px-6 sm:py-5">
          <button
            type="button"
            autoFocus
            aria-label="Fechar o certificado"
            className="absolute top-2 right-2 flex size-11 items-center justify-center border-2 border-[#1a1c3a] bg-[#30346d] text-[#fff8e6]"
            style={{ touchAction: 'manipulation' }}
            onClick={() => {
              soundEngine.click()
              onClose()
            }}
          >
            <X className="size-5" aria-hidden />
          </button>

          <p className="mx-12 font-pixel text-[10px] tracking-widest text-[#8a5a12] uppercase sm:text-xs">
            Expedição Ares Grid · Arcadia Planitia, Marte
          </p>
          <h2 id="certificate-title" className="mt-2 font-pixel text-lg leading-tight uppercase sm:text-2xl">
            {earned ? 'Certificado de Conclusão' : 'Certificado em preparação'}
          </h2>

          <p className="mt-3 font-body text-sm text-[#1a1c3a]/80 sm:text-base">
            {earned ? 'Este certificado comprova que' : 'Este certificado está sendo preparado para'}
          </p>
          <p className="mx-auto mt-1 w-fit max-w-full border-b-4 border-[#c9962b] px-3 pb-1 font-pixel text-2xl break-words text-[#8a3d22] sm:text-3xl">
            {name}
          </p>
          <p className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed sm:text-base">
            {earned
              ? 'concluiu as 5 missões científicas da expedição e deixou a base de Arcadia Planitia pronta para os próximos astronautas.'
              : `já concluiu ${done} de ${TOTAL_MISSIONS} missões científicas. Complete todas as missões para receber o certificado com o troféu da expedição.`}
          </p>

          <p className="mt-4 font-pixel text-[10px] tracking-widest text-[#8a5a12] uppercase sm:text-xs">Insígnias</p>
          <ul className="mt-2 grid grid-cols-5 gap-1 sm:gap-2" aria-label="Insígnias das missões">
            {MISSION_BADGES.map((badge) => {
              const has = level > badge.id
              return (
                <li
                  key={badge.id}
                  className="flex flex-col items-center gap-1"
                  aria-label={`${badge.title}: ${has ? 'conquistada' : 'bloqueada'}`}
                >
                  <MissionMedal badge={badge} earned={has} sizeClass="size-11 sm:size-14" iconClass="size-5 sm:size-7" />
                  <span
                    className={`font-body text-[11px] leading-tight font-bold sm:text-xs ${has ? '' : 'text-[#1a1c3a]/45'}`}
                  >
                    {badge.title}
                  </span>
                </li>
              )
            })}
          </ul>

          <dl className="mt-4 grid grid-cols-2 gap-2 text-left sm:grid-cols-3">
            <div className="border-2 border-[#c9962b]/60 bg-white/55 px-3 py-2">
              <dt className="font-pixel text-[10px] text-[#8a5a12] uppercase">Missões concluídas</dt>
              <dd className="font-pixel text-xl tabular-nums">
                {done}
                <span className="text-sm text-[#1a1c3a]/60"> de {TOTAL_MISSIONS}</span>
              </dd>
            </div>
            <div className="border-2 border-[#c9962b]/60 bg-white/55 px-3 py-2">
              <dt className="font-pixel text-[10px] text-[#8a5a12] uppercase">Insígnia do traje</dt>
              <dd className="mt-0.5 flex items-center gap-2 font-pixel text-sm">
                <SuitInsignia id={insignia} />
                {insigniaLabel}
              </dd>
            </div>
            <div className="col-span-2 border-2 border-[#c9962b]/60 bg-white/55 px-3 py-2 sm:col-span-1">
              <dt className="font-pixel text-[10px] text-[#8a5a12] uppercase">{earned ? 'Concluído em' : 'Situação'}</dt>
              <dd className="font-body text-sm font-bold sm:text-base">
                {earned ? (completedAt ? DATE_FORMAT.format(completedAt) : 'Expedição completa') : 'Expedição em andamento'}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div className="flex items-center gap-2 text-left">
              <img
                src={MEDIA.capi.neutral}
                alt=""
                draggable={false}
                className="size-14 shrink-0 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
              <div>
                <p className="border-b-2 border-[#1a1c3a]/50 pr-4 font-pixel text-sm">Capi</p>
                <p className="mt-0.5 font-body text-xs text-[#1a1c3a]/75">Guia da expedição</p>
              </div>
            </div>
            {earned ? (
              <img
                src={TROPHY_SPRITE}
                alt="Troféu da expedição"
                width={96}
                height={96}
                draggable={false}
                className="size-20 shrink-0 object-contain drop-shadow-[0_3px_0_rgba(26,28,58,0.35)] sm:size-24"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <span
                className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#8a5a12]/60 text-[#8a5a12]/70"
                role="img"
                aria-label="Troféu bloqueado"
              >
                <Lock className="size-6" aria-hidden />
              </span>
            )}
          </div>

          <McButton className="mt-4 min-h-12 w-full px-3 font-pixel text-base font-bold" onClick={onClose}>
            Voltar ao mapa
          </McButton>
        </div>
      </ScrollHintArea>
    </div>
  )
}
