import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { LogbookNote } from '../services/progressStore'

export type Locale = 'en' | 'pt'

const STORAGE_KEY = 'aresgrid-locale'

/** On-screen name. Same in both languages. */
export const GAME_TITLE = 'Mars Adventures'

type Translate = (en: string, pt: string) => string

interface I18nValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translate
}

const I18nContext = createContext<I18nValue | null>(null)

function readLocale(): Locale {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'pt' ? 'pt' : 'en'
  } catch {
    return 'en'
  }
}

function writeLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // Private browsing can block storage. The choice still applies this visit.
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale)

  const setLocale = useCallback((next: Locale) => {
    writeLocale(next)
    setLocaleState(next)
  }, [])

  const t = useCallback<Translate>((en, pt) => (locale === 'en' ? en : pt), [locale])

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'pt-BR'
    document.title =
      locale === 'en' ? `${GAME_TITLE} — Science on Mars` : `${GAME_TITLE} — Ciência em Marte`
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext value={value}>{children}</I18nContext>
}

export function useI18n(): I18nValue {
  const value = use(I18nContext)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}

/** Saved logbook lines follow the language when both were stored. */
export function localizedNote(note: LogbookNote, locale: Locale): { label: string; detail?: string } {
  const label = locale === 'en' ? (note.labelEn ?? note.label) : (note.labelPt ?? note.label)
  const detail = locale === 'en' ? (note.detailEn ?? note.detail) : (note.detailPt ?? note.detail)
  return detail ? { label, detail } : { label }
}

export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()
  const base = 'min-h-11 px-3 font-pixel text-xs sm:text-sm'
  const on = 'bg-cyan-hud text-void-950'
  const off = 'bg-transparent text-void-100 hover:bg-white/10'

  return (
    <div
      role="group"
      aria-label={t('Language', 'Idioma')}
      className={`inline-flex overflow-hidden rounded-full bg-[#0a1628]/80 ring-1 ring-nebula/50 ${className}`}
    >
      <button
        type="button"
        aria-pressed={locale === 'en'}
        className={`${base} ${locale === 'en' ? on : off}`}
        onClick={() => setLocale('en')}
      >
        English
      </button>
      <button
        type="button"
        aria-pressed={locale === 'pt'}
        className={`${base} ${locale === 'pt' ? on : off}`}
        onClick={() => setLocale('pt')}
      >
        Português
      </button>
    </div>
  )
}
