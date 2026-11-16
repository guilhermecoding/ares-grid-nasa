import type { CSSProperties } from 'react'
import { playerArt } from '../constants/mediaAssets'
import { loadProgress } from '../services/progressStore'

/** Standing crew sprite for the astronaut the player chose. */
export function PlayerChibi({
  className,
  alt = '',
  style,
}: {
  className?: string
  alt?: string
  style?: CSSProperties
}) {
  return (
    <img
      src={playerArt(loadProgress().avatar).chibi}
      alt={alt}
      draggable={false}
      className={className}
      style={style}
    />
  )
}
