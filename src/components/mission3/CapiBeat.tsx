import { CapiDialog } from '../../opening/CapiDialog'

interface Props {
  id: string
  lines: readonly string[]
  label?: string
  onDone: () => void
}

/** One standard Capi box. The parent remounts it by changing `id`. */
export function CapiBeat({ id, lines, label = 'Continuar', onDone }: Props) {
  return <CapiDialog lines={lines} dialogId={id} continueLabel={label} onComplete={onDone} />
}
