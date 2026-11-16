import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { CAPI_LANDING_LINES, LANDING_HUD_LINES } from '../data/openingData'
import { useI18n } from '../i18n/locale'
import { CapiDialog } from './CapiDialog'
import { MarsApproachCanvas } from './MarsApproachCanvas'
import { McButton } from './McButton'
import { TypewriterHud } from './TypewriterHud'

interface LandingSceneProps {
  onStartMission: () => void
}

export function LandingScene({ onStartMission }: LandingSceneProps) {
  const { t, locale } = useI18n()
  const hudLines = useMemo(() => LANDING_HUD_LINES.map((line) => line[locale]), [locale])
  const capiLines = useMemo(() => CAPI_LANDING_LINES.map((line) => line[locale]), [locale])
  const [progress, setProgress] = useState(0)
  const [hudDone, setHudDone] = useState(false)
  const [capiDone, setCapiDone] = useState(false)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    const start = performance.now()
    const duration = 4200
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setProgress(t)
      if (t >= 0.92 && t < 0.98) setShake(true)
      if (t >= 0.98) setShake(false)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <motion.div
      className="relative h-full w-full overflow-hidden"
      style={{ touchAction: 'manipulation' }}
      animate={shake ? { x: [0, -5, 6, -4, 3, 0], y: [0, 4, -3, 2, 0] } : { x: 0, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <MarsApproachCanvas progress={progress} label={t('Mars', 'Marte')} paused={hudDone && !capiDone} />

      <div className="relative z-10 flex h-full flex-col justify-between p-3 sm:p-5">
        <div className="mx-auto w-full max-w-lg pt-8">
          {progress > 0.75 && (
            <TypewriterHud lines={hudLines} onComplete={() => setHudDone(true)} />
          )}
        </div>

        {hudDone && !capiDone && (
          <CapiDialog
            dialogId="opening-landing"
            lines={capiLines}
            onComplete={() => setCapiDone(true)}
            continueLabel={t('Continue', 'Continuar')}
          />
        )}

        {capiDone && (
          <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center px-4">
            <McButton className="min-h-14 w-full max-w-md px-4 font-pixel text-lg font-bold sm:text-xl" onClick={onStartMission}>
              {t('START MISSIONS', 'COMEÇAR MISSÕES')}
            </McButton>
          </div>
        )}
      </div>
    </motion.div>
  )
}
