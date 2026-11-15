import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { soundEngine } from '../services/soundEngine'

interface McButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

/** Orange Minecraft-style CTA — always plays the GO completion sting. */
export function McButton({ children, className = '', onClick, type = 'button', ...rest }: McButtonProps) {
  return (
    <button
      type={type}
      className={`mc-btn ${className}`}
      onClick={(e) => {
        soundEngine.goStart()
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
