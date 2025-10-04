/**
 * System: Base Event Platformer
 * Module: Game Canvas Component
 * Purpose: Host the PixiJS application, coordinate the game engine lifecycle, and expose UI overlays
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Application, Assets } from 'pixi.js'
import { createGameEngine } from '../game/GameEngine.js'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BACKGROUND_COLOR,
  BACKGROUND_IMAGE_PATH,
  BACKGROUND_MUSIC_PATH,
  BACKGROUND_MUSIC_VOLUME_DEFAULT,
} from '../game/gameConstants.js'
import useKeyboardControls from '../hooks/useKeyboardControls.js'

const STR_SAVE_PENDING_MESSAGE = 'Blockchain save queued. Integration pending.'
const STR_SAVE_ERROR_MESSAGE = 'Unable to queue blockchain save.'
const objDefaultControls = { blnMovingLeft: false, blnMovingRight: false, blnJumpActive: false }

function GameCanvas() {
  const objCanvasContainerRef = useRef(null)
  const objApplicationRef = useRef(null)
  const objEngineRef = useRef(null)
  const objControlSnapshotRef = useRef(objDefaultControls)
  const objControlsStatusRef = useRef({ success: false, error: 'Pending' })
  const objPointerJumpRef = useRef(false)

  const [intScore, setIntScore] = useState(0)
  const [blnGameOver, setBlnGameOver] = useState(false)
  const [strErrorMessage, setStrErrorMessage] = useState('')
  const [blnSaveInProgress, setBlnSaveInProgress] = useState(false)
  const [strSaveStatusMessage, setStrSaveStatusMessage] = useState('')
  const [objAudioState, setObjAudioState] = useState(null)
  const [dblMusicVolume, setDblMusicVolume] = useState(BACKGROUND_MUSIC_VOLUME_DEFAULT)

  const objControlsResult = useKeyboardControls()

  if (objControlsResult.success) {
    objControlSnapshotRef.current = objControlsResult.data
  }
  objControlsStatusRef.current = objControlsResult

  const fncGetControlState = useCallback(() => {
    if (objControlsStatusRef.current.success) {
      const objControlState = objControlSnapshotRef.current

      return {
        blnMovingLeft: objControlState.blnMovingLeft,
        blnMovingRight: objControlState.blnMovingRight,
        blnJumpActive: objControlState.blnJumpActive || objPointerJumpRef.current,
      }
    }

    return {
      blnMovingLeft: objDefaultControls.blnMovingLeft,
      blnMovingRight: objDefaultControls.blnMovingRight,
      blnJumpActive: objPointerJumpRef.current,
    }
  }, [])

  const fncHandleGameOver = useCallback(() => {
    setBlnGameOver(true)
    setBlnSaveInProgress(false)
    setStrSaveStatusMessage('')
    objPointerJumpRef.current = false
  }, [])

  useEffect(() => {
    let blnIsCancelled = false
    const objCanvasContainerElement = objCanvasContainerRef.current

    const fncHandlePointerDown = (objEvent) => {
      if (objEvent.pointerType === 'mouse' && objEvent.button !== 0) {
        return
      }

      objPointerJumpRef.current = true
    }

    const fncHandlePointerRelease = () => {
      objPointerJumpRef.current = false
    }

    if (objCanvasContainerElement) {
      objCanvasContainerElement.addEventListener('pointerdown', fncHandlePointerDown)
      objCanvasContainerElement.addEventListener('pointerup', fncHandlePointerRelease)
      objCanvasContainerElement.addEventListener('pointercancel', fncHandlePointerRelease)
      objCanvasContainerElement.addEventListener('pointerleave', fncHandlePointerRelease)
    }

    async function fncInitialize() {
      try {
        // Initialize PixiJS Assets system first
        await Assets.init({
          basePath: '/',
          texturePreference: {
            format: ['png', 'webp'],
            resolution: 1,
          },
        })

        // Add background and audio asset bundles
        Assets.addBundle('background', [
          { alias: 'background', src: BACKGROUND_IMAGE_PATH },
          { alias: 'platform', src: 'platform.png' }
        ])

        Assets.addBundle('audio', [
          { alias: 'music', src: BACKGROUND_MUSIC_PATH }
        ])

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

        // Load background and audio assets with proper error handling
        try {
          await Assets.loadBundle('background')
        } catch (objAssetError) {
          console.warn('Background texture failed to load, using solid color background', objAssetError)
          // Don't fail the entire initialization if background fails
        }

        try {
          await Assets.loadBundle('audio')
        } catch (objAudioError) {
          console.warn('Audio file failed to load, game will proceed without background music', objAudioError)
          // Don't fail the entire initialization if audio fails
        }

        if (blnIsCancelled) {
          objInitializedApplication.destroy(true, { children: true })
          objApplicationRef.current = null
          return
        }

        const objEngineResult = createGameEngine({
          objApplication: objInitializedApplication,
          fncGetControlState,
          fncOnScoreUpdate: (intNewScore) => setIntScore(intNewScore),
          fncOnGameOver: fncHandleGameOver,
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

        const objAudioState = objEngineRef.current.getAudioState()
        if (objAudioState) {
          setObjAudioState(objAudioState)
          setDblMusicVolume(objAudioState.dblCurrentVolume)
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
      setBlnSaveInProgress(false)
      setStrSaveStatusMessage('')
      setObjAudioState(null)
      setDblMusicVolume(BACKGROUND_MUSIC_VOLUME_DEFAULT)

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
        objCanvasContainerElement.removeEventListener('pointerdown', fncHandlePointerDown)
        objCanvasContainerElement.removeEventListener('pointerup', fncHandlePointerRelease)
        objCanvasContainerElement.removeEventListener('pointercancel', fncHandlePointerRelease)
        objCanvasContainerElement.removeEventListener('pointerleave', fncHandlePointerRelease)
      }

      objPointerJumpRef.current = false
    }
  }, [fncGetControlState, fncHandleGameOver])

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

    const objAudioState = objEngineRef.current.getAudioState()
    if (objAudioState) {
      setObjAudioState(objAudioState)
      setDblMusicVolume(objAudioState.dblCurrentVolume)
    }

    setBlnGameOver(false)
    setStrErrorMessage('')
    setIntScore(0)
    setBlnSaveInProgress(false)
    setStrSaveStatusMessage('')
  }

  const fncHandleSaveToBlockchain = () => {
    if (blnSaveInProgress) {
      return
    }

    if (!objEngineRef.current) {
      setStrSaveStatusMessage(STR_SAVE_ERROR_MESSAGE)
      return
    }

    setBlnSaveInProgress(true)

    try {
      const intFinalScore = objEngineRef.current.getScore
        ? objEngineRef.current.getScore()
        : intScore

      console.info('Blockchain save placeholder invoked', {
        stage: 'pendingIntegration',
        score: intFinalScore,
      })

      setStrSaveStatusMessage(STR_SAVE_PENDING_MESSAGE + ' Score: ' + intFinalScore + '.')
    } catch (objError) {
      console.error('Failed to queue blockchain save placeholder', objError)
      setStrSaveStatusMessage(STR_SAVE_ERROR_MESSAGE)
    } finally {
      setBlnSaveInProgress(false)
    }
  }

  const fncHandleToggleMusic = () => {
    if (!objEngineRef.current) {
      return
    }

    const objToggleResult = objEngineRef.current.toggleMusic()
    if (objToggleResult.success) {
      const objAudioState = objEngineRef.current.getAudioState()
      if (objAudioState) {
        setObjAudioState(objAudioState)
      }
    }
  }

  const fncHandleVolumeChange = (objEvent) => {
    const dblNewVolume = parseFloat(objEvent.target.value)
    setDblMusicVolume(dblNewVolume)

    if (objEngineRef.current) {
      objEngineRef.current.setMusicVolume(dblNewVolume)
    }

    localStorage.setItem('musicVolume', dblNewVolume.toString())
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
        <div className="game-audio-controls">
          <button
            type="button"
            className="game-audio-button"
            onClick={fncHandleToggleMusic}
            aria-label={objAudioState?.blnIsPlaying ? 'Pause music' : 'Play music'}
            title={objAudioState?.blnIsPlaying ? 'Pause music' : 'Play music'}
          >
            {objAudioState?.blnIsPlaying ? '🔊' : '🔇'}
          </button>
          <div className="game-volume-control">
            <label htmlFor="music-volume" className="game-volume-label">
              Volume:
            </label>
            <input
              id="music-volume"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={dblMusicVolume}
              onChange={fncHandleVolumeChange}
              className="game-volume-slider"
              aria-label="Music volume"
            />
            <span className="game-volume-value">{Math.round(dblMusicVolume * 100)}%</span>
          </div>
        </div>
        {blnControlsUnavailable && (
          <p className="game-warning">Keyboard controls are unavailable in this environment.</p>
        )}
        {strErrorMessage && <p className="game-error">{strErrorMessage}</p>}
      </div>
      {blnGameOver && (
        <div
          className="game-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-over-heading"
        >
          <div className="game-modal">
            <h2 id="game-over-heading" className="game-over-title">
              Game Over
            </h2>
            <p className="game-over-score" aria-live="polite">
              Final score: {intScore}
            </p>
            {strSaveStatusMessage && (
              <p className="game-info-message">{strSaveStatusMessage}</p>
            )}
            <div className="game-action-row">
              <button
                type="button"
                className="game-button game-button-primary"
                onClick={fncHandleSaveToBlockchain}
                disabled={blnSaveInProgress}
              >
                {blnSaveInProgress ? 'Saving...' : 'Save to blockchain'}
              </button>
              <button type="button" className="game-button" onClick={fncHandleRestart}>
                Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default GameCanvas
