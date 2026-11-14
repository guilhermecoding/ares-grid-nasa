import { useMemo, useState, type ReactNode } from 'react'
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
import { CapiDialog } from './CapiDialog'
import { LaunchSpaceCanvas } from './LaunchSpaceCanvas'

interface AstronautCustomizerProps {
  initial?: Partial<AstronautProfile>
  onConfirm: (profile: AstronautProfile) => void
}

function AstronautPreview({ profile }: { profile: AstronautProfile }) {
  const suit = SUIT_COLORS.find((c) => c.id === profile.suitColor)?.hex ?? '#f2f4f8'
  const visor =
    profile.helmet === 'visor-gold' ? '#d4a017' : profile.helmet === 'visor-cyan' ? '#5ee7ff' : '#7ec8ff'
  const packW = profile.backpack === 'compact' ? 28 : profile.backpack === 'research' ? 40 : 34
  const insigniaFill =
    profile.insignia === 'star' ? '#f0b429' : profile.insignia === 'mars' ? '#e67a2e' : '#4ea1ff'

  return (
    <svg viewBox="0 0 120 160" className="h-44 w-36 drop-shadow-lg sm:h-56 sm:w-44" aria-hidden>
      {/* backpack */}
      <rect x={(120 - packW) / 2 + 22} y={58} width={packW} height={42} rx={6} fill="#2a2550" stroke="#5b4fcf" strokeWidth={2} />
      {/* body */}
      <rect x={38} y={55} width={44} height={58} rx={10} fill={suit} stroke="#1a1738" strokeWidth={2} />
      {/* insignia */}
      {profile.insignia === 'star' ? (
        <polygon points="60,70 63,78 72,78 65,83 68,92 60,86 52,92 55,83 48,78 57,78" fill={insigniaFill} />
      ) : profile.insignia === 'mars' ? (
        <circle cx={60} cy={78} r={8} fill={insigniaFill} stroke="#8a3d22" strokeWidth={1.5} />
      ) : (
        <text x={60} y={82} textAnchor="middle" fontSize={10} fill={insigniaFill} fontFamily="sans-serif" fontWeight="bold">
          A
        </text>
      )}
      {/* arms */}
      <rect x={22} y={60} width={16} height={36} rx={6} fill={suit} stroke="#1a1738" strokeWidth={2} />
      <rect x={82} y={60} width={16} height={36} rx={6} fill={suit} stroke="#1a1738" strokeWidth={2} />
      {/* legs */}
      <rect x={40} y={112} width={16} height={32} rx={5} fill={suit} stroke="#1a1738" strokeWidth={2} />
      <rect x={64} y={112} width={16} height={32} rx={5} fill={suit} stroke="#1a1738" strokeWidth={2} />
      {/* helmet */}
      <circle cx={60} cy={36} r={22} fill="#e8e6ff" stroke="#3d3670" strokeWidth={3} />
      <ellipse cx={60} cy={38} rx={14} ry={12} fill={visor} opacity={0.85} />
      <ellipse cx={54} cy={34} rx={4} ry={3} fill="#fff" opacity={0.5} />
    </svg>
  )
}

export function AstronautCustomizer({ initial, onConfirm }: AstronautCustomizerProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [suitColor, setSuitColor] = useState<SuitColorId>(initial?.suitColor ?? 'nasa-white')
  const [helmet, setHelmet] = useState<HelmetId>(initial?.helmet ?? 'classic')
  const [backpack, setBackpack] = useState<BackpackId>(initial?.backpack ?? 'standard')
  const [insignia, setInsignia] = useState<InsigniaId>(initial?.insignia ?? 'ares')
  const [confirmed, setConfirmed] = useState(false)

  const profile: AstronautProfile = useMemo(
    () => ({
      name: name.trim() || 'Astronauta',
      suitColor,
      helmet,
      backpack,
      insignia,
    }),
    [name, suitColor, helmet, backpack, insignia],
  )

  const confirmLine = CAPI_CONFIRM_TEMPLATE.replace('{name}', profile.name)

  if (confirmed) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <LaunchSpaceCanvas warp={0.35} hologramActive />
        <CapiDialog lines={[confirmLine]} confirmMode onComplete={() => onConfirm(profile)} />
      </div>
    )
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={{ touchAction: 'manipulation' }}>
      <LaunchSpaceCanvas warp={0.25} hologramActive />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-5">
        <h2 className="font-pixel text-center text-2xl text-void-100">Monte seu astronauta</h2>

        <div className="flex flex-col items-center gap-3 landscape:flex-row landscape:items-start landscape:justify-center">
          <div className="flex flex-col items-center rounded-2xl border border-cyan-hud/30 bg-void-900/70 p-3">
            <AstronautPreview profile={profile} />
            <p className="mt-1 font-pixel text-cyan-hud">{profile.name}</p>
          </div>

          <div className="w-full max-w-md space-y-3 rounded-2xl border border-panel-edge bg-void-900/80 p-3 backdrop-blur-sm">
            <label className="block">
              <span className="mb-1 block font-pixel text-xs text-void-300">Nome do Astronauta</span>
              <input
                type="text"
                value={name}
                maxLength={16}
                placeholder="Digite seu nome"
                className="min-h-12 w-full rounded-xl border-2 border-panel-edge bg-void-950 px-3 font-bold text-void-100 placeholder:text-void-500"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {NAME_SUGGESTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className="min-h-10 rounded-lg border border-void-500 bg-void-700 px-3 text-sm text-void-100"
                  onClick={() => setName(n)}
                >
                  {n}
                </button>
              ))}
            </div>

            <OptionRow label="Cor do Uniforme">
              {SUIT_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  title={c.label}
                  className={`min-h-12 min-w-12 rounded-xl border-2 ${suitColor === c.id ? 'border-star ring-2 ring-star' : 'border-void-500'}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setSuitColor(c.id)}
                  aria-label={c.label}
                />
              ))}
            </OptionRow>

            <OptionRow label="Capacete / Visor">
              {HELMET_STYLES.map((h) => (
                <Chip key={h.id} active={helmet === h.id} label={h.label} onClick={() => setHelmet(h.id)} />
              ))}
            </OptionRow>

            <OptionRow label="Mochila">
              {BACKPACK_STYLES.map((b) => (
                <Chip key={b.id} active={backpack === b.id} label={b.label} onClick={() => setBackpack(b.id)} />
              ))}
            </OptionRow>

            <OptionRow label="Insígnia">
              {INSIGNIAS.map((i) => (
                <Chip key={i.id} active={insignia === i.id} label={i.label} onClick={() => setInsignia(i.id)} />
              ))}
            </OptionRow>

            <button
              type="button"
              className="pixel-btn min-h-12 w-full rounded-xl bg-star font-pixel text-lg font-bold text-void-950"
              onClick={() => setConfirmed(true)}
            >
              Confirmar Astronauta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function OptionRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 font-pixel text-xs text-void-300">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`min-h-12 rounded-xl px-3 text-sm font-bold ${
        active ? 'bg-star text-void-950' : 'border border-void-500 bg-void-700 text-void-100'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
