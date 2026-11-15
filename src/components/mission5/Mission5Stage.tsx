import type { ReactNode } from 'react'
import { MISSION5_META } from '../../data/mission5Data'
import { ScrollHintArea } from '../ScrollHintArea'

interface Props {
  title: string
  subtitle?: ReactNode
  energy: number
  radiation: number
  integrity: number
  generationPct: number
  children: ReactNode
  overlay?: ReactNode
}

export function Mission5Stage({
  title,
  subtitle,
  energy,
  radiation,
  integrity,
  generationPct,
  children,
  overlay,
}: Props) {
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
              {MISSION5_META.solLabel} | {MISSION5_META.location}
            </span>
            <span className="text-energy">Bateria {Math.round(energy)}%</span>
            <span className="text-[#ffb4b4]">Radiação {radiation.toFixed(1)} mSv</span>
            <span className="text-[#7dffb0]">Integridade {Math.round(integrity)}%</span>
            <span className="text-[#ffb15a]">Geração {Math.round(generationPct)}%</span>
          </p>
          <p className="mt-1 font-pixel text-sm text-[#f4fff4] md:text-base lg:text-lg">{title}</p>
          {subtitle ? <div className="mt-1 text-sm text-void-100/90 md:text-base">{subtitle}</div> : null}
        </div>
        {children}
      </ScrollHintArea>
      {overlay ? <div className="absolute inset-0 z-[70]">{overlay}</div> : null}
    </div>
  )
}
