import type { ReactNode } from 'react'
import { MISSION4_META } from '../../data/mission4Data'
import { ScrollHintArea } from '../ScrollHintArea'

interface Props {
  title: string
  subtitle?: ReactNode
  energy: number
  waterL: number
  foodPct?: number
  o2Pct?: number
  children: ReactNode
  overlay?: ReactNode
}

export function Mission4Stage({ title, subtitle, energy, waterL, foodPct, o2Pct, children, overlay }: Props) {
  return (
    <div
      className={`absolute inset-0 flex min-h-0 flex-col ${overlay ? 'z-[60]' : 'z-20'}`}
      style={{ touchAction: 'manipulation' }}
    >
      <ScrollHintArea
        variant="dark"
        frameClassName="h-full min-h-0 flex-1"
        className="flex h-full flex-col gap-3 px-3 pt-16 pb-8 sm:px-4 md:gap-4 md:px-6"
      >
        <div className="mx-auto w-full max-w-6xl">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-pixel text-xs text-cyan-hud md:text-sm">
            <span>
              {MISSION4_META.solLabel} | {MISSION4_META.location}
            </span>
            <span className="text-energy">Energia Base {Math.round(energy)}%</span>
            <span className="text-[#7dd3fc]">Reserva de Água {Math.round(waterL)} L</span>
            {foodPct != null ? <span className="text-[#7dffb0]">Comida {Math.round(foodPct)}%</span> : null}
            {o2Pct != null ? <span className="text-[#d7fff4]">O₂ {Math.round(o2Pct)}%</span> : null}
          </p>
          <p className="mt-1 font-pixel text-sm text-[#f4fff4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] md:text-base lg:text-lg">
            {title}
          </p>
          {subtitle ? <div className="mt-1 text-sm text-void-100/90 md:text-base">{subtitle}</div> : null}
        </div>
        {children}
      </ScrollHintArea>
      {overlay ? <div className="absolute inset-0 z-[70]">{overlay}</div> : null}
    </div>
  )
}
