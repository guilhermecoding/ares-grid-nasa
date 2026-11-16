import type { ReactNode } from 'react'
import { ScrollHintArea } from '../ScrollHintArea'
import { MISSION2_META } from '../../data/mission2Data'

interface Props {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  /** Raised while a dialog covers the stage. */
  dialogOpen?: boolean
  /** Stays on screen while the challenge scrolls. */
  footer?: ReactNode
}

/** Shared challenge frame — same dark HUD language as Missão 01. */
export function Mission2Stage({ title, subtitle, children, dialogOpen = false, footer }: Props) {
  return (
    <div
      className={`absolute inset-0 flex min-h-0 flex-col ${dialogOpen ? 'z-[60]' : 'z-20'}`}
      style={{ touchAction: 'manipulation' }}
    >
      <ScrollHintArea
        variant="dark"
        frameClassName="h-full min-h-0 flex-1"
        className={`flex h-full flex-col gap-3 px-3 pt-16 sm:px-4 md:gap-4 md:px-6 ${footer ? 'pb-24' : 'pb-4'}`}
      >
        <div className="mx-auto w-full max-w-6xl">
          <p className="font-pixel text-[10px] text-cyan-hud md:text-xs">
            {MISSION2_META.solLabel} · {MISSION2_META.location}
          </p>
          <p className="mt-1 font-pixel text-sm text-[#f4fff4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] md:text-base lg:text-lg">
            {title}
          </p>
          {subtitle ? <div className="mt-1 text-sm text-void-100/90 md:text-base">{subtitle}</div> : null}
        </div>
        {children}
      </ScrollHintArea>
      {footer ? (
        <div className="absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex justify-end px-3 sm:px-4">
          {footer}
        </div>
      ) : null}
    </div>
  )
}
