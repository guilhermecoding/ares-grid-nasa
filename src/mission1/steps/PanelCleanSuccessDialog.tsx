import { motion } from 'framer-motion'
import { MEDIA } from '../../constants/mediaAssets'
import { PANEL_CLEAN_EFFICIENCY_GAIN, PANEL_CLEAN_ENERGY_GAIN } from '../../data/mission1Data'
import { useI18n } from '../../i18n/locale'
import { McButton } from '../../opening/McButton'
import { soundEngine } from '../../services/soundEngine'
import { useEffect } from 'react'

interface Props {
  open: boolean
  tilt: number
  azimuth: number
  efficiency: number
  onClose: () => void
}

/** Success dialog after cleaning — panel with dust-clear / shine effect. */
export function PanelCleanSuccessDialog({ open, tilt, azimuth, efficiency, onClose }: Props) {
  const { t } = useI18n()
  useEffect(() => {
    if (!open) return
    soundEngine.success()
  }, [open])

  if (!open) return null

  return (
    <div
      className="absolute inset-0 z-[80] flex items-center justify-center bg-void-950/80 p-4"
      role="dialog"
      aria-labelledby="panel-clean-title"
    >
      <motion.div
        className="w-full max-w-md border-2 border-cyan-hud bg-[#0a1628] p-5 text-center shadow-[0_0_28px_rgba(94,231,255,0.25)]"
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <p id="panel-clean-title" className="font-pixel text-xs tracking-widest text-cyan-hud uppercase">
          {t('Panel cleaned!', 'Painel limpo!')}
        </p>

        <div className="relative mx-auto mt-4 flex h-36 w-full max-w-[16rem] items-end justify-center overflow-hidden">
          <motion.img
            src={MEDIA.mission1.panel}
            alt=""
            draggable={false}
            className="w-full origin-bottom drop-shadow-[0_12px_20px_rgba(0,0,0,0.45)]"
            style={{
              transform: `perspective(420px) rotateX(${8 + tilt * 0.55}deg) rotateY(${azimuth * 0.32}deg)`,
            }}
            initial={{ filter: 'brightness(0.75) saturate(0.8)' }}
            animate={{ filter: ['brightness(0.75) saturate(0.8)', 'brightness(1.25) saturate(1.1)', 'brightness(1)'] }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
          {/* Dust motes flying off */}
          {Array.from({ length: 10 }, (_, i) => (
            <motion.span
              key={i}
              className="absolute size-1.5 rounded-full bg-[#e8c090]"
              style={{ left: `${20 + i * 6}%`, bottom: '35%' }}
              initial={{ opacity: 0.9, x: 0, y: 0 }}
              animate={{ opacity: 0, x: (i % 2 === 0 ? -1 : 1) * (30 + i * 8), y: -60 - i * 10 }}
              transition={{ duration: 1.1, delay: 0.05 * i, ease: 'easeOut' }}
            />
          ))}
          <motion.div
            className="pointer-events-none absolute inset-x-[10%] top-[20%] h-10 rounded-full bg-[#ffe0a0]/35 blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0] }}
            transition={{ duration: 1.2 }}
          />
        </div>

        <p className="mt-3 font-pixel text-[11px] leading-snug text-[#f4fff4] sm:text-sm">
          {t('Dust cleared! The panel makes power better again.', 'Poeira removida! O painel volta a gerar melhor.')}
        </p>
        <p className="mt-2 font-pixel text-[10px] text-energy sm:text-xs">
          {t(
            `+${PANEL_CLEAN_EFFICIENCY_GAIN}% efficiency · +${PANEL_CLEAN_ENERGY_GAIN}% energy`,
            `+${PANEL_CLEAN_EFFICIENCY_GAIN}% eficiência · +${PANEL_CLEAN_ENERGY_GAIN}% energia`,
          )}
        </p>
        <p className="mt-1 font-pixel text-[10px] text-void-300">
          {t(`Efficiency now: ${Math.round(efficiency)}%`, `Eficiência atual: ${Math.round(efficiency)}%`)}
        </p>

        <McButton className="mt-5 min-h-12 w-full font-pixel text-lg font-bold" onClick={onClose}>
          Ok
        </McButton>
      </motion.div>
    </div>
  )
}
