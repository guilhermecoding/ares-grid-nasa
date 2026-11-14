interface Props {
  open: boolean
  title: string
  body: string
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
}

export function DialogBox({
  open,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-void-950/70 p-4 sm:items-center">
      <div className="glass-panel w-full max-w-md rounded-2xl p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🤖
          </span>
          <h2 className="font-pixel text-lg text-nebula sm:text-xl">{title}</h2>
        </div>
        <p className="text-sm leading-relaxed text-void-100 sm:text-base">{body}</p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {secondaryLabel && onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              className="pixel-btn touch-target rounded-xl bg-void-600 px-3 font-bold text-void-100"
            >
              {secondaryLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onPrimary}
            className="pixel-btn touch-target rounded-xl bg-star px-4 font-pixel font-bold text-void-950"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
