import { MISSION2_META } from '../../data/mission2Data'
import { SciTermM2 } from './SciTermM2'

interface Props {
  energyPct: number
  waterL: number
  wellbeingPct: number
}

function Meter({
  label,
  display,
  fillPct,
  color,
}: {
  label: string
  display: string
  fillPct: number
  color: string
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate font-pixel text-[8px] text-void-300 sm:text-[9px]">{label}</p>
      <div className="mt-0.5 flex items-end gap-1">
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-void-950">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, fillPct))}%`, background: color }}
          />
        </div>
        <span className="shrink-0 font-pixel text-[9px] tabular-nums text-[#f4fff4] sm:text-[10px]">{display}</span>
      </div>
    </div>
  )
}

/** Compact top HUD — Sol 02 + base energy / water / wellbeing. */
export function Mission2Hud({ energyPct, waterL, wellbeingPct }: Props) {
  const waterFill = (waterL / MISSION2_META.initialWaterReserveL) * 100
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-md border border-cyan-hud/40 bg-[#0a1628]/85 px-2.5 py-2 shadow-[0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-[2px] sm:px-3">
        <p className="font-pixel text-[10px] tracking-wide text-cyan-hud sm:text-xs">
          {MISSION2_META.solLabel} | <SciTermM2 term="Arcadia Planitia" />
        </p>
        <div className="mt-1.5 flex gap-2 sm:gap-3">
          <Meter
            label="Energia Base"
            display={`${Math.round(energyPct)}%`}
            fillPct={energyPct}
            color="var(--color-energy)"
          />
          <Meter
            label="Água"
            display={`${Math.round(waterL * 10) / 10}L`}
            fillPct={waterFill}
            color="var(--color-life)"
          />
          <Meter
            label="Bem-Estar"
            display={`${Math.round(wellbeingPct)}%`}
            fillPct={wellbeingPct}
            color="var(--color-shield)"
          />
        </div>
      </div>
    </div>
  )
}
