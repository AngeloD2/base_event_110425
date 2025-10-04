/**
 * System: Base Event Platformer
 * Module: Keyboard Controls Hook
 * Purpose: Track keyboard input for horizontal movement and expose a Result-signaled state object
 */
import { useEffect, useMemo, useRef, useState } from 'react'

const arrLeftKeyCodes = ['ArrowLeft', 'KeyA']
const arrRightKeyCodes = ['ArrowRight', 'KeyD']
const arrJumpKeyCodes = ['Space', 'ArrowUp', 'KeyW']

export default function useKeyboardControls() {
  const blnHasWindow = typeof window !== 'undefined' && typeof window.addEventListener === 'function'
  const [objControlState, setObjControlState] = useState({
    blnMovingLeft: false,
    blnMovingRight: false,
    blnJumpActive: false,
  })
  const objPressedKeysRef = useRef(new Set())

  useEffect(() => {
    if (!blnHasWindow) {
      return
    }

    const objPressedKeys = objPressedKeysRef.current

    const fncSynchronizeControlState = () => {
      const blnMovingLeft = arrLeftKeyCodes.some((strCode) => objPressedKeys.has(strCode))
      const blnMovingRight = arrRightKeyCodes.some((strCode) => objPressedKeys.has(strCode))
      const blnJumpActive = arrJumpKeyCodes.some((strCode) => objPressedKeys.has(strCode))

      setObjControlState((objPrevious) => {
        if (
          objPrevious.blnMovingLeft === blnMovingLeft &&
          objPrevious.blnMovingRight === blnMovingRight &&
          objPrevious.blnJumpActive === blnJumpActive
        ) {
          return objPrevious
        }

        return {
          blnMovingLeft,
          blnMovingRight,
          blnJumpActive,
        }
      })
    }

    const fncHandleKeyDown = (objEvent) => {
      objPressedKeys.add(objEvent.code)
      fncSynchronizeControlState()
    }

    const fncHandleKeyUp = (objEvent) => {
      objPressedKeys.delete(objEvent.code)
      fncSynchronizeControlState()
    }

    window.addEventListener('keydown', fncHandleKeyDown)
    window.addEventListener('keyup', fncHandleKeyUp)

    return () => {
      window.removeEventListener('keydown', fncHandleKeyDown)
      window.removeEventListener('keyup', fncHandleKeyUp)
      objPressedKeys.clear()
      setObjControlState({ blnMovingLeft: false, blnMovingRight: false, blnJumpActive: false })
    }
  }, [blnHasWindow])

  return useMemo(() => {
    if (!blnHasWindow) {
      return { success: false, error: 'UnsupportedControls' }
    }

    return { success: true, data: objControlState }
  }, [blnHasWindow, objControlState])
}
