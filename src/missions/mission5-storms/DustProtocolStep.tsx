import { useEffect, useRef, useState } from 'react'
import { BatteryCharging, Check, ChevronsRight, Lock, LockOpen, Wind } from 'lucide-react'
import { Burst, ChallengeBar, GameCta, Tag } from '../../components/missionKit/kit'
import { MEDIA } from '../../constants/mediaAssets'
import { DUST_LATCHES, type DustLatchId } from '../../data/mission5Data'
import { useI18n } from '../../i18n/locale'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  sealed: readonly DustLatchId[]
  onSeal: (id: DustLatchId) => void
  onHeld: () => void
}

const HANDLE_PX = 52
const LOCK_AT = 0.85

export function DustProtocolStep({ sealed, onSeal, onHeld }: Props) {
  const { t, locale } = useI18n()
  const [elapsed, setElapsed] = useState(0)
  const count = DUST_LATCHES.filter((latch) => sealed.includes(latch.id)).length
  const all = count === DUST_LATCHES.length
  const next = DUST_LATCHES.find((latch) => !sealed.includes(latch.id))?.id

  useEffect(() => {
    if (all) return
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(id)
  }, [all])

  return (
    <>
      <ChallengeBar
        code="5.1"
        title={t('Dust storm protocol', 'Protocolo de tempestade de poeira')}
        icon={<Wind className="size-5" aria-hidden />}
        counterLabel={t('Latches', 'Travas')}
        value={count}
        total={DUST_LATCHES.length}
        hint={t(
          'Follow the protocol order. Drag each latch to the end of the rail to seal the habitat.',
          'Siga a ordem do protocolo. Arraste cada trava até o fim do trilho para vedar o habitat.',
        )}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Habitat window: one shutter closes for each latch */}
        <div className={`relative aspect-[16/10] overflow-hidden border-4 bg-black transition-colors duration-500 ${all ? 'border-life' : 'border-[#8a4a1c]'}`}>
          <img src={MEDIA.mission5.stormWindow} alt={t('Dust storm seen through the window', 'Tempestade de poeira vista pela janela')} className="gk-pixelated h-full w-full scale-110 object-cover" draggable={false} />
          {!all ? (
            <>
              <div className="gk-dust absolute inset-0" />
              <div className="gk-dust gk-dust-slow absolute inset-0 scale-y-150" />
            </>
          ) : null}
          {DUST_LATCHES.map((latch, index) => (
            <div
              key={latch.id}
              className="absolute inset-x-0 h-1/4 origin-top border-b-4 border-[#1b2233] bg-[linear-gradient(180deg,#7b879c,#566176_55%,#3a4356)] transition-transform duration-500 ease-out"
              style={{ top: `${index * 25}%`, transform: index < count ? 'scaleY(1)' : 'scaleY(0)' }}
              aria-hidden
            >
              <span className="absolute top-1/2 left-3 size-2 -translate-y-1/2 rounded-full bg-[#1b2233]" />
              <span className="absolute top-1/2 right-3 size-2 -translate-y-1/2 rounded-full bg-[#1b2233]" />
            </div>
          ))}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_10px_#2a3142,inset_0_0_0_14px_#0c0f18]" />
          <Tag className="absolute top-5 left-5 z-10" tone={all ? 'accent' : 'energy'}>
            {all
              ? t('Habitat sealed', 'Habitat vedado')
              : t(`Habitat window · storm for ${elapsed}s`, `Janela do habitat · tempestade há ${elapsed}s`)}
          </Tag>
          <span
            className={`absolute top-5 right-5 z-10 size-4 rounded-full border-2 border-[#0c0f18] ${all ? 'bg-life shadow-[0_0_12px_#5ecf9a]' : 'gk-blink bg-danger shadow-[0_0_12px_#ff6b8a]'}`}
            aria-hidden
          />
          {all ? (
            <span className="gk-pop absolute inset-0 z-10 flex items-center justify-center">
              <span className="flex items-center gap-2 border-4 border-life bg-[#04130c]/90 px-4 py-2 font-pixel text-sm text-[#7dffb0] uppercase md:text-base">
                <Lock className="size-5" aria-hidden /> {t('Seal complete', 'Vedação completa')}
              </span>
            </span>
          ) : null}
        </div>

        <div className="grid content-start gap-2">
          {DUST_LATCHES.map((latch) => {
            const shut = sealed.includes(latch.id)
            const current = latch.id === next
            return (
              <div
                key={latch.id}
                className={`border-2 px-3 py-2 transition-opacity ${
                  shut ? 'border-life bg-[#0b2a1c]/90' : current ? 'border-energy bg-[#1c1608]/95' : 'border-[#3a2a22] bg-[#140b0c]/80 opacity-50'
                }`}
              >
                <p className={`font-pixel text-xs uppercase ${shut ? 'text-[#7dffb0]' : current ? 'text-energy' : 'text-[#f4fff4]/70'}`}>{latch.title[locale]}</p>
                <p className="text-sm leading-snug text-[#f4fff4]/80">{latch.detail[locale]}</p>
                <LatchSlider label={latch.title[locale]} sealed={shut} active={current} onSeal={() => onSeal(latch.id)} />
              </div>
            )
          })}
        </div>
      </div>

      {all ? (
        <>
          <div className="gk-panel gk-pop flex items-center gap-3 px-3 py-2.5">
            <BatteryCharging className="size-6 shrink-0 text-energy" aria-hidden />
            <p className="text-sm leading-snug text-[#f4fff4] md:text-base">
              {t(
                'The dust covered the panels and solar power dropped to 25%. The base battery keeps the habitat going.',
                'A poeira cobriu os painéis e a geração solar caiu para 25%. A bateria da base segura o habitat.',
              )}
            </p>
          </div>
          <GameCta onClick={onHeld}>{t('Wait for the wind to drop (Challenge 5.2)', 'Esperar o vento cair (Desafio 5.2)')}</GameCta>
        </>
      ) : null}
    </>
  )
}

/** Slide the handle to the end of the rail. It springs back when released early. */
function LatchSlider({ label, sealed, active, onSeal }: { label: string; sealed: boolean; active: boolean; onSeal: () => void }) {
  const { t } = useI18n()
  const trackRef = useRef<HTMLDivElement>(null)
  const grabRef = useRef(0)
  const notchRef = useRef(0)
  const [fraction, setFraction] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [justSealed, setJustSealed] = useState(false)
  const value = sealed ? 1 : fraction

  const fractionAt = (clientX: number) => {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left - grabRef.current) / Math.max(1, rect.width - HANDLE_PX)))
  }

  const seal = () => {
    soundEngine.latch()
    setJustSealed(true)
    onSeal()
  }

  const release = (clientX: number | null) => {
    if (!dragging) return
    setDragging(false)
    notchRef.current = 0
    if (clientX != null && fractionAt(clientX) >= LOCK_AT) {
      seal()
      return
    }
    setFraction(0)
  }

  return (
    <div
      ref={trackRef}
      className={`relative mt-2 h-[52px] overflow-hidden border-2 ${sealed ? 'border-life bg-life/15' : 'border-[#30346d] bg-[#04080f]'}`}
    >
      <div
        className={`absolute inset-y-0 left-0 ${sealed ? 'bg-life/35' : 'bg-energy/30'}`}
        style={{ width: `calc(${value} * (100% - ${HANDLE_PX}px) + ${HANDLE_PX / 2}px)`, transition: dragging ? 'none' : 'width 0.25s' }}
        aria-hidden
      />
      <span
        className={`pointer-events-none absolute inset-0 flex items-center justify-center gap-1 pl-12 font-pixel text-[10px] uppercase ${
          sealed ? 'text-[#7dffb0]' : active ? 'text-[#f4fff4]/80' : 'text-[#f4fff4]/40'
        }`}
        aria-hidden
      >
        {sealed ? (
          <>
            <Check className="size-4" strokeWidth={3} /> {t('Sealed', 'Vedada')}
          </>
        ) : active ? (
          <>
            {t('Drag to lock', 'Arraste para travar')} <ChevronsRight className="gk-blink size-4" />
          </>
        ) : (
          t('Wait for the previous latch', 'Aguarde a trava anterior')
        )}
      </span>
      <button
        type="button"
        disabled={sealed || !active}
        aria-label={sealed ? t(`${label}: sealed`, `${label}: vedada`) : t(`Drag the latch: ${label}`, `Arrastar a trava: ${label}`)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          grabRef.current = e.clientX - e.currentTarget.getBoundingClientRect().left
          soundEngine.pickup()
          setDragging(true)
        }}
        onPointerMove={(e) => {
          if (!dragging) return
          const nextFraction = fractionAt(e.clientX)
          const notch = Math.floor(nextFraction * 8)
          if (notch !== notchRef.current) {
            notchRef.current = notch
            soundEngine.ratchet()
          }
          setFraction(nextFraction)
        }}
        onPointerUp={(e) => release(e.clientX)}
        onPointerCancel={() => release(null)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
            e.preventDefault()
            seal()
          }
        }}
        className={`absolute inset-y-0 flex touch-none items-center justify-center border-2 border-[#04080f] select-none ${
          sealed ? 'bg-life text-[#04130c]' : active ? 'cursor-grab bg-energy text-[#1a1203] shadow-[0_0_14px_rgba(240,180,41,0.7)]' : 'bg-[#5b6190] text-[#04080f]'
        }`}
        style={{
          width: HANDLE_PX,
          left: `calc(${value} * (100% - ${HANDLE_PX}px))`,
          transition: dragging ? 'none' : 'left 0.25s',
          touchAction: 'none',
        }}
      >
        {sealed ? <Lock className="size-5" aria-hidden /> : <LockOpen className="size-5" aria-hidden />}
        {justSealed ? <Burst color="#5ecf9a" /> : null}
      </button>
    </div>
  )
}
