import { MEDIA } from '../../constants/mediaAssets'

interface Props {
  /** The LED racks glow once the lighting module is installed. */
  lit?: boolean
}

/** Greenhouse interior behind the Mission 4 panels. It stays dim until the crew powers the LEDs. */
export function GreenhouseInteriorBackground({ lit = false }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0b0706]" aria-hidden>
      <img
        src={MEDIA.mission4.interior}
        alt=""
        className="gk-pixelated h-full w-full object-cover transition-[filter] duration-1000"
        style={{ filter: lit ? 'brightness(0.62) saturate(1.1)' : 'brightness(0.3) saturate(0.45)' }}
        draggable={false}
      />
      {lit ? (
        <div className="gk-glow-breathe absolute inset-0 bg-[radial-gradient(60%_50%_at_22%_18%,rgba(255,110,210,0.28),transparent_70%)]" />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,15,0.55),rgba(4,8,15,0.25)_40%,rgba(4,8,15,0.7))]" />
    </div>
  )
}
