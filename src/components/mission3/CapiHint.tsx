import { AnimatePresence, motion } from 'framer-motion'
import { MEDIA } from '../../constants/mediaAssets'

interface Props {
  text: string | null
}

/** Holographic Capi tip pinned to the lower-right corner. Never blocks input. */
export function CapiHint({ text }: Props) {
  return (
    <div className="pointer-events-none absolute right-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-40 w-[min(22rem,calc(100%-1rem))] sm:right-4">
      <AnimatePresence mode="wait">
        {text ? (
          <motion.div
            key={text}
            role="status"
            aria-live="polite"
            className="relative flex max-h-28 items-center gap-2 overflow-hidden rounded-md border-2 border-cyan-hud/70 bg-[#061018]/90 py-2 pr-3 pl-2 shadow-[0_0_22px_rgba(94,231,255,0.28)]"
            initial={{ opacity: 0, y: 12, scaleY: 0.4 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: 8, scaleY: 0.4 }}
            transition={{ duration: 0.22 }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage: 'repeating-linear-gradient(to bottom, rgba(94,231,255,0.35) 0 1px, transparent 1px 4px)',
              }}
              aria-hidden
            />
            <img src={MEDIA.capi.neutral} alt="" className="size-14 shrink-0 object-contain" draggable={false} />
            <div className="relative min-w-0">
              <p className="font-pixel text-[9px] tracking-widest text-cyan-hud">CAPI</p>
              <p className="text-sm leading-snug text-[#f4fff4]">{text}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
