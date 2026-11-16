import { useState } from 'react'
import { MEDIA, playerArt } from '../constants/mediaAssets'
import { CAPI_CONFIRM, NAME_SUGGESTIONS, type AstronautProfile, type AvatarId } from '../data/openingData'
import { useI18n } from '../i18n/locale'
import { CapiDialog } from './CapiDialog'
import { LaunchSpaceCanvas } from './LaunchSpaceCanvas'
import { McButton } from './McButton'

interface AstronautCustomizerProps {
  initial?: Partial<AstronautProfile>
  onConfirm: (profile: AstronautProfile) => void
}

const AVATARS: readonly AvatarId[] = ['boy', 'girl']

export function AstronautCustomizer({ initial, onConfirm }: AstronautCustomizerProps) {
  const { t } = useI18n()
  const [name, setName] = useState(initial?.name ?? '')
  const [avatar, setAvatar] = useState<AvatarId>(initial?.avatar === 'girl' ? 'girl' : 'boy')
  const [confirmed, setConfirmed] = useState(false)

  const profile: AstronautProfile = {
    name: name.trim() || t('Astronaut', 'Astronauta'),
    avatar,
    suitColor: initial?.suitColor ?? 'nasa-white',
    helmet: initial?.helmet ?? 'classic',
    backpack: initial?.backpack ?? 'standard',
    insignia: initial?.insignia ?? 'ares',
  }
  const art = playerArt(avatar)
  const confirmLine = t(CAPI_CONFIRM.en, CAPI_CONFIRM.pt).replace('{name}', profile.name)
  const avatarLabel = (id: AvatarId) => (id === 'girl' ? t('Girl', 'Menina') : t('Boy', 'Menino'))

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

      <div className="relative z-10 flex h-full items-center justify-center p-4">
        <section className="w-full max-w-md border-2 border-cyan-hud/40 bg-[#0a1628]/92 p-4 shadow-[0_0_28px_rgba(94,231,255,0.2)] sm:p-5">
          <h2 className="text-center font-pixel text-lg leading-none text-void-100 sm:text-2xl">
            {t('Who is the astronaut?', 'Quem é o astronauta?')}
          </h2>

          <img
            src={art.frontal}
            alt={avatar === 'girl' ? t('Girl astronaut', 'Astronauta menina') : t('Boy astronaut', 'Astronauta menino')}
            draggable={false}
            className="mx-auto mt-3 h-44 w-auto object-contain sm:h-56"
          />
          <p className="mt-1 truncate text-center font-pixel text-sm text-cyan-hud">{profile.name}</p>

          <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('Astronaut', 'Astronauta')}>
            {AVATARS.map((id) => {
              const selected = avatar === id
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`flex min-h-14 items-center justify-center gap-2 border-2 px-2 font-pixel text-sm ${
                    selected
                      ? 'border-cyan-hud bg-cyan-hud text-void-950 shadow-[0_0_12px_rgba(94,231,255,0.45)]'
                      : 'border-cyan-hud/35 bg-[#0a1628] text-void-100 hover:border-cyan-hud/70'
                  }`}
                  onClick={() => setAvatar(id)}
                >
                  <img
                    src={playerArt(id).head}
                    alt=""
                    draggable={false}
                    className="size-10 object-contain"
                  />
                  {avatarLabel(id)}
                </button>
              )
            })}
          </div>

          <label className="mt-4 block">
            <span className="font-pixel text-xs text-void-100">{t('Name', 'Nome')}</span>
            <input
              type="text"
              value={name}
              maxLength={16}
              placeholder={t('Type your name', 'Digite seu nome')}
              className="mt-1 min-h-11 w-full border-2 border-[#f4fff4]/35 bg-[#1a1c3a] px-3 font-pixel text-sm text-[#f4fff4] placeholder:text-[#f4fff4]/40 focus:border-cyan-hud focus:outline-none"
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <div className="mt-2 flex flex-wrap gap-1">
            {NAME_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className={`min-h-8 px-2 font-pixel text-[10px] ${
                  name === suggestion
                    ? 'bg-[#f4fff4] text-[#30346d]'
                    : 'border border-[#f4fff4]/30 text-[#f4fff4]/85 hover:border-[#f4fff4]/70'
                }`}
                onClick={() => setName(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <McButton
            className="mt-4 min-h-11 w-full px-4 font-pixel text-base font-bold"
            onClick={() => setConfirmed(true)}
          >
            {t('Confirm astronaut', 'Confirmar astronauta')}
          </McButton>
        </section>
      </div>
    </div>
  )
}
