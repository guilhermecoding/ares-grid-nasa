import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  baseEfficiency: number
  onDone: (choice: 'save' | 'max') => void
}

type Phase = 'warning' | 'choice'

/** Dust storm screen — rising dust + central warning with efficiency drop, then trade-off. */
export function StormTestChallenge({ baseEfficiency, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>('warning')
  const [dustOn, setDustOn] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [effDone, setEffDone] = useState(false)
  const [gen, setGen] = useState(4.2)
  const [battery, setBattery] = useState(78)
  const [consume, setConsume] = useState(2.1)
  const [chose, setChose] = useState(false)

  const stormEff = useMemo(
    () => Math.max(8, Math.round(baseEfficiency * 0.35)),
    [baseEfficiency],
  )

  const effMv = useMotionValue(baseEfficiency)
  const effDisplay = useTransform(effMv, (v) => Math.round(v))
  const [effLabel, setEffLabel] = useState(baseEfficiency)
  const barWidth = useTransform(effMv, [0, 100], ['0%', '100%'])

  useEffect(() => {
    const unsub = effDisplay.on('change', (v) => setEffLabel(v))
    return unsub
  }, [effDisplay])

  // Dust rises, then dialog opens and efficiency falls.
  useEffect(() => {
    soundEngine.storm()
    const dustId = window.setTimeout(() => setDustOn(true), 120)
    const dialogId = window.setTimeout(() => {
      setDialogOpen(true)
      soundEngine.fail()
    }, 700)
    return () => {
      clearTimeout(dustId)
      clearTimeout(dialogId)
    }
  }, [])

  useEffect(() => {
    if (!dialogOpen) return
    const controls = animate(effMv, stormEff, {
      duration: 1.6,
      ease: 'easeInOut',
      onComplete: () => setEffDone(true),
    })
    return () => controls.stop()
  }, [dialogOpen, effMv, stormEff])

  const dismissWarning = () => {
    setDialogOpen(false)
    setPhase('choice')
    setGen((g) => +(g * 0.35).toFixed(2))
  }

  const pick = (choice: 'save' | 'max') => {
    if (chose) return
    setChose(true)
    soundEngine.click()
    if (choice === 'save') {
      setConsume(1.1)
      setBattery((b) => Math.min(100, b + 4))
    } else {
      setConsume(2.4)
      setBattery((b) => Math.max(8, b - 18))
    }
    window.setTimeout(() => onDone(choice), 700)
  }

  const dustMotes = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: `${(i * 13 + 3) % 100}%`,
        delay: (i % 9) * 0.12,
        dur: 2.2 + (i % 5) * 0.35,
        size: 2 + (i % 4),
      })),
    [],
  )

  return (
    <div className="relative z-10 flex h-full min-h-0 flex-col gap-3 overflow-hidden p-3 sm:p-4">
      {/* Rising dust overlay */}
      <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden>
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-[#a06030]/55 via-[#c47848]/25 to-transparent"
          initial={{ opacity: 0, y: 80 }}
          animate={dustOn ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
        {dustOn &&
          dustMotes.map((m) => (
            <motion.span
              key={m.id}
              className="absolute rounded-full bg-[#e8c090]"
              style={{
                left: m.left,
                bottom: '-8%',
                width: m.size,
                height: m.size,
              }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: [0, -520, -780], opacity: [0, 0.75, 0] }}
              transition={{
                duration: m.dur,
                delay: m.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        <motion.div
          className="absolute inset-0 bg-[#8a4a28]/30 mix-blend-multiply"
          initial={{ opacity: 0 }}
          animate={dustOn ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.4 }}
        />
      </div>

      <div className="relative z-10">
        <p className="font-pixel text-sm text-cyan-hud sm:text-base">Desafio 1.3 — Tempestade de poeira</p>
        <p className="mt-1 text-xs text-void-300">
          Eficiência da instalação:{' '}
          <span className={phase === 'choice' ? 'text-danger' : 'text-energy'}>
            {phase === 'choice' ? stormEff : baseEfficiency}%
          </span>
        </p>
      </div>

      {phase === 'choice' && (
        <div className="relative z-10 grid gap-2 sm:grid-cols-3">
          <Meter label="Geração Solar (kW)" value={`${gen}`} fill={Math.min(100, (gen / 5) * 100)} color="#f0b429" />
          <Meter label="Bateria (%)" value={`${battery}`} fill={battery} color="#5ecf9a" />
          <Meter
            label="Consumo Habitat (kW)"
            value={`${consume}`}
            fill={Math.min(100, (consume / 3) * 100)}
            color="#7b8cff"
          />
        </div>
      )}

      {phase === 'choice' && !chose && (
        <div className="relative z-10 mt-auto grid gap-2 sm:grid-cols-2">
          <McButton className="min-h-14 font-pixel text-sm font-bold sm:text-base" onClick={() => pick('save')}>
            Reduzir luzes e aquecimento auxiliar
          </McButton>
          <McButton className="min-h-14 font-pixel text-sm font-bold sm:text-base" onClick={() => pick('max')}>
            Manter potência máxima (arriscar bateria)
          </McButton>
        </div>
      )}

      {/* Central storm warning dialog */}
      {dialogOpen && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-void-950/75 p-4"
          role="alertdialog"
          aria-labelledby="storm-warn-title"
          aria-describedby="storm-warn-body"
        >
          <motion.div
            className="w-full max-w-md border-2 border-danger bg-[#0a1628] p-5 text-center shadow-[0_0_28px_rgba(255,107,138,0.35)]"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            <p id="storm-warn-title" className="font-pixel text-xs tracking-widest text-danger uppercase">
              Alerta ambiental
            </p>

            {/* Efficiency drop animation */}
            <div className="mt-4 rounded-md border border-danger/40 bg-void-950/80 px-4 py-3">
              <p className="font-pixel text-[10px] text-void-300 uppercase">Eficiência do painel</p>
              <p className="mt-1 font-pixel text-3xl tabular-nums text-danger sm:text-4xl">
                {effLabel}
                <span className="text-lg text-void-300">%</span>
              </p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-void-950">
                <motion.div
                  className="h-full rounded-full bg-danger"
                  style={{ width: barWidth }}
                />
              </div>
              <p className="mt-2 font-pixel text-[10px] text-void-300">
                {baseEfficiency}% → {stormEff}%
              </p>
            </div>

            <p id="storm-warn-body" className="mt-4 font-pixel text-[11px] leading-snug text-[#f4fff4] sm:text-sm">
              Está chegando uma <span className="text-danger">tempestade de poeira</span>!
            </p>
            <p className="mt-2 font-pixel text-[10px] leading-snug text-void-200 sm:text-xs">
              A poeira cobre o painel solar e reduz a eficiência da geração de energia.
            </p>

            <McButton
              className="mt-5 min-h-12 w-full font-pixel text-lg font-bold disabled:opacity-40"
              disabled={!effDone}
              onClick={dismissWarning}
            >
              Entendi
            </McButton>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function Meter({
  label,
  value,
  fill,
  color,
}: {
  label: string
  value: string
  fill: number
  color: string
}) {
  return (
    <div className="rounded border border-cyan-hud/35 bg-[#0a1628]/9 p-3">
      <p className="font-pixel text-[10px] text-void-300">{label}</p>
      <p className="mt-1 font-pixel text-xl text-[#f4fff4]">{value}</p>
      <div className="mt-2 h-3 overflow-hidden rounded bg-void-950">
        <div className="h-full transition-all duration-500" style={{ width: `${fill}%`, background: color }} />
      </div>
    </div>
  )
}
