import type { ReactNode } from 'react'
import { Droplets, Sprout, Utensils, Wind } from 'lucide-react'
import { MISSION4_META, type Mission4Step } from '../../data/mission4Data'
import { BarMeter } from '../missionKit/kit'
import { MissionFrame } from '../missionKit/MissionFrame'
import { MAX_WATER_RESERVE_L } from '../../types/game'

const TABS = ['4.1 Estufa', '4.2 Cultivo', '4.3 Plantas', '4.4 Crescer', '4.5 Ciclo'] as const

const TAB_INDEX: Record<Mission4Step, number> = {
  intro: -1,
  step4_1_build_greenhouse: 0,
  step4_2_cultivation_method: 1,
  step4_3_select_species: 2,
  step4_4_growth_monitor: 3,
  step4_5_bioregenerative: 4,
  step4_logbook_and_sleep: 5,
}

interface Props {
  step: Mission4Step
  waterL: number
  foodPct?: number
  o2Pct?: number
  children: ReactNode
  overlay?: ReactNode
}

export function Mission4Stage({ step, waterL, foodPct, o2Pct, children, overlay }: Props) {
  return (
    <MissionFrame
      theme="greenhouse"
      icon={<Sprout className="size-6 md:size-7" aria-hidden />}
      code="Missão 4"
      title={MISSION4_META.title}
      subtitle={`${MISSION4_META.solLabel} · ${MISSION4_META.location} · Agricultura espacial e ciclo bioregenerativo`}
      tabs={TABS}
      current={TAB_INDEX[step]}
      hud={
        <>
          <BarMeter
            className="w-32"
            label="Água"
            value={(waterL / MAX_WATER_RESERVE_L) * 100}
            display={`${Math.round(waterL * 10) / 10} L`}
            color="#38bdf8"
            icon={<Droplets className="size-3" aria-hidden />}
          />
          {foodPct != null ? (
            <BarMeter className="w-28" label="Comida" value={foodPct} color="#5ecf9a" icon={<Utensils className="size-3" aria-hidden />} />
          ) : null}
          {o2Pct != null ? (
            <BarMeter className="w-28" label="Oxigênio" value={o2Pct} color="#d7fff4" icon={<Wind className="size-3" aria-hidden />} />
          ) : null}
        </>
      }
      overlay={overlay}
    >
      {children}
    </MissionFrame>
  )
}
