import { Check, Droplets, FlaskConical, TriangleAlert, Zap } from 'lucide-react'
import { ChallengeBar, GameCta, PipMeter, Tag } from '../../components/missionKit/kit'
import { SciTerm } from '../../components/SciTerm'
import { MEDIA } from '../../constants/mediaAssets'
import { CULTIVATION_METHODS, SCI_TERMS_M4, SCI_TERMS_M4_EN, type CultivationMethodId } from '../../data/mission4Data'
import { useI18n } from '../../i18n/locale'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  method: CultivationMethodId | null
  energy: number
  waterL: number
  onChoose: (id: CultivationMethodId) => void
  onEnergyShort: () => void
  onWaterShort: () => void
  onDone: () => void
}

const ROOTS: Record<CultivationMethodId, { en: string; pt: string }> = {
  hydro: { en: 'Roots in water', pt: 'Raízes na água' },
  aero: { en: 'Roots in the air with mist', pt: 'Raízes no ar com névoa' },
  regolith: { en: 'Roots in Martian soil', pt: 'Raízes no solo de Marte' },
}

export function MethodStep({ method, energy, waterL, onChoose, onEnergyShort, onWaterShort, onDone }: Props) {
  const { t, locale } = useI18n()
  const terms = locale === 'en' ? SCI_TERMS_M4_EN : SCI_TERMS_M4

  return (
    <>
      <ChallengeBar
        code="4.2"
        title={t('Choose the growing method', 'Escolha o método de cultivo')}
        icon={<FlaskConical className="size-5" aria-hidden />}
        counterLabel={t('Method', 'Método')}
        value={method ? 1 : 0}
        total={1}
        hint={
          locale === 'en' ? (
            <>
              Compare the meters. <SciTerm term="Hydroponics" terms={terms} /> uses more water.{' '}
              <SciTerm term="Aeroponics" terms={terms} /> uses more energy. Raw <SciTerm term="Regolith" terms={terms} /> has{' '}
              <SciTerm term="Perchlorates" terms={terms} />.
            </>
          ) : (
            <>
              Compare os medidores. A <SciTerm term="Hidroponia" terms={terms} /> gasta mais água. A{' '}
              <SciTerm term="Aeroponia" terms={terms} /> gasta mais energia. O <SciTerm term="Regolito" terms={terms} /> cru tem{' '}
              <SciTerm term="Percloratos" terms={terms} />.
            </>
          )
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        {CULTIVATION_METHODS.map((item) => {
          const chosen = method === item.id
          const dimmed = method != null && !chosen
          return (
            <button
              key={item.id}
              type="button"
              disabled={method != null}
              onClick={() => {
                if (energy < item.energyCost) {
                  onEnergyShort()
                  return
                }
                if (waterL < item.waterL) {
                  onWaterShort()
                  return
                }
                soundEngine.snap()
                onChoose(item.id)
              }}
              className={`group relative flex flex-col overflow-hidden border-2 bg-[#091422]/95 text-left transition-[transform,opacity,border-color] duration-300 ${
                chosen
                  ? 'z-10 border-life shadow-[0_0_24px_rgba(94,207,154,0.55)] md:-translate-y-1.5'
                  : dimmed
                    ? 'border-[#262b4d] opacity-45'
                    : 'border-(--gk-line) hover:-translate-y-1 hover:border-energy'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <span className="relative block aspect-[4/3] w-full overflow-hidden border-b-2 border-inherit sm:aspect-[16/9] md:aspect-[4/3]">
                <img src={MEDIA.mission4.methods[item.id]} alt="" className="gk-pixelated h-full w-full object-cover" draggable={false} />
                <Tag className="absolute top-2 left-2" tone="water">
                  {t(ROOTS[item.id].en, ROOTS[item.id].pt)}
                </Tag>
                {item.id === 'regolith' ? (
                  <Tag className="absolute right-2 bottom-2" tone="danger">
                    <TriangleAlert className="size-3" aria-hidden /> {t('Needs treatment', 'Precisa de tratamento')}
                  </Tag>
                ) : null}
                {chosen ? (
                  <span className="gk-pop absolute inset-0 flex items-center justify-center bg-[#04130c]/55">
                    <span className="flex items-center gap-1.5 border-2 border-life bg-[#04130c] px-3 py-1.5 font-pixel text-sm text-[#7dffb0] uppercase">
                      <Check className="size-4" strokeWidth={3} aria-hidden /> {t('Chosen', 'Escolhido')}
                    </span>
                  </span>
                ) : null}
              </span>
              <span className="flex flex-1 flex-col gap-2 p-3">
                <span className="font-pixel text-sm text-energy uppercase md:text-base">{t(item.titleEn, item.title)}</span>
                <span className="text-sm leading-snug text-[#f4fff4]/85">{t(item.detailEn, item.detail)}</span>
                <span className="mt-auto grid gap-1.5 pt-1">
                  <PipMeter
                    label={t('Water', 'Água')}
                    filled={item.waterL}
                    total={6}
                    color="#38bdf8"
                    value={`−${item.waterL} L`}
                    icon={<Droplets className="size-3" aria-hidden />}
                  />
                  <PipMeter
                    label={t('Energy', 'Energia')}
                    filled={item.energyCost / 2}
                    total={6}
                    color="#f0b429"
                    value={`−${item.energyCost}%`}
                    icon={<Zap className="size-3" aria-hidden />}
                  />
                </span>
                {method == null ? (
                  <span className="mt-1 bg-energy px-2 py-1.5 text-center font-pixel text-xs text-[#1a1203] uppercase group-hover:bg-[#ffd166]">
                    {t('Choose', 'Escolher')}
                  </span>
                ) : null}
              </span>
            </button>
          )
        })}
      </div>

      {method ? <GameCta onClick={onDone}>{t('Plant the species (Challenge 4.3)', 'Plantar as espécies (Desafio 4.3)')}</GameCta> : null}
    </>
  )
}
