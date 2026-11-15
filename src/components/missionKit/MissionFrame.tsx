import type { ReactNode } from 'react'
import { ScrollHintArea } from '../ScrollHintArea'
import { StepTabs } from './kit'
import { MISSION_THEMES, type MissionTheme } from './themes'

interface Props {
  theme: MissionTheme
  icon: ReactNode
  /** "Missão 4" */
  code: string
  title: string
  subtitle: ReactNode
  tabs: readonly string[]
  /** Index of the active tab; −1 before the first challenge. */
  current: number
  hud?: ReactNode
  children: ReactNode
  overlay?: ReactNode
}

/** Shared mission screen: title panel, step tabs, HUD gauges, scrolling play area and the Capi overlay. */
export function MissionFrame({ theme, icon, code, title, subtitle, tabs, current, hud, children, overlay }: Props) {
  return (
    <div
      className={`absolute inset-0 flex min-h-0 flex-col ${overlay ? 'z-[60]' : 'z-20'}`}
      style={{ touchAction: 'manipulation', ...MISSION_THEMES[theme] }}
    >
      <ScrollHintArea
        variant="dark"
        frameClassName="h-full min-h-0 flex-1"
        className="flex h-full flex-col gap-3 px-3 pt-16 pb-8 sm:px-4 md:px-6"
      >
        <header className="gk-panel mx-auto w-full max-w-6xl px-3 py-2.5">
          <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
            <div className="flex min-w-0 flex-1 items-start gap-2.5">
              <span className="mt-0.5 shrink-0 text-(--gk-accent)">{icon}</span>
              <div className="min-w-0">
                <h1 className="font-pixel text-sm leading-tight text-(--gk-accent) uppercase md:text-base lg:text-lg">
                  {code} — <span className="text-[#f4fff4]">{title}</span>
                </h1>
                <div className="mt-0.5 text-xs text-[#f4fff4]/75 md:text-sm">{subtitle}</div>
              </div>
            </div>
            {hud ? <div className="flex w-full flex-wrap items-end gap-x-4 gap-y-2 sm:w-auto">{hud}</div> : null}
          </div>
          <StepTabs tabs={tabs} current={current} />
        </header>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">{children}</div>
      </ScrollHintArea>
      {overlay ? <div className="absolute inset-0 z-[70]">{overlay}</div> : null}
    </div>
  )
}
