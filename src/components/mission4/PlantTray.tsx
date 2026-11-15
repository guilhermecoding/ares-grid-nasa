import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MEDIA } from '../../constants/mediaAssets'
import type { PlantGroupId } from '../../data/mission4Data'
import { TRAY_BEDS, TRAY_ORDER } from './trayLayout'

interface Props {
  /** Plant size (0–1) for each planted bed. Beds left out stay as bare soil. */
  plants: Partial<Record<PlantGroupId, number>>
  /** Dry leaves lose color until the mist comes back. */
  dry?: boolean
  /** Overlays positioned in % of the tray: drop zones, badges, particles. */
  children?: ReactNode
  className?: string
}

/** Isometric four-bed tray. Each bed's plants spring up from the soil as they grow. */
export function PlantTray({ plants, dry = false, children, className = '' }: Props) {
  return (
    <div className={`relative aspect-[984/702] w-full select-none ${className}`}>
      <img src={MEDIA.mission4.trayEmpty} alt="" className="gk-pixelated absolute inset-0 h-full w-full" draggable={false} />
      <AnimatePresence>
        {TRAY_ORDER.map((group) => {
          const scale = plants[group]
          if (scale == null) return null
          const bed = TRAY_BEDS[group]
          return (
            <motion.img
              key={group}
              src={MEDIA.mission4.tray[group]}
              alt=""
              draggable={false}
              className="gk-pixelated pointer-events-none absolute inset-0 h-full w-full"
              style={{
                transformOrigin: `${bed.cx}% ${bed.cy + 3}%`,
                filter: dry ? 'saturate(0.45) sepia(0.45) brightness(0.85)' : 'none',
                transition: 'filter 0.5s',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale, opacity: 1 }}
              exit={{ scale: scale * 1.15, opacity: 0, y: -40 }}
              transition={{ type: 'spring', stiffness: 160, damping: 11 }}
            />
          )
        })}
      </AnimatePresence>
      {children}
    </div>
  )
}
