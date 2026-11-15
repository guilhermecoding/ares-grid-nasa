import { useState, type ReactNode } from 'react'
import {
  BACKPACK_STYLES,
  CAPI_CONFIRM_TEMPLATE,
  HELMET_STYLES,
  INSIGNIAS,
  NAME_SUGGESTIONS,
  SUIT_COLORS,
  type AstronautProfile,
  type BackpackId,
  type HelmetId,
  type InsigniaId,
  type SuitColorId,
} from '../data/openingData'
import { MEDIA } from '../constants/mediaAssets'
import { CapiDialog } from './CapiDialog'
import { LaunchSpaceCanvas } from './LaunchSpaceCanvas'
import { McButton } from './McButton'

interface AstronautCustomizerProps {
  initial?: Partial<AstronautProfile>
  onConfirm: (profile: AstronautProfile) => void
}

function HudCorners() {
  const c = 'pointer-events-none absolute h-3 w-3 border-cyan-hud sm:h-3.5 sm:w-3.5'
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className={`${c} top-0 left-0 border-t-[3px] border-l-[3px]`} />
      <div className={`${c} top-0 right-0 border-t-[3px] border-r-[3px]`} />
      <div className={`${c} bottom-0 left-0 border-b-[3px] border-l-[3px]`} />
      <div className={`${c} right-0 bottom-0 border-r-[3px] border-b-[3px]`} />
    </div>
  )
}

function AstronautPreview({ profile, compact }: { profile: AstronautProfile; compact?: boolean }) {
  const suit = SUIT_COLORS.find((c) => c.id === profile.suitColor)?.hex ?? '#f2f4f8'
  const visor =
    profile.helmet === 'visor-gold' ? '#d4a017' : profile.helmet === 'visor-cyan' ? '#5ee7ff' : '#7ec8ff'
  const packW = profile.backpack === 'compact' ? 28 : profile.backpack === 'research' ? 40 : 34
  const insigniaFill =
    profile.insignia === 'star' ? '#f0b429' : profile.insignia === 'mars' ? '#e67a2e' : '#4ea1ff'

  return (
    <svg
      viewBox="0 0 120 160"
      className={compact ? 'h-[min(28vh,9.5rem)] w-auto' : 'h-[min(42vh,14rem)] w-auto max-w-[9rem] sm:max-w-[11rem]'}
      aria-hidden
    >
      <rect x={(120 - packW) / 2 + 22} y={58} width={packW} height={42} rx={6} fill="#2a2550" stroke="#5ee7ff" strokeWidth={2} />
      <rect x={38} y={55} width={44} height={58} rx={10} fill={suit} stroke="#1a1738" strokeWidth={2} />
      {profile.insignia === 'star' ? (
        <polygon points="60,70 63,78 72,78 65,83 68,92 60,86 52,92 55,83 48,78 57,78" fill={insigniaFill} />
      ) : profile.insignia === 'mars' ? (
        <circle cx={60} cy={78} r={8} fill={insigniaFill} stroke="#8a3d22" strokeWidth={1.5} />
      ) : (
        <text x={60} y={82} textAnchor="middle" fontSize={10} fill={insigniaFill} fontFamily="sans-serif" fontWeight="bold">
          A
        </text>
      )}
      <rect x={22} y={60} width={16} height={36} rx={6} fill={suit} stroke="#1a1738" strokeWidth={2} />
      <rect x={82} y={60} width={16} height={36} rx={6} fill={suit} stroke="#1a1738" strokeWidth={2} />
      <rect x={40} y={112} width={16} height={32} rx={5} fill={suit} stroke="#1a1738" strokeWidth={2} />
      <rect x={64} y={112} width={16} height={32} rx={5} fill={suit} stroke="#1a1738" strokeWidth={2} />
      <circle cx={60} cy={36} r={22} fill="#e8e6ff" stroke="#3d3670" strokeWidth={3} />
      <ellipse cx={60} cy={38} rx={14} ry={12} fill={visor} opacity={0.85} />
      <ellipse cx={54} cy={34} rx={4} ry={3} fill="#fff" opacity={0.5} />
    </svg>
  )
}

function SlotLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1 font-pixel text-[9px] tracking-[0.18em] text-cyan-hud/75 uppercase sm:text-[10px]">{children}</p>
  )
}

function SelectChip({
  active,
  label,
  onClick,
  dense,
}: {
  active: boolean
  label: string
  onClick: () => void
  dense?: boolean
}) {
  return (
    <button
      type="button"
      className={`font-pixel transition-[box-shadow,background-color,color] ${
        dense ? 'min-h-9 px-2.5 text-[11px] sm:min-h-10 sm:px-3 sm:text-xs' : 'min-h-10 px-3 text-xs sm:min-h-11'
      } ${
        active
          ? 'bg-cyan-hud text-void-950 shadow-[0_0_12px_rgba(94,231,255,0.45)]'
          : 'border border-cyan-hud/35 bg-[#0a1628]/90 text-void-100 hover:border-cyan-hud/70'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export function AstronautCustomizer({ initial, onConfirm }: AstronautCustomizerProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [suitColor, setSuitColor] = useState<SuitColorId>(initial?.suitColor ?? 'nasa-white')
  const [helmet, setHelmet] = useState<HelmetId>(initial?.helmet ?? 'classic')
  const [backpack, setBackpack] = useState<BackpackId>(initial?.backpack ?? 'standard')
  const [insignia, setInsignia] = useState<InsigniaId>(initial?.insignia ?? 'ares')
  const [confirmed, setConfirmed] = useState(false)

  const profile: AstronautProfile = {
    name: name.trim() || 'Astronauta',
    suitColor,
    helmet,
    backpack,
    insignia,
  }

  const confirmLine = CAPI_CONFIRM_TEMPLATE.replace('{name}', profile.name)

  if (confirmed) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <LaunchSpaceCanvas warp={0.35} hologramActive paused />
        <CapiDialog
          dialogId="opening-astronaut"
          lines={[confirmLine]}
          confirmMode
          characterSrc={MEDIA.capi.excited2}
          onComplete={() => onConfirm(profile)}
        />
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ touchAction: 'manipulation' }}>
      <LaunchSpaceCanvas warp={0.25} hologramActive />

      <div className="relative z-10 flex h-full w-full flex-col p-2 sm:p-3 md:p-4">
        {/* Title bar */}
        <header className="mb-2 flex shrink-0 items-end justify-between gap-2 border-b border-cyan-hud/30 pb-2 sm:mb-3">
          <div>
            <p className="font-pixel text-[9px] tracking-[0.22em] text-cyan-hud/70 uppercase sm:text-[10px]">SYS // LOADOUT</p>
            <h2 className="font-pixel text-lg leading-none text-void-100 sm:text-2xl md:text-3xl">Monte seu astronauta</h2>
          </div>
          <p className="hidden font-pixel text-[10px] text-void-300 sm:block">SLOT 01</p>
        </header>

        {/* Main board: no page scroll — fits viewport */}
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_1fr] gap-2 sm:gap-3 landscape:grid-cols-[minmax(9rem,16rem)_1fr] landscape:grid-rows-1 landscape:items-stretch md:grid-cols-[minmax(10rem,17rem)_1fr] md:grid-rows-1 md:items-stretch">
          {/* Preview chamber */}
          <section className="relative flex shrink-0 flex-col items-center justify-center bg-[#0a1628]/85 px-2 py-2 sm:py-3 landscape:h-full md:h-full">
            <HudCorners />
            <div className="pointer-events-none absolute inset-1 border border-cyan-hud/25" aria-hidden />
            <p className="mb-1 font-pixel text-[9px] tracking-widest text-cyan-hud/60 uppercase">Preview</p>
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 m-auto h-24 w-24 rounded-full bg-cyan-hud/10 blur-2xl sm:h-32 sm:w-32" aria-hidden />
              <AstronautPreview profile={profile} compact />
            </div>
            <p className="mt-1 max-w-full truncate font-pixel text-sm text-cyan-hud sm:text-base">{profile.name}</p>
            <div className="mt-1 flex gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SUIT_COLORS.find((c) => c.id === suitColor)?.hex }} />
              <span className="font-pixel text-[9px] text-void-300 uppercase">
                {HELMET_STYLES.find((h) => h.id === helmet)?.label}
              </span>
            </div>
          </section>

          {/* Loadout controls */}
          <section className="relative flex min-h-0 flex-col bg-[#30346d]/92 p-[3px]">
            <div className="flex min-h-0 flex-1 flex-col border-2 border-[#f4fff4] bg-[#30346d] p-2 sm:p-3">
              <HudCorners />

              <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-2 sm:gap-2.5 md:grid-cols-2 md:gap-x-4 md:gap-y-2">
                {/* Name — full width */}
                <div className="md:col-span-2">
                  <SlotLabel>Callsign</SlotLabel>
                  <input
                    type="text"
                    value={name}
                    maxLength={16}
                    placeholder="Digite seu nome"
                    className="min-h-10 w-full border-2 border-[#f4fff4]/35 bg-[#1a1c3a] px-3 font-pixel text-sm text-[#f4fff4] placeholder:text-[#f4fff4]/40 focus:border-cyan-hud focus:outline-none sm:min-h-11"
                    onChange={(e) => setName(e.target.value)}
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {NAME_SUGGESTIONS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`min-h-8 px-2 font-pixel text-[10px] sm:min-h-9 sm:text-[11px] ${
                          name === n
                            ? 'bg-[#f4fff4] text-[#30346d]'
                            : 'border border-[#f4fff4]/30 text-[#f4fff4]/85 hover:border-[#f4fff4]/70'
                        }`}
                        onClick={() => setName(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <SlotLabel>Traje</SlotLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {SUIT_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        title={c.label}
                        aria-label={c.label}
                        className={`h-9 w-9 border-2 sm:h-10 sm:w-10 ${
                          suitColor === c.id
                            ? 'border-cyan-hud shadow-[0_0_10px_rgba(94,231,255,0.55)]'
                            : 'border-[#f4fff4]/25'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        onClick={() => setSuitColor(c.id)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <SlotLabel>Insígnia</SlotLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {INSIGNIAS.map((i) => (
                      <SelectChip
                        key={i.id}
                        dense
                        active={insignia === i.id}
                        label={i.label}
                        onClick={() => setInsignia(i.id)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <SlotLabel>Visor</SlotLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {HELMET_STYLES.map((h) => (
                      <SelectChip
                        key={h.id}
                        dense
                        active={helmet === h.id}
                        label={h.label}
                        onClick={() => setHelmet(h.id)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <SlotLabel>Mochila</SlotLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {BACKPACK_STYLES.map((b) => (
                      <SelectChip
                        key={b.id}
                        dense
                        active={backpack === b.id}
                        label={b.label}
                        onClick={() => setBackpack(b.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-2 shrink-0 border-t border-[#f4fff4]/20 pt-2 sm:mt-3 sm:pt-3">
                <McButton
                  className="min-h-11 w-full px-4 font-pixel text-base font-bold sm:min-h-12 sm:text-lg"
                  onClick={() => setConfirmed(true)}
                >
                  Confirmar Astronauta
                </McButton>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
