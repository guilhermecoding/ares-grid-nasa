import { useEffect, useRef, useState } from 'react'
import { isDialogGroupSkipped } from '../services/progressStore'

/**
 * Pular marks the mission group. This hook finishes the current chain
 * and, on a later visit, skips the dialog as soon as it would open.
 */
export function useHideFollowingDialogs(group: string, onDone: () => void) {
  const onDoneRef = useRef(onDone)
  const skipRest = useRef(false)

  useEffect(() => {
    onDoneRef.current = onDone
  })
  const [blocked] = useState(() => isDialogGroupSkipped(group))

  useEffect(() => {
    if (blocked) onDoneRef.current()
  }, [blocked])

  const hideDialog = () => {
    skipRest.current = true
  }

  const afterClose = (isLast: boolean, showNext: () => void) => {
    if (skipRest.current || isDialogGroupSkipped(group)) {
      onDoneRef.current()
      return
    }
    if (!isLast) showNext()
    else onDoneRef.current()
  }

  return { blocked, hideDialog, afterClose }
}
