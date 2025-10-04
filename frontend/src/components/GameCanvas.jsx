/**
 * System: Base Event Platformer
 * Module: Game Canvas Component
 * Purpose: Host the PixiJS application, coordinate the game engine lifecycle, and expose UI overlays
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Application } from 'pixi.js'
import { createGameEngine } from '../game/GameEngine.js'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BACKGROUND_COLOR,
} from '../game/gameConstants.js'
import useKeyboardControls from '../hooks/useKeyboardControls.js'

const objDefaultControls = { blnMovingLeft: false, blnMovingRight: false }

function GameCanvas() {
  const objCanvasContainerRef = useRef(null)
  const objApplicationRef = useRef(null)
  const objEngineRef = useRef(null)
  const objControlSnapshotRef = useRef(objDefaultControls)
  const objControlsStatusRef = useRef({ success: false, error: 'Pending' })

  const [intScore, setIntScore] = useState(0)
  const [blnGameOver, setBlnGameOver] = useState(false)
  const [strErrorMessage, setStrErrorMessage] = useState('')

  const objControlsResult = useKeyboardControls()

  if (objControlsResult.success) {
    objControlSnapshotRef.current = objControlsResult.data
  }
  objControlsStatusRef.current = objControlsResult

  const fncGetControlState = useCallback(() => {
    if (objControlsStatusRef.current.success) {
      return objControlSnapshotRef.current
    }

    return objDefaultControls
  }, [])

  useEffect(() => {
    let blnIsCancelled = false
    const objCanvasContainerElement = objCanvasContainerRef.current

    async function fncInitialize() {
      try {
        const objInitializedApplication = new Application()
        await objInitializedApplication.init({
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          background: BACKGROUND_COLOR,
          antialias: true,
        })

        if (blnIsCancelled) {
          objInitializedApplication.destroy(true, { children: true })
          return
        }

        objApplicationRef.current = objInitializedApplication

        if (!objCanvasContainerElement) {
          objInitializedApplication.destroy(true, { children: true })
          objApplicationRef.current = null
          return
        }

        objCanvasContainerElement.innerHTML = ''
        objCanvasContainerElement.appendChild(objInitializedApplication.canvas)

        const objEngineResult = createGameEngine({
          objApplication: objInitializedApplication,
          fncGetControlState,
          fncOnScoreUpdate: (intNewScore) => setIntScore(intNewScore),
          fncOnGameOver: () => setBlnGameOver(true),
        })

        if (!objEngineResult.success) {
          setStrErrorMessage('Unable to configure the game engine.')
          objInitializedApplication.destroy(true, { children: true })
          objApplicationRef.current = null
          return
        }

        objEngineRef.current = objEngineResult.data

        const objInitResult = objEngineRef.current.initializeStage()
        if (!objInitResult.success) {
          setStrErrorMessage('Unable to initialize the game stage.')
          objInitializedApplication.destroy(true, { children: true })
          objApplicationRef.current = null
          objEngineRef.current = null
          return
        }

        const objStartResult = objEngineRef.current.start()
        if (!objStartResult.success) {
          setStrErrorMessage('Unable to start the game loop.')
          objInitializedApplication.destroy(true, { children: true })
          objApplicationRef.current = null
          objEngineRef.current = null
        }
      } catch (objError) {
        console.error('Failed to initialize PixiJS application', objError)
        setStrErrorMessage('Failed to initialize the PixiJS renderer.')
      }
    }

    fncInitialize()

    return () => {
      blnIsCancelled = true
      setBlnGameOver(false)
      setIntScore(0)

      if (objEngineRef.current) {
        objEngineRef.current.stop()
        objEngineRef.current = null
      }

      if (objApplicationRef.current) {
        objApplicationRef.current.destroy(true, { children: true })
        objApplicationRef.current = null
      }

      if (objCanvasContainerElement) {
        objCanvasContainerElement.innerHTML = ''
      }
    }
  }, [fncGetControlState])

  const blnControlsUnavailable = !objControlsStatusRef.current.success

  const fncHandleRestart = () => {
    if (!objEngineRef.current) {
      return
    }

    const objResetResult = objEngineRef.current.reset()

    if (!objResetResult.success) {
      setStrErrorMessage('Unable to reset the game.')
      return
    }

    const objStartResult = objEngineRef.current.start()
    if (!objStartResult.success) {
      setStrErrorMessage('Unable to restart the game loop.')
      return
    }

    setBlnGameOver(false)
    setStrErrorMessage('')
    setIntScore(0)
  }

  return (
    <section className="game-container" aria-live="polite">
      <div
        className="game-stage"
        ref={objCanvasContainerRef}
        role="presentation"
        aria-label="Platformer game canvas"
      />
      <div className="game-overlay">
        <span className="game-score" aria-label={'Current score ' + intScore}>
          Score: {intScore}
        </span>
        {blnControlsUnavailable && (
          <p className="game-warning">Keyboard controls are unavailable in this environment.</p>
        )}
        {strErrorMessage && <p className="game-error">{strErrorMessage}</p>}
        {blnGameOver && (
          <button type="button" className="game-button" onClick={fncHandleRestart}>
            Restart
          </button>
        )}
      </div>
    </section>
  )
}

export default GameCanvas