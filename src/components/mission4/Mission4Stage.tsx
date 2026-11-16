import { useMemo, type ReactNode } from 'react'
import { Droplets, Sprout, Utensils, Wind } from 'lucide-react'
import { MISSION4_META, type Mission4Step } from '../../data/mission4Data'
import { useI18n } from '../../i18n/locale'
import { BarMeter } from '../missionKit/kit'
import { MissionFrame } from '../missionKit/MissionFrame'
import { MAX_WATER_RESERVE_L } from '../../types/game'

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
  const { t } = useI18n()
  const tabs = useMemo(
    () => [
      t('4.1 Greenhouse', '4.1 Estufa'),
      t('4.2 Growing', '4.2 Cultivo'),
      t('4.3 Plants', '4.3 Plantas'),
      t('4.4 Grow', '4.4 Crescer'),
      t('4.5 Cycle', '4.5 Ciclo'),
    ],
    [t],
  )

  return (
    <MissionFrame
      theme="greenhouse"
      icon={<Sprout className="size-6 md:size-7" aria-hidden />}
      code={t('Mission 4', 'Missão 4')}
      title={t(MISSION4_META.titleEn, MISSION4_META.title)}
      subtitle={t(
        `${MISSION4_META.solLabel} · ${MISSION4_META.location} · Space farming and the bioregenerative cycle`,
        `${MISSION4_META.solLabel} · ${MISSION4_META.location} · Agricultura espacial e ciclo bioregenerativo`,
      )}
      tabs={tabs}
      current={TAB_INDEX[step]}
      hud={
        <>
          <BarMeter
            className="w-32"
            label={t('Water', 'Água')}
            value={(waterL / MAX_WATER_RESERVE_L) * 100}
            display={`${Math.round(waterL * 10) / 10} L`}
            color="#38bdf8"
            icon={<Droplets className="size-3" aria-hidden />}
          />
          {foodPct != null ? (
            <BarMeter className="w-28" label={t('Food', 'Comida')} value={foodPct} color="#5ecf9a" icon={<Utensils className="size-3" aria-hidden />} />
          ) : null}
          {o2Pct != null ? (
            <BarMeter className="w-28" label={t('Oxygen', 'Oxigênio')} value={o2Pct} color="#d7fff4" icon={<Wind className="size-3" aria-hidden />} />
          ) : null}
        </>
      }
      overlay={overlay}
    >
      {children}
    </MissionFrame>
  )
}
