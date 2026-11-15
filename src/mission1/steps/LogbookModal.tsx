import { useState } from 'react'
import { LOGBOOK_ASPECTS, LOGBOOK_EVENT, MISSION1_META } from '../../data/mission1Data'
import { McButton } from '../../opening/McButton'

interface Props {
  siteLabel: string
  tilt: number
  stormChoice: 'save' | 'max' | null
  onDone: () => void
}

export function LogbookModal({ siteLabel, tilt, stormChoice, onDone }: Props) {
  const [stage, setStage] = useState<1 | 2 | 3>(1)
  const [eventOk, setEventOk] = useState(false)
  const [aspects, setAspects] = useState<string[]>([])
  const [photo, setPhoto] = useState(false)

  const toggleAspect = (a: string) => {
    setAspects((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-void-950/70 p-3">
      <div className="max-h-[min(90dvh,40rem)] w-full max-w-lg overflow-y-auto border-4 border-[#1a1c3a] bg-[#f4fff4] p-4 text-[#1a1c3a] shadow-[0_0_0_3px_#30346d]">
        <p className="font-pixel text-sm tracking-wide uppercase">Diário de Bordo — Missão 1</p>

        {stage === 1 && (
          <div className="mt-3 space-y-3">
            <p className="text-sm font-bold">1. Evento</p>
            <button
              type="button"
              className={`min-h-14 w-full border-2 px-3 py-2 text-left text-sm ${
                eventOk ? 'border-[#30346d] bg-[#30346d] text-[#f4fff4]' : 'border-[#30346d]/40'
              }`}
              onClick={() => setEventOk(true)}
            >
              {LOGBOOK_EVENT}
            </button>
            <McButton className="min-h-12 w-full font-pixel font-bold" disabled={!eventOk} onClick={() => setStage(2)}>
              Próximo
            </McButton>
          </div>
        )}

        {stage === 2 && (
          <div className="mt-3 space-y-3">
            <p className="text-sm font-bold">2. Aspecto observado</p>
            <p className="text-xs opacity-80">
              Local: {siteLabel} · Inclinação: {tilt}° · Tempestade:{' '}
              {stormChoice === 'save' ? 'economizou energia' : 'manteve potência'}
            </p>
            <div className="flex flex-wrap gap-2">
              {LOGBOOK_ASPECTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`min-h-12 px-3 text-left text-xs ${
                    aspects.includes(a) ? 'bg-[#30346d] text-[#f4fff4]' : 'border border-[#30346d]/50'
                  }`}
                  onClick={() => toggleAspect(a)}
                >
                  {a}
                </button>
              ))}
            </div>
            <McButton
              className="min-h-12 w-full font-pixel font-bold"
              disabled={aspects.length === 0}
              onClick={() => setStage(3)}
            >
              Próximo
            </McButton>
          </div>
        )}

        {stage === 3 && (
          <div className="mt-3 space-y-3">
            <p className="text-sm font-bold">3. Fotografia científica</p>
            <div className="relative overflow-hidden border-2 border-[#30346d] bg-gradient-to-b from-[#c47848] to-[#8a3d22] p-4">
              <div className="mx-auto h-16 w-28 border-2 border-cyan-hud bg-[#1a3a6e]" />
              {photo && (
                <p className="mt-2 font-mono text-[10px] text-[#f4fff4]">
                  NASA · {MISSION1_META.lat} {MISSION1_META.lon} · Sol {new Date().toISOString().slice(0, 10)}
                </p>
              )}
            </div>
            {!photo ? (
              <McButton className="min-h-12 w-full font-pixel font-bold" onClick={() => setPhoto(true)}>
                Capturar Foto Científica
              </McButton>
            ) : (
              <McButton className="min-h-12 w-full font-pixel font-bold" onClick={onDone}>
                Enviar ao diário
              </McButton>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
