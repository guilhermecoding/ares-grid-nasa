import { Lock } from 'lucide-react'
import type { MissionBadge } from '../data/missionBadges'

interface Props {
  badge: MissionBadge
  earned: boolean
  /** Tailwind size classes of the round medal. */
  sizeClass?: string
  iconClass?: string
}

/** Round insignia of one mission: lit when earned, locked otherwise. */
export function MissionMedal({ badge, earned, sizeClass = 'size-11', iconClass = 'size-5' }: Props) {
  const Icon = earned ? badge.icon : Lock
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center rounded-full border-2 ${sizeClass}`}
      style={
        earned
          ? {
              borderColor: badge.color,
              backgroundColor: `color-mix(in srgb, ${badge.color} 22%, #0a1628)`,
              color: badge.color,
              boxShadow: `0 0 12px color-mix(in srgb, ${badge.color} 55%, transparent)`,
            }
          : { borderColor: 'rgba(155,149,200,0.35)', backgroundColor: 'rgba(12,10,24,0.7)', color: 'rgba(155,149,200,0.6)' }
      }
      aria-hidden
    >
      <Icon className={iconClass} strokeWidth={2.4} />
    </span>
  )
}
