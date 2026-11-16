import { motion } from 'framer-motion'
import type { MissionBadge } from '../../data/missionBadges'
import { useI18n } from '../../i18n/locale'
import { badgeCopy } from '../../i18n/worldCopy'

interface Props {
  badge: MissionBadge
  caption: string
  /** False shows the camera viewfinder, true the developed photo. */
  captured: boolean
  className?: string
}

const CORNERS = [
  'top-2 left-2 border-t-2 border-l-2',
  'top-2 right-2 border-t-2 border-r-2',
  'bottom-2 left-2 border-b-2 border-l-2',
  'bottom-2 right-2 border-b-2 border-r-2',
] as const

/** Science photo of a mission: viewfinder before the shot, stamped print after. */
export function LogbookPhoto({ badge, caption, captured, className = '' }: Props) {
  const { t } = useI18n()
  const copy = badgeCopy(badge.id, t)
  return (
    <figure className={`border-2 border-[#30346d] bg-white p-1.5 shadow-[3px_3px_0_#30346d] ${className}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#1a1c3a]">
        <img
          src={badge.photo}
          alt={copy.photoAlt}
          width={480}
          height={360}
          draggable={false}
          className={`size-full object-cover transition-[filter] duration-500 ${
            captured ? '' : 'brightness-[0.55] saturate-50'
          }`}
        />
        {captured ? (
          <>
            <motion.div
              className="pointer-events-none absolute inset-0 bg-white"
              initial={{ opacity: 0.95 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              aria-hidden
            />
            <motion.span
              className="absolute top-2 right-2 -rotate-6 border-2 px-2 py-0.5 font-pixel text-[10px] tracking-widest text-white uppercase"
              style={{ borderColor: badge.color, backgroundColor: 'rgba(10,22,40,0.82)' }}
              initial={{ scale: 2.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 16, delay: 0.25 }}
            >
              {t(`Mission ${badge.id}`, `Missão ${badge.id}`)}
            </motion.span>
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {CORNERS.map((corner) => (
              <span key={corner} className={`absolute size-5 border-white/90 ${corner}`} />
            ))}
            <span className="absolute top-1/2 left-1/2 size-6 -translate-1/2 rounded-full border-2 border-white/80" />
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#0a1628]/80 px-2 py-0.5 font-pixel text-[10px] tracking-widest text-white uppercase">
              {t('Camera ready', 'Câmera pronta')}
            </span>
          </div>
        )}
      </div>
      {captured ? (
        <figcaption className="px-1 pt-1.5 pb-0.5 font-mono text-[10px] leading-snug text-[#1a1c3a] sm:text-[11px]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
