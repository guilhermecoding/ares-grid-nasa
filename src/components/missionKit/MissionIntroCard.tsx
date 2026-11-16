import type { ReactNode } from 'react'
import { GameCta, Tag } from './kit'

interface Props {
  scene: ReactNode
  badge: string
  title: string
  lead: string
  goals: readonly { icon: ReactNode; label: string }[]
  cta: string
  onStart: () => void
}

/** Mission briefing card: what the level looks like and the challenges ahead. */
export function MissionIntroCard({ scene, badge, title, lead, goals, cta, onStart }: Props) {
  return (
    <div className="gk-panel grid gap-4 p-3 md:grid-cols-[1fr_1.1fr] md:p-4">
      <div className="relative aspect-[16/10] overflow-hidden border-4 border-(--gk-line)">{scene}</div>
      <div className="flex flex-col gap-3">
        <Tag className="w-fit">{badge}</Tag>
        <h2 className="font-pixel text-lg leading-tight text-[#f4fff4] uppercase md:text-2xl">{title}</h2>
        <p className="text-sm leading-snug text-[#f4fff4]/85 md:text-base">{lead}</p>
        <ol className="grid gap-1.5 sm:grid-cols-2">
          {goals.map((goal, index) => (
            <li
              key={goal.label}
              className="gk-pop flex min-h-10 items-center gap-2 border border-[#30346d] bg-[#04080f]/70 px-2 py-1.5 font-pixel text-[10px] leading-snug text-[#f4fff4]/90 uppercase sm:text-xs"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className="shrink-0 text-(--gk-accent)">{goal.icon}</span>
              {goal.label}
            </li>
          ))}
        </ol>
        <div className="mt-auto pt-1">
          <GameCta onClick={onStart}>{cta}</GameCta>
        </div>
      </div>
    </div>
  )
}
