import { useMemo, type ReactNode } from 'react'
import { BatteryCharging, Radiation, ShieldCheck, Sun, TriangleAlert } from 'lucide-react'
import { MISSION5_META, type Mission5Step } from '../../data/mission5Data'
import { useI18n } from '../../i18n/locale'
import { BarMeter } from '../missionKit/kit'
import { MissionFrame } from '../missionKit/MissionFrame'

const TAB_INDEX: Record<Mission5Step, number> = {
  intro: -1,
  step5_1_dust_storm: 0,
  step5_2_clean_panels: 1,
  step5_3_solar_radiation: 2,
  step5_4_post_storm_inspection: 3,
  step5_logbook_and_sleep: 4,
  scene6_earth_transmission: 4,
  scene7_ending: 4,
}

/** Gauge tops out at 8 mSv, a bit above the storm peak. */
const RADIATION_MAX = 8

interface Props {
  step: Mission5Step
  subtitle: ReactNode
  energy: number
  radiation: number
  integrity: number
  generationPct: number
  children: ReactNode
  overlay?: ReactNode
}

export function Mission5Stage({ step, subtitle, energy, radiation, integrity, generationPct, children, overlay }: Props) {
  const { t, locale } = useI18n()
  const tabs = useMemo(
    () => [
      t('5.1 Dust', '5.1 Poeira'),
      t('5.2 Panels', '5.2 Painéis'),
      t('5.3 Radiation', '5.3 Radiação'),
      t('5.4 Inspection', '5.4 Inspeção'),
    ],
    [t],
  )
  const radiationColor = radiation <= 1.2 ? '#5ecf9a' : radiation <= 3 ? '#f0b429' : '#ff6b8a'
  return (
    <MissionFrame
      theme="alert"
      icon={<TriangleAlert className="size-6 md:size-7" aria-hidden />}
      code={t('Mission 5', 'Missão 5')}
      title={MISSION5_META.title[locale]}
      subtitle={subtitle}
      tabs={tabs}
      current={TAB_INDEX[step]}
      hud={
        <>
          <BarMeter className="w-24" label={t('Battery', 'Bateria')} value={energy} color="#f0b429" icon={<BatteryCharging className="size-3" aria-hidden />} />
          <BarMeter className="w-24" label={t('Power', 'Geração')} value={generationPct} color="#ffb15a" icon={<Sun className="size-3" aria-hidden />} />
          <BarMeter
            className="w-28"
            label={t('Radiation', 'Radiação')}
            value={(radiation / RADIATION_MAX) * 100}
            display={`${radiation.toFixed(1)} mSv`}
            color={radiationColor}
            icon={<Radiation className="size-3" aria-hidden />}
          />
          <BarMeter className="w-28" label={t('Integrity', 'Integridade')} value={integrity} color="#5ecf9a" icon={<ShieldCheck className="size-3" aria-hidden />} />
        </>
      }
      overlay={overlay}
    >
      {children}
    </MissionFrame>
  )
}
