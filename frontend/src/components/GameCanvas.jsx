/**
 * System: Base Event Platformer
 * Module: Game Canvas Component
 * Purpose: Render a PixiJS-powered canvas with basic 2D platformer controls
 */
import { useEffect, useRef } from 'react'
import { Application, Graphics } from 'pixi.js'

const CANVAS_WIDTH = 960
const CANVAS_HEIGHT = 540
const GROUND_HEIGHT = 80
const PLAYER_SIZE = 48
const BACKGROUND_COLOR = 0x0d1b2a
const PLAYER_COLOR = 0xffe066
const GROUND_COLOR = 0x415a77
const MOVE_SPEED = 4
const GRAVITY_FORCE = 0.7
const JUMP_FORCE = -14
const KEY_CODE_LEFT = 'ArrowLeft'
const KEY_CODE_RIGHT = 'ArrowRight'
const KEY_CODE_JUMP = 'Space'
const KEY_CODE_ALT_JUMP = 'ArrowUp'

function GameCanvas() {
  const objCanvasContainerRef = useRef(null)

  useEffect(() => {
    const objActiveKeys = new Set()
    const objPlayerState = {
      dblVelocityY: 0,
      blnOnGround: false,
    }

    let objApplication = null
    let objTicker = null
    let objPlayer = null
    let objGround = null
    let blnListenersAttached = false
    let blnShouldAbort = false

    function fncHandleKeyDown(objEvent) {
      if (blnShouldAbort) {
        return
      }

      objActiveKeys.add(objEvent.code)

      if (
        (objEvent.code === KEY_CODE_JUMP || objEvent.code === KEY_CODE_ALT_JUMP) &&
        objPlayerState.blnOnGround
      ) {
        objPlayerState.dblVelocityY = JUMP_FORCE
        objPlayerState.blnOnGround = false
      }
    }

    function fncHandleKeyUp(objEvent) {
      if (blnShouldAbort) {
        return
      }

      objActiveKeys.delete(objEvent.code)
    }

    function fncUpdateGame() {
      if (!objPlayer) {
        return
      }

      if (objActiveKeys.has(KEY_CODE_LEFT)) {
        objPlayer.x = Math.max(0, objPlayer.x - MOVE_SPEED)
      }

      if (objActiveKeys.has(KEY_CODE_RIGHT)) {
        objPlayer.x = Math.min(CANVAS_WIDTH - PLAYER_SIZE, objPlayer.x + MOVE_SPEED)
      }

      objPlayerState.dblVelocityY += GRAVITY_FORCE
      objPlayer.y += objPlayerState.dblVelocityY

      const intGroundLevel = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE

      if (objPlayer.y >= intGroundLevel) {
        objPlayer.y = intGroundLevel
        objPlayerState.dblVelocityY = 0
        objPlayerState.blnOnGround = true
      } else {
        objPlayerState.blnOnGround = false
      }
    }

    function fncRemoveListeners() {
      if (blnListenersAttached) {
        window.removeEventListener('keydown', fncHandleKeyDown)
        window.removeEventListener('keyup', fncHandleKeyUp)
        blnListenersAttached = false
      }
    }

    function fncDisposeApplication() {
      if (objTicker) {
        objTicker.remove(fncUpdateGame)
        objTicker = null
      }

      if (objApplication) {
        objApplication.destroy(true, { children: true })
        objApplication = null
      }

      objPlayer = null
      objGround = null
    }

    async function fncInitializeScene() {
      try {
        const objInitializedApplication = await Application.init({
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          background: BACKGROUND_COLOR,
          antialias: true,
        })

        if (blnShouldAbort) {
          objInitializedApplication.destroy(true, { children: true })
          return
        }

        objApplication = objInitializedApplication

        if (!objCanvasContainerRef.current) {
          fncDisposeApplication()
          return
        }

        objCanvasContainerRef.current.appendChild(objApplication.canvas)

        objGround = new Graphics()
        objGround.beginFill(GROUND_COLOR)
        objGround.drawRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT)
        objGround.endFill()
        objApplication.stage.addChild(objGround)

        objPlayer = new Graphics()
        objPlayer.beginFill(PLAYER_COLOR)
        objPlayer.drawRoundedRect(0, 0, PLAYER_SIZE, PLAYER_SIZE, 8)
        objPlayer.endFill()
        objPlayer.x = CANVAS_WIDTH / 2 - PLAYER_SIZE / 2
        objPlayer.y = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE
        objApplication.stage.addChild(objPlayer)

        objTicker = objApplication.ticker ?? null

        if (objTicker) {
          objTicker.add(fncUpdateGame)
        }

        if (!blnListenersAttached) {
          window.addEventListener('keydown', fncHandleKeyDown)
          window.addEventListener('keyup', fncHandleKeyUp)
          blnListenersAttached = true
        }
      } catch (objError) {
        console.error('Failed to initialize PixiJS application', objError)
        fncRemoveListeners()
        fncDisposeApplication()
      }
    }

    fncInitializeScene()

    return () => {
      blnShouldAbort = true
      objActiveKeys.clear()
      fncRemoveListeners()
      fncDisposeApplication()
    }
  }, [])

  return (
    <section
      aria-label="Platformer game canvas"
      className="game-container"
      ref={objCanvasContainerRef}
    />
  )
}

export default GameCanvas
