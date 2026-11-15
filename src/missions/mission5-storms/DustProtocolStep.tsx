import { useEffect, useState } from 'react'
import { MEDIA } from '../../constants/mediaAssets'
import { DUST_LATCHES, type DustLatchId } from '../../data/mission5Data'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'

interface Props {
  sealed: readonly DustLatchId[]
  onSeal: (id: DustLatchId) => void
  onHeld: () => void
}

export function DustProtocolStep({ sealed, onSeal, onHeld }: Props) {
  const [drag, setDrag] = useState<{ id: DustLatchId; x: number; y: number } | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const all = DUST_LATCHES.every((latch) => sealed.includes(latch.id))

  useEffect(() => {
    if (all) return
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(id)
  }, [all])

  useEffect(() => {
    if (!drag) return
    const id = drag.id
    const move = (e: PointerEvent) => setDrag({ id, x: e.clientX, y: e.clientY })
    const up = (e: PointerEvent) => {
      setDrag(null)
      const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-seal]')
      if (hit?.getAttribute('data-seal') !== id) {
        soundEngine.fail()
        return
      }
      soundEngine.success()
      onSeal(id)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag?.id])

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="font-pixel text-xs text-energy">Tempestade regional · {elapsed}s de poeira na janela</p>
      <div className="mt-3 grid gap-3">
        {DUST_LATCHES.map((latch) => {
          const shut = sealed.includes(latch.id)
          return (
            <div key={latch.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-4 border-[#30346d] bg-[#0a1628]/85 p-2">
              <button
                type="button"
                disabled={shut}
                onPointerDown={(e) => {
                  if (shut) return
                  setDrag({ id: latch.id, x: e.clientX, y: e.clientY })
                }}
                className="flex min-h-12 min-w-12 touch-none items-center justify-center border-4 border-energy select-none"
                style={{ touchAction: 'none' }}
                aria-label={latch.title}
              >
                <img src={MEDIA.mission5.hatch} alt="" className="h-8 w-8" draggable={false} />
              </button>
              <div>
                <p className="font-pixel text-xs text-[#f4fff4]">{latch.title}</p>
                <p className="text-sm text-[#f4fff4]/80">{latch.detail}</p>
              </div>
              <div
                data-seal={latch.id}
                className={`flex min-h-12 min-w-16 items-center justify-center border-4 border-dashed px-2 font-pixel text-[10px] ${
                  shut ? 'border-life text-[#7dffb0]' : 'border-cyan-hud text-[#f4fff4]'
                }`}
              >
                {shut ? 'VEDADA' : 'VEDAR'}
              </div>
            </div>
          )
        })}
      </div>
      {all ? (
        <div className="mt-4 border-4 border-life bg-[#0a1628]/90 p-3">
          <p className="text-sm text-[#f4fff4]">A geração solar caiu para 25%. A bateria da base segura o habitat.</p>
          <McButton className="mt-3" onClick={onHeld}>
            Esperar o vento cair
          </McButton>
        </div>
      ) : null}
      {drag ? (
        <img
          src={MEDIA.mission5.hatch}
          alt=""
          className="pointer-events-none fixed z-[80] h-12 w-12"
          style={{ left: drag.x - 24, top: drag.y - 24 }}
        />
      ) : null}
    </div>
  )
}
