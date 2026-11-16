import { MEDIA } from '../../constants/mediaAssets'

export type StormScene = 'dust' | 'shelter' | 'clear' | 'future'

interface Props {
  mode: StormScene
}

const FILTERS: Record<StormScene, string> = {
  dust: 'brightness(0.72) saturate(1.1)',
  shelter: 'brightness(0.42) saturate(0.75) hue-rotate(-14deg)',
  clear: 'brightness(0.95)',
  future: 'brightness(1.05) saturate(1.1)',
}

/**
 * The base under the storm wall. Dust blows across during the alert, solar particles streak
 * during the radiation run, and the camera closes in on the base once the sky clears.
 */
export function MarsStormBackground({ mode }: Props) {
  const clear = mode === 'clear' || mode === 'future'
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#1a0d08]" aria-hidden>
      <img
        src={MEDIA.mission5.storm}
        alt=""
        draggable={false}
        className="gk-pixelated h-full w-full object-cover transition-[transform,filter] duration-[2500ms] ease-in-out"
        style={{
          transformOrigin: '0% 100%',
          transform: clear ? 'scale(1.65)' : 'scale(1.02)',
          filter: FILTERS[mode],
        }}
      />
      {mode === 'dust' ? (
        <>
          <div className="gk-dust absolute inset-0" />
          <div className="gk-dust gk-dust-slow absolute inset-0 scale-y-150" />
        </>
      ) : null}
      {mode === 'shelter' ? (
        <>
          <div className="gk-rays absolute inset-0" />
          <div className="gk-alarm absolute inset-0 bg-danger" />
        </>
      ) : null}
      <div className={`absolute inset-0 ${mode === 'future' ? 'bg-[#0c0605]/35' : 'bg-[#0c0605]/55'}`} />
    </div>
  )
}
