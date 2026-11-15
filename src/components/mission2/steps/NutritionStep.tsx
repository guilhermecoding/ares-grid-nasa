import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { ScrollHintArea } from '../../ScrollHintArea'
import { MEDIA } from '../../../constants/mediaAssets'
import {
  ACTIVITY_ENERGY_KCAL,
  MISSION2_META,
  CAPI_MEAL_LINES,
  FOOD_GROUPS,
  FOOD_ITEMS,
  MEAL_GROUP_ORDER,
  MEAL_KCAL_MAX,
  MEAL_KCAL_MIN,
  MEAL_KCAL_SCALE,
  WATER_DISPENSER,
  foodById,
  mealKcal,
  mealVerdict,
  type FoodGroupId,
  type FoodItem,
} from '../../../data/mission2Data'
import { McButton } from '../../../opening/McButton'
import { PixelDialogBox } from '../../../opening/PixelDialogBox'
import { soundEngine } from '../../../services/soundEngine'
import { SciTermM2 } from '../SciTermM2'

interface Props {
  onConfirm: (foods: string[], waterMl: number) => void
}

type TrayPicks = Partial<Record<FoodGroupId, string>>

const BAR_TONE = {
  low: 'bg-danger',
  balanced: 'bg-life',
  high: 'bg-[#f97316]',
} as const

function placeFood(picks: TrayPicks, id: string): TrayPicks {
  const item = foodById(id)
  if (!item) return picks
  if (picks[item.group] === id) {
    const next = { ...picks }
    delete next[item.group]
    return next
  }
  return { ...picks, [item.group]: id }
}

function FoodCard({
  item,
  placed,
  onPlace,
}: {
  item: FoodItem
  placed: boolean
  onPlace: (id: string) => void
}) {
  const dragRef = useRef({ x: 0, y: 0, moved: false })

  return (
    <button
      type="button"
      draggable
      data-food-id={item.id}
      aria-pressed={placed}
      aria-label={`${item.label}, ${item.kcal} kcal, ${item.intensity}`}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', item.id)
        event.dataTransfer.effectAllowed = 'move'
      }}
      onPointerDown={(event) => {
        dragRef.current = { x: event.clientX, y: event.clientY, moved: false }
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current
        if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 12) drag.moved = true
      }}
      onPointerUp={(event) => {
        if (event.pointerType === 'mouse' || !dragRef.current.moved) return
        const hit = document.elementFromPoint(event.clientX, event.clientY)
        if (hit?.closest('[data-meal-tray]')) onPlace(item.id)
      }}
      onClick={() => {
        if (dragRef.current.moved) return
        onPlace(item.id)
      }}
      className={`flex min-h-12 w-full items-center gap-2 border-2 px-2 py-2 text-left ${
        placed ? 'border-life bg-life/15' : 'border-cyan-hud/30 bg-[#0a1628]/92'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-pixel text-[11px] leading-tight text-[#f4fff4] sm:text-xs">{item.label}</span>
        <span className="mt-0.5 block text-[11px] text-void-200">{item.intensity}</span>
      </span>
      <span className="shrink-0 bg-energy px-1.5 py-1 font-pixel text-[10px] text-void-950 sm:text-xs">
        {item.kcal} kcal
      </span>
    </button>
  )
}

function TraySlot({ group, foodId }: { group: FoodGroupId; foodId?: string }) {
  const food = foodId ? foodById(foodId) : undefined
  const meta = FOOD_GROUPS[group]
  return (
    <div className="flex min-h-12 flex-1 flex-col justify-center border border-cyan-hud/25 bg-[#061018]/80 px-2 py-1.5">
      <p className="font-pixel text-[9px] text-cyan-hud">{meta.label}</p>
      {food ? (
        <p className="text-xs text-[#f4fff4]">
          {food.label} · {food.kcal} kcal
        </p>
      ) : (
        <p className="text-xs text-void-300">Vazio</p>
      )}
    </div>
  )
}

/** Desafio 2.2 — mount one food from each group and match the day's energy spend. */
export function NutritionStep({ onConfirm }: Props) {
  const [picks, setPicks] = useState<TrayPicks>({})
  const [waterMl, setWaterMl] = useState<number>(WATER_DISPENSER.defaultMl)
  const [closedSig, setClosedSig] = useState<string | null>(null)
  const [readySig, setReadySig] = useState<string | null>(null)

  const pickedIds = MEAL_GROUP_ORDER.flatMap((group) => {
    const id = picks[group]
    return id ? [id] : []
  })
  const kcal = mealKcal(pickedIds)
  const filled = pickedIds.length === MEAL_GROUP_ORDER.length
  const verdict = filled ? mealVerdict(kcal) : null
  const signature = MEAL_GROUP_ORDER.map((group) => picks[group] ?? '').join('|')
  const showCapi = verdict !== null && closedSig !== signature
  const capiReady = readySig === signature
  const canConfirm = verdict === 'balanced'
  const fillPct = Math.min(100, (kcal / MEAL_KCAL_SCALE) * 100)
  const bandLeft = (MEAL_KCAL_MIN / MEAL_KCAL_SCALE) * 100
  const bandWidth = ((MEAL_KCAL_MAX - MEAL_KCAL_MIN) / MEAL_KCAL_SCALE) * 100

  const onPlace = (id: string) => {
    setPicks((prev) => placeFood(prev, id))
    soundEngine.click()
  }

  const confirm = () => {
    if (!canConfirm) return
    soundEngine.harvest()
    onConfirm(pickedIds, waterMl)
  }

  return (
    <div
      className={`absolute inset-0 flex min-h-0 flex-col ${showCapi ? 'z-[60]' : 'z-20'}`}
      style={{ touchAction: 'manipulation' }}
    >
      <ScrollHintArea
        variant="dark"
        frameClassName="h-full min-h-0 flex-1"
        className="flex h-full flex-col gap-3 px-3 pt-16 pb-4 sm:px-4 md:px-6"
      >
        <div className="mx-auto w-full max-w-6xl">
          <p className="font-pixel text-[10px] text-cyan-hud md:text-xs">
            {MISSION2_META.solLabel} · {MISSION2_META.location}
          </p>
          <p className="mt-1 font-pixel text-sm text-[#f4fff4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] md:text-base">
            Desafio 2.2 — Nutrição e Hidratação
          </p>
          <p className="mt-1 text-sm text-void-100/90">
            Arraste ou toque um alimento de cada grupo. A <SciTermM2 term="Hidratação" /> fica no dispensador.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="border-2 border-cyan-hud/30 bg-[#0a1628]/92 px-3 py-2">
              <p className="font-pixel text-[10px] text-cyan-hud">Gasto energético da atividade</p>
              <p className="font-pixel text-lg text-energy">~{ACTIVITY_ENERGY_KCAL} kcal</p>
            </div>
            <div className="border-2 border-cyan-hud/30 bg-[#0a1628]/92 px-3 py-2">
              <p className="font-pixel text-[10px] text-cyan-hud">Meta de reposição da refeição</p>
              <p className="font-pixel text-lg text-[#f4fff4]">
                {MEAL_KCAL_MIN} kcal a {MEAL_KCAL_MAX} kcal
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-6xl gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
          <div className="grid gap-3 md:grid-cols-3">
            {MEAL_GROUP_ORDER.map((group) => (
              <section key={group} className="flex flex-col gap-2">
                <h2 className="font-pixel text-xs text-cyan-hud md:text-sm">
                  {FOOD_GROUPS[group].label}
                  <span className="mt-0.5 block text-[10px] font-normal text-void-200">{FOOD_GROUPS[group].hint}</span>
                </h2>
                {FOOD_ITEMS.filter((item) => item.group === group).map((item) => (
                  <FoodCard key={item.id} item={item} placed={picks[group] === item.id} onPlace={onPlace} />
                ))}
              </section>
            ))}
          </div>

          <section
            data-meal-tray
            aria-label="Bandeja do astronauta"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              const id = event.dataTransfer.getData('text/plain')
              if (id) onPlace(id)
            }}
            className="flex flex-col gap-3 border-2 border-energy/50 bg-[#0a1628]/92 p-3"
          >
            <h2 className="font-pixel text-sm text-energy">BANDEJA DO ASTRONAUTA</h2>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              {MEAL_GROUP_ORDER.map((group) => (
                <TraySlot key={group} group={group} foodId={picks[group]} />
              ))}
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-pixel text-sm text-[#f4fff4]">Total: {kcal} kcal</p>
                <p className="text-xs text-void-200">
                  meta {MEAL_KCAL_MIN}–{MEAL_KCAL_MAX}
                </p>
              </div>
              <div className="relative mt-2 h-4 overflow-hidden bg-void-950">
                <div
                  className="absolute inset-y-0 bg-life/25"
                  style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
                />
                <motion.div
                  className={`absolute inset-y-0 left-0 ${verdict ? BAR_TONE[verdict] : 'bg-cyan-hud/50'}`}
                  animate={{ width: `${fillPct}%` }}
                  transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                />
              </div>
            </div>

            <label className="block text-sm text-[#f4fff4]">
              Dispensador de água · {waterMl} ml
              <input
                type="range"
                min={WATER_DISPENSER.minMl}
                max={WATER_DISPENSER.maxMl}
                step={WATER_DISPENSER.stepMl}
                value={waterMl}
                aria-label="Dispensador de água"
                onChange={(event) => setWaterMl(Number(event.target.value))}
                className="mt-1 h-10 w-full accent-cyan-hud"
              />
              <span className="mt-0.5 block text-xs text-void-200">
                {WATER_DISPENSER.minMl}–{WATER_DISPENSER.maxMl} ml
              </span>
            </label>

            <McButton
              className="min-h-12 w-full font-pixel text-base font-bold disabled:opacity-40"
              disabled={!canConfirm}
              onClick={confirm}
            >
              Confirmar refeição
            </McButton>
          </section>
        </div>
      </ScrollHintArea>

      <PixelDialogBox
        open={showCapi}
        position="center"
        title="Capi"
        lines={verdict ? [...CAPI_MEAL_LINES[verdict]] : []}
        characterSrc={verdict === 'balanced' ? MEDIA.capi.excited2 : MEDIA.capi.duvida}
        characterAlt="Capi"
        onTypingComplete={() => setReadySig(signature)}
        footer={
          verdict === 'balanced' ? (
            capiReady ? (
              <McButton className="mc-btn-green min-h-12 px-4 font-pixel" onClick={confirm}>
                Confirmar refeição
              </McButton>
            ) : null
          ) : (
            <McButton className="min-h-12 px-4 font-pixel" onClick={() => setClosedSig(signature)}>
              Fechar
            </McButton>
          )
        }
      />
    </div>
  )
}
