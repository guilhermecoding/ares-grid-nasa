import { useCallback, useState } from 'react'
import { Check, Sprout } from 'lucide-react'
import { PlantTray } from '../../components/mission4/PlantTray'
import { GROWTH_SCALE, TRAY_BEDS, TRAY_ORDER, TRAY_VIEWBOX } from '../../components/mission4/trayLayout'
import { Burst, ChallengeBar, GameCta } from '../../components/missionKit/kit'
import { useDrag } from '../../components/missionKit/useDrag'
import { MEDIA } from '../../constants/mediaAssets'
import { PLANT_GROUPS, speciesLabel, type PlantGroupId, type SpeciesId } from '../../data/mission4Data'
import { useI18n } from '../../i18n/locale'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  planted: Partial<Record<PlantGroupId, SpeciesId>>
  onPlant: (group: PlantGroupId, species: SpeciesId) => void
  onMismatch: () => void
  onDone: () => void
}

interface Seed {
  species: SpeciesId
  group: PlantGroupId
}

function isGroup(value: string | null): value is PlantGroupId {
  return value != null && value in TRAY_BEDS
}

export function PlantStep({ planted, onPlant, onMismatch, onDone }: Props) {
  const { t, locale } = useI18n()
  const [wrong, setWrong] = useState<PlantGroupId | null>(null)
  const [fx, setFx] = useState<{ key: number; group: PlantGroupId } | null>(null)
  const count = PLANT_GROUPS.filter((g) => planted[g.id]).length
  const full = count === PLANT_GROUPS.length

  const onDrop = useCallback(
    (seed: Seed, target: string | null) => {
      if (!isGroup(target)) return
      if (target !== seed.group) {
        soundEngine.fail()
        setWrong(target)
        onMismatch()
        return
      }
      soundEngine.snap()
      window.setTimeout(() => soundEngine.harvest(), 120)
      onPlant(seed.group, seed.species)
      setFx((current) => ({ key: (current?.key ?? 0) + 1, group: seed.group }))
    },
    [onMismatch, onPlant],
  )
  const { drag, start } = useDrag<Seed>(onDrop)

  const scales = Object.fromEntries(
    TRAY_ORDER.filter((group) => planted[group]).map((group) => [group, GROWTH_SCALE[0]]),
  ) as Partial<Record<PlantGroupId, number>>

  return (
    <>
      <ChallengeBar
        code="4.3"
        title={t('Plant one species in each bed', 'Plante uma espécie em cada berço')}
        icon={<Sprout className="size-5" aria-hidden />}
        counterLabel={t('Beds', 'Berços')}
        value={count}
        total={PLANT_GROUPS.length}
        hint={t(
          'Drag the seed to the bed of the same color. Each bed takes one group.',
          'Arraste a semente até o berço da mesma cor. Cada berço aceita um grupo.',
        )}
      />

      <div className="grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="gk-panel p-3">
          <p className="font-pixel text-xs text-(--gk-accent) uppercase">{t('Seed bank', 'Banco de sementes')}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {PLANT_GROUPS.flatMap((group) =>
              group.species.map((species) => {
                const bed = TRAY_BEDS[group.id]
                const groupDone = Boolean(planted[group.id])
                const used = planted[group.id] === species.id
                const dragging = drag?.payload.species === species.id
                return (
                  <button
                    key={species.id}
                    type="button"
                    disabled={groupDone}
                    onPointerDown={(e) => {
                      if (groupDone) return
                      soundEngine.pickup()
                      start({ species: species.id, group: group.id }, e)
                    }}
                    aria-label={t(
                      `Drag seed: ${species.labelEn}, ${group.titleEn} group`,
                      `Arrastar semente: ${species.label}, grupo ${group.title}`,
                    )}
                    className={`relative flex min-h-16 touch-none items-center gap-2 border-2 bg-[#04080f]/70 px-2 py-1.5 text-left select-none ${
                      used ? '' : groupDone ? 'opacity-35' : dragging ? 'opacity-40' : 'cursor-grab hover:-translate-y-0.5'
                    }`}
                    style={{ touchAction: 'none', borderColor: bed.color }}
                  >
                    <img src={MEDIA.mission4.seeds[species.id]} alt="" className="gk-pixelated size-11 shrink-0" draggable={false} />
                    <span className="min-w-0">
                      <span className="block font-pixel text-[10px] leading-tight text-[#f4fff4] uppercase sm:text-xs">
                        {t(species.labelEn, species.label)}
                      </span>
                      <span className="mt-0.5 block font-pixel text-[9px] leading-none uppercase" style={{ color: bed.color }}>
                        {t(group.titleEn, group.title)}
                      </span>
                    </span>
                    {used ? (
                      <span className="gk-pop absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-life text-[#04130c]">
                        <Check className="size-3" strokeWidth={3} aria-label={t('Planted', 'Plantado')} />
                      </span>
                    ) : null}
                  </button>
                )
              }),
            )}
          </div>
        </div>

        <div className="gk-panel flex flex-col items-center p-3">
          <p className="self-start font-pixel text-xs text-(--gk-accent) uppercase">{t('Growing tray', 'Bandeja de cultivo')}</p>
          <PlantTray plants={scales} className="mt-1 max-w-xl">
            <svg viewBox={TRAY_VIEWBOX} className="absolute inset-0 h-full w-full">
              {TRAY_ORDER.map((group) => {
                const bed = TRAY_BEDS[group]
                const done = Boolean(planted[group])
                const wanted = drag != null && !done && drag.payload.group === group
                const hovered = drag?.over === group
                return (
                  <polygon
                    key={group}
                    data-drop={done ? undefined : group}
                    points={bed.points}
                    fill={bed.color}
                    fillOpacity={done ? 0 : hovered ? 0.5 : wanted ? 0.28 : 0.08}
                    stroke={wrong === group ? '#ff3b5c' : bed.color}
                    strokeWidth={wanted || wrong === group ? 8 : 4}
                    strokeDasharray={done ? undefined : '14 10'}
                    strokeOpacity={done ? 0.45 : 1}
                    className={wanted ? 'gk-blink' : wrong === group ? 'gk-shake' : ''}
                    onAnimationEnd={() => setWrong((value) => (value === group ? null : value))}
                  />
                )
              })}
            </svg>
            {TRAY_ORDER.map((group) => {
              const bed = TRAY_BEDS[group]
              const species = planted[group]
              const groupCopy = PLANT_GROUPS.find((item) => item.id === group)
              return (
                <span
                  key={group}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${bed.cx}%`, top: `${bed.cy - 8}%` }}
                >
                  <span
                    className="flex items-center gap-1 border bg-[#04080f]/85 px-1.5 py-1 font-pixel text-[9px] leading-none whitespace-nowrap uppercase sm:text-[10px]"
                    style={{ borderColor: bed.color, color: species ? '#f4fff4' : bed.color }}
                  >
                    {species ? <Check className="size-3 text-life" strokeWidth={3} aria-hidden /> : null}
                    {species ? speciesLabel(species, locale) : t(groupCopy?.titleEn ?? group, groupCopy?.title ?? group)}
                  </span>
                  {fx?.group === group ? <Burst key={fx.key} color={bed.color} /> : null}
                </span>
              )
            })}
          </PlantTray>
        </div>
      </div>

      {full ? <GameCta onClick={onDone}>{t('Watch them grow (Challenge 4.4)', 'Acompanhar o crescimento (Desafio 4.4)')}</GameCta> : null}

      {drag ? (
        <img
          src={MEDIA.mission4.seeds[drag.payload.species]}
          alt=""
          className="gk-pixelated pointer-events-none fixed z-[80] size-16 -rotate-6 drop-shadow-[0_6px_0_rgba(0,0,0,0.45)]"
          style={{ left: drag.x - 32, top: drag.y - 40 }}
        />
      ) : null}
    </>
  )
}
