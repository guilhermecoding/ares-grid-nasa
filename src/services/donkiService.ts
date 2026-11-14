import { getCuratedDonkiBundle } from '../data/curatedDonkiEvents'
import type { DonkiBundle, DonkiCme, DonkiFlare, DonkiSep } from '../types/nasa'

const CACHE_KEY = 'aresgrid-donki-cache-v1'
const CACHE_TTL_MS = 30 * 60 * 1000

interface CachePayload {
  bundle: DonkiBundle
  savedAt: number
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function getWindow(): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 14)
  return { startDate: formatDate(start), endDate: formatDate(end) }
}

function apiBase(): string {
  // Dev proxy avoids CORS; production tries CCMC directly then falls back to curated.
  if (import.meta.env.DEV) return '/donki-api/get'
  return 'https://ccmc.gsfc.nasa.gov/DONKI-API/get'
}

async function fetchJson<T>(path: string, startDate: string, endDate: string): Promise<T[]> {
  const url = `${apiBase()}/${path}?startDate=${startDate}&endDate=${endDate}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`DONKI ${path} HTTP ${res.status}`)
  const data: unknown = await res.json()
  if (!Array.isArray(data)) return []
  return data as T[]
}

function readCache(): DonkiBundle | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachePayload
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null
    return { ...parsed.bundle, mode: 'cached' }
  } catch {
    return null
  }
}

function writeCache(bundle: DonkiBundle): void {
  const payload: CachePayload = {
    bundle: { ...bundle, mode: 'live' },
    savedAt: Date.now(),
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
}

function hasUsefulEvents(bundle: DonkiBundle): boolean {
  const strongFlare = bundle.flares.some((f) => /^[MX]/i.test(f.classType.trim()))
  const marsCme = bundle.cmes.some((c) => c.impactList?.some((i) => /mars/i.test(i.location)))
  return strongFlare || marsCme || bundle.seps.length > 0
}

function mergeWithCurated(live: DonkiBundle): DonkiBundle {
  const curated = getCuratedDonkiBundle()
  if (hasUsefulEvents(live)) return live
  // Quiet week: blend curated historical missions so the game stays interesting.
  return {
    flares: [...live.flares, ...curated.flares].slice(0, 8),
    cmes: [...live.cmes, ...curated.cmes].slice(0, 6),
    seps: [...live.seps, ...curated.seps].slice(0, 4),
    fetchedAt: live.fetchedAt,
    mode: live.mode === 'live' ? 'live' : 'curated',
  }
}

export async function fetchDonkiBundle(): Promise<DonkiBundle> {
  const cached = readCache()
  if (cached && hasUsefulEvents(cached)) return cached

  const { startDate, endDate } = getWindow()

  try {
    const [flares, cmes, seps] = await Promise.all([
      fetchJson<DonkiFlare>('FLR', startDate, endDate),
      fetchJson<DonkiCme>('CME', startDate, endDate),
      fetchJson<DonkiSep>('SEP', startDate, endDate),
    ])

    const live: DonkiBundle = {
      flares,
      cmes,
      seps,
      fetchedAt: new Date().toISOString(),
      mode: 'live',
    }
    writeCache(live)
    return mergeWithCurated(live)
  } catch {
    if (cached) return cached
    return getCuratedDonkiBundle()
  }
}
