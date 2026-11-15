import { AnimatePresence, motion } from 'framer-motion'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { ScrollHintArea } from '../../components/ScrollHintArea'
import { MEDIA } from '../../constants/mediaAssets'
import { INSTALL_SITES, type SiteId } from '../../data/mission1Data'
import { McButton } from '../../opening/McButton'
import { PixelDialogBox } from '../../opening/PixelDialogBox'

interface Props {
  onConfirm: (site: SiteId) => void
  /** Pre-select last saved site when replaying. */
  initialSite?: SiteId
}

interface PanelPos {
  left: number
  top: number
  side: 'left' | 'right' | 'above' | 'below'
}

const MARKER_SRC = {
  A: MEDIA.mission1.pointA,
  B: MEDIA.mission1.pointB,
  C: MEDIA.mission1.pointC,
} as const

/** Keep floating panel inside the map, clear of title + exit + edges. */
function placePanel(
  map: DOMRect,
  anchor: DOMRect,
  panelW: number,
  panelH: number,
): PanelPos {
  const pad = 10
  const safeTop = 56 // status indicators (left) + exit (right)
  const safeBottom = 72 // challenge title strip at bottom
  const safeRight = 72 // leave room for exit
  const gap = 12

  const ax = anchor.left - map.left + anchor.width / 2
  const ay = anchor.top - map.top + anchor.height / 2

  const spaceRight = map.width - (ax + anchor.width / 2) - pad - safeRight
  const spaceLeft = ax - anchor.width / 2 - pad
  const spaceBelow = map.height - (ay + anchor.height / 2) - pad - safeBottom
  const spaceAbove = ay - anchor.height / 2 - pad - safeTop

  type Side = PanelPos['side']
  const ranked = (
    [
      { side: 'right', space: spaceRight },
      { side: 'left', space: spaceLeft },
      { side: 'below', space: spaceBelow },
      { side: 'above', space: spaceAbove },
    ] as { side: Side; space: number }[]
  ).toSorted((a, b) => b.space - a.space)

  const side = ranked.find((r) => r.space >= panelW * 0.55)?.side ?? ranked[0]!.side

  let left = 0
  let top = 0

  if (side === 'right') {
    left = ax + anchor.width / 2 + gap
    top = ay - panelH / 2
  } else if (side === 'left') {
    left = ax - anchor.width / 2 - gap - panelW
    top = ay - panelH / 2
  } else if (side === 'below') {
    left = ax - panelW / 2
    top = ay + anchor.height / 2 + gap
  } else {
    left = ax - panelW / 2
    top = ay - anchor.height / 2 - gap - panelH
  }

  const minL = pad
  const maxL = map.width - panelW - pad - (side !== 'left' ? Math.min(safeRight, 24) : 0)
  const minT = safeTop
  const maxT = map.height - panelH - safeBottom

  left = Math.min(Math.max(left, minL), Math.max(minL, maxL))
  top = Math.min(Math.max(top, minT), Math.max(minT, maxT))

  return { left, top, side }
}

export function LocationChallenge({ onConfirm, initialSite }: Props) {
  const [selected, setSelected] = useState<SiteId | null>(initialSite ?? null)
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null)
  const [capiOpen, setCapiOpen] = useState(false)
  const [capiLines, setCapiLines] = useState<string[]>([])
  const [capiReady, setCapiReady] = useState(false)
  const [pendingAdvance, setPendingAdvance] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const markerRefs = useRef<Partial<Record<SiteId, HTMLButtonElement | null>>>({})

  const site = INSTALL_SITES.find((s) => s.id === selected)

  useLayoutEffect(() => {
    if (!selected || capiOpen) {
      setPanelPos(null)
      return
    }

    const update = () => {
      const mapEl = mapRef.current
      const markerEl = markerRefs.current[selected]
      const panelEl = panelRef.current
      if (!mapEl || !markerEl || !panelEl) return

      const map = mapEl.getBoundingClientRect()
      const anchor = markerEl.getBoundingClientRect()
      const { width: panelW, height: panelH } = panelEl.getBoundingClientRect()
      if (panelW < 8 || panelH < 8) return

      const next = placePanel(map, anchor, panelW, panelH)
      setPanelPos((prev) =>
        prev &&
        prev.side === next.side &&
        Math.abs(prev.left - next.left) < 0.5 &&
        Math.abs(prev.top - next.top) < 0.5
          ? prev
          : next,
      )
    }

    update()
    const id = requestAnimationFrame(update)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    if (mapRef.current) ro?.observe(mapRef.current)
    if (panelRef.current) ro?.observe(panelRef.current)
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)

    return () => {
      cancelAnimationFrame(id)
      ro?.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [selected, capiOpen, site?.id])

  const tryConfirm = () => {
    if (!site) return
    if (site.ideal) {
      onConfirm(site.id)
      return
    }
    setCapiLines([site.capiFeedback, 'Você pode confirmar mesmo assim ou escolher outro ponto.'])
    setCapiReady(false)
    setPendingAdvance(true)
    setCapiOpen(true)
  }

  const selectSite = (id: SiteId) => {
    setPanelPos(null)
    setSelected((prev) => (prev === id ? null : id))
  }

  return (
    <div className={`relative flex h-full min-h-0 flex-col ${capiOpen ? 'z-[60]' : 'z-10'}`}>
      <div ref={mapRef} className={`relative min-h-0 flex-1 ${capiOpen ? 'pointer-events-none' : ''}`}>
        {INSTALL_SITES.map((s) => {
          const active = selected === s.id
          return (
            <button
              key={s.id}
              ref={(el) => {
                markerRefs.current[s.id] = el
              }}
              type="button"
              tabIndex={capiOpen ? -1 : 0}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-hud ${
                capiOpen ? 'z-0' : active ? 'z-30 scale-110' : 'z-20 hover:scale-105'
              }`}
              style={{ left: `${s.leftPct}%`, top: `${s.topPct}%` }}
              onClick={() => selectSite(s.id)}
              aria-expanded={active}
              aria-controls={active ? 'site-detail-panel' : undefined}
              aria-label={`Ponto ${s.id}: ${s.name}`}
            >
              <span
                className={`absolute inset-0 -z-10 rounded-full ${
                  active ? 'animate-pulse bg-cyan-hud/25 ring-2 ring-cyan-hud/80' : ''
                }`}
                style={{ transform: 'scale(1.35)' }}
              />
              <img
                src={MARKER_SRC[s.id]}
                alt=""
                className="size-14 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.55)] sm:size-16"
                style={{ imageRendering: 'pixelated' }}
                draggable={false}
              />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-void-950/80 px-1.5 font-pixel text-[10px] text-cyan-hud sm:text-xs">
                {s.id}
              </span>
            </button>
          )
        })}

        <AnimatePresence>
          {site && !capiOpen && (
            <motion.div
              key={site.id}
              id="site-detail-panel"
              ref={panelRef}
              role="dialog"
              aria-label={`Detalhes do ponto ${site.id}`}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="absolute z-40 w-[min(17.5rem,calc(100%-1.25rem))] max-h-[min(22rem,calc(100%-4.5rem))] rounded-none border-2 border-cyan-hud/55 bg-[#0a1628]/96 shadow-[0_12px_28px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:w-[min(19rem,calc(100%-1.5rem))]"
              style={{
                left: panelPos?.left ?? 12,
                top: panelPos?.top ?? 72,
                visibility: panelPos ? 'visible' : 'hidden',
              }}
            >
              <ScrollHintArea
                variant="dark"
                frameClassName="max-h-[min(22rem,calc(100%-4.5rem))]"
                className="max-h-[min(22rem,calc(100%-4.5rem))] p-3 sm:p-3.5"
              >
                <div className="mb-2 flex items-start justify-between gap-2 border-b border-cyan-hud/25 pb-2">
                  <div className="min-w-0">
                    <p className="font-pixel text-xs text-cyan-hud sm:text-sm">Ponto {site.id}</p>
                    <p className="truncate text-sm font-semibold text-[#f4fff4] sm:text-base">{site.name}</p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded border border-void-400/40 px-2 py-1 text-xs text-void-200 hover:bg-void-800/80"
                    onClick={() => setSelected(null)}
                    aria-label="Fechar detalhes"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-2.5">
                  <div>
                    <p className="mb-0.5 text-[11px] font-bold tracking-wide text-life">Prós</p>
                    <ul className="space-y-0.5 text-sm leading-snug text-void-100">
                      {site.pros.map((p) => (
                        <li key={p} className="flex gap-1.5">
                          <span className="mt-0.5 text-life" aria-hidden>
                            +
                          </span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-0.5 text-[11px] font-bold tracking-wide text-danger">Contras</p>
                    <ul className="space-y-0.5 text-sm leading-snug text-void-100">
                      {site.cons.map((c) => (
                        <li key={c} className="flex gap-1.5">
                          <span className="mt-0.5 text-danger" aria-hidden>
                            −
                          </span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <McButton className="mt-3 min-h-11 w-full font-pixel text-base font-bold sm:min-h-12 sm:text-lg" onClick={tryConfirm}>
                  Confirmar local
                </McButton>
              </ScrollHintArea>

              {panelPos && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute size-2.5 rotate-45 border-cyan-hud/55 bg-[#0a1628]"
                  style={arrowStyle(panelPos.side)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none z-40 shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4">
        <p className="font-pixel text-sm text-[#f4fff4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] sm:text-base">
          Desafio 1.1 — Escolha o local dos painéis
        </p>
        <p className="mt-1 text-sm text-void-100/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
          Toque em A, B ou C. O cartão abre perto do ponto.
        </p>
      </div>

      <PixelDialogBox
        open={capiOpen}
        lines={capiLines}
        title="Capi"
        characterSrc={MEDIA.capi.duvida}
        onTypingComplete={() => setCapiReady(true)}
        onClosed={() => {
          if (pendingAdvance && selected) {
            setPendingAdvance(false)
            onConfirm(selected)
          }
        }}
        footer={
          capiReady ? (
            <div className="flex flex-wrap justify-center gap-2">
              <McButton
                className="min-h-12 px-4 font-pixel"
                onClick={() => {
                  setPendingAdvance(false)
                  setCapiOpen(false)
                }}
              >
                Escolher outro
              </McButton>
              <McButton className="min-h-12 px-4 font-pixel" onClick={() => setCapiOpen(false)}>
                Confirmar mesmo assim
              </McButton>
            </div>
          ) : null
        }
      />
    </div>
  )
}

function arrowStyle(side: PanelPos['side']): CSSProperties {
  const border = '2px solid rgba(94, 231, 255, 0.55)'
  if (side === 'right') {
    return {
      left: -6,
      top: '50%',
      marginTop: -5,
      borderLeft: border,
      borderBottom: border,
      borderRight: 'none',
      borderTop: 'none',
    }
  }
  if (side === 'left') {
    return {
      right: -6,
      top: '50%',
      marginTop: -5,
      borderRight: border,
      borderTop: border,
      borderLeft: 'none',
      borderBottom: 'none',
    }
  }
  if (side === 'below') {
    return {
      top: -6,
      left: '50%',
      marginLeft: -5,
      borderLeft: border,
      borderTop: border,
      borderRight: 'none',
      borderBottom: 'none',
    }
  }
  return {
    bottom: -6,
    left: '50%',
    marginLeft: -5,
    borderRight: border,
    borderBottom: border,
    borderLeft: 'none',
    borderTop: 'none',
  }
}
