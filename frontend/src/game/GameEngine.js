/**
 * System: Base Event Platformer
 * Module: Game Engine
 * Purpose: Orchestrate physics, collision handling, camera scrolling, and score tracking for the platformer
 */
import { Container } from 'pixi.js'
import { createPlayerSprite, updatePlayerSprite } from './PlayerSprite.js'
import { createPlatformSprite, updatePlatformSprite } from './PlatformSprite.js'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BACKGROUND_COLOR,
  CAMERA_SCROLL_TRIGGER_Y,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_HORIZONTAL_SPEED,
  PLAYER_JUMP_VELOCITY,
  GRAVITY_ACCELERATION,
  MAX_FALL_SPEED,
  PLATFORM_POOL_SIZE,
  PLATFORM_VERTICAL_SPACING,
  PLATFORM_HEIGHT,
  PLATFORM_WIDTH_MIN,
  PLATFORM_WIDTH_MAX,
  PLATFORM_RECYCLE_BUFFER,
  PLAYER_START_OFFSET_Y,
  SCORE_PER_PIXEL,
  GAME_OVER_OFFSET,
} from './gameConstants.js'

export function createGameEngine({
  objApplication,
  fncGetControlState,
  fncOnScoreUpdate,
  fncOnGameOver,
}) {
  if (!objApplication || typeof fncGetControlState !== 'function') {
    return { success: false, error: 'GameEngineConfigurationInvalid' }
  }

  const objTicker = objApplication.ticker
  if (!objTicker) {
    return { success: false, error: 'GameEngineTickerMissing' }
  }

  const objStageContainer = new Container()
  objStageContainer.sortableChildren = false

  let objPlayerGraphic = null
  let objPlayerState = null
  let arrPlatformState = []
  let blnInitialized = false
  let blnRunning = false
  let blnGameOver = false
  let dblHighestAltitude = PLAYER_START_OFFSET_Y
  let intScore = 0
  const fncUpdateFrame = () => {
    if (!blnInitialized || blnGameOver) {
      return
    }

    fncApplyControls()

    const dblPreviousY = objPlayerState.dblPositionY
    objPlayerState.dblVelocityY = Math.min(
      objPlayerState.dblVelocityY + GRAVITY_ACCELERATION,
      MAX_FALL_SPEED,
    )
    objPlayerState.dblPositionY += objPlayerState.dblVelocityY

    fncHandleCollisions(dblPreviousY)
    updatePlayerSprite(objPlayerGraphic, objPlayerState)
    fncUpdateScore()
    fncUpdateCamera()
    fncRecyclePlatforms()
    fncCheckGameOver()
  }

  function fncResetPlayerState() {
    objPlayerState = {
      dblPositionX: (CANVAS_WIDTH - PLAYER_WIDTH) / 2,
      dblPositionY: PLAYER_START_OFFSET_Y,
      dblVelocityY: 0,
      dblWidth: PLAYER_WIDTH,
      dblHeight: PLAYER_HEIGHT,
    }
    dblHighestAltitude = objPlayerState.dblPositionY
  }

  function fncRandomWidth() {
    return PLATFORM_WIDTH_MIN + Math.random() * (PLATFORM_WIDTH_MAX - PLATFORM_WIDTH_MIN)
  }

  function fncRebuildPlatforms() {
    arrPlatformState = []
    for (let intIndex = 0; intIndex < PLATFORM_POOL_SIZE; intIndex += 1) {
      const dblWidth = fncRandomWidth()
      const dblPositionY = PLAYER_START_OFFSET_Y + PLAYER_HEIGHT + PLATFORM_HEIGHT - intIndex * PLATFORM_VERTICAL_SPACING
      const dblRange = Math.max(0, CANVAS_WIDTH - dblWidth)
      const dblPositionX = dblRange === 0 ? 0 : Math.random() * dblRange

      const objPlatformCreationResult = createPlatformSprite(objStageContainer)
      if (!objPlatformCreationResult.success) {
        return objPlatformCreationResult
      }

      const objPlatformState = {
        objGraphic: objPlatformCreationResult.data,
        dblPositionX,
        dblPositionY,
        dblWidth,
        dblHeight: PLATFORM_HEIGHT,
      }

      const objPlatformSyncResult = updatePlatformSprite(objPlatformState.objGraphic, objPlatformState)
      if (!objPlatformSyncResult.success) {
        return objPlatformSyncResult
      }

      arrPlatformState.push(objPlatformState)
    }

    return { success: true }
  }

  function fncInitializeStage() {
    if (blnInitialized) {
      return { success: true }
    }

    objApplication.stage.addChild(objStageContainer)
    if (objApplication.renderer && objApplication.renderer.background) {
      objApplication.renderer.background.color = BACKGROUND_COLOR
    }

    fncResetPlayerState()

    const objPlayerCreationResult = createPlayerSprite(objStageContainer)
    if (!objPlayerCreationResult.success) {
      return objPlayerCreationResult
    }

    objPlayerGraphic = objPlayerCreationResult.data

    const objPlatformResult = fncRebuildPlatforms()
    if (!objPlatformResult.success) {
      return objPlatformResult
    }

    const objPlayerSyncResult = updatePlayerSprite(objPlayerGraphic, objPlayerState)
    if (!objPlayerSyncResult.success) {
      return objPlayerSyncResult
    }

    objStageContainer.y = 0
    intScore = 0
    blnInitialized = true
    blnGameOver = false

    if (typeof fncOnScoreUpdate === 'function') {
      fncOnScoreUpdate(intScore)
    }

    return { success: true }
  }

  function fncApplyControls() {
    const objControlState = fncGetControlState() || { blnMovingLeft: false, blnMovingRight: false }

    if (objControlState.blnMovingLeft) {
      objPlayerState.dblPositionX = Math.max(0, objPlayerState.dblPositionX - PLAYER_HORIZONTAL_SPEED)
    }

    if (objControlState.blnMovingRight) {
      objPlayerState.dblPositionX = Math.min(
        CANVAS_WIDTH - objPlayerState.dblWidth,
        objPlayerState.dblPositionX + PLAYER_HORIZONTAL_SPEED,
      )
    }
  }

  function fncHandleCollisions(dblPreviousY) {
    if (objPlayerState.dblVelocityY <= 0) {
      return
    }

    const dblPlayerBottom = objPlayerState.dblPositionY + objPlayerState.dblHeight

    for (const objPlatform of arrPlatformState) {
      const dblPlatformTop = objPlatform.dblPositionY

      if (
        dblPreviousY + objPlayerState.dblHeight <= dblPlatformTop &&
        dblPlayerBottom >= dblPlatformTop &&
        objPlayerState.dblPositionX + objPlayerState.dblWidth > objPlatform.dblPositionX &&
        objPlayerState.dblPositionX < objPlatform.dblPositionX + objPlatform.dblWidth
      ) {
        objPlayerState.dblPositionY = dblPlatformTop - objPlayerState.dblHeight
        objPlayerState.dblVelocityY = PLAYER_JUMP_VELOCITY
        return
      }
    }
  }

  function fncRecyclePlatforms() {
    if (arrPlatformState.length === 0) {
      return
    }

    let dblHighestPlatformY = Number.POSITIVE_INFINITY
    for (const objPlatform of arrPlatformState) {
      dblHighestPlatformY = Math.min(dblHighestPlatformY, objPlatform.dblPositionY)
    }

    for (const objPlatform of arrPlatformState) {
      const dblScreenY = objPlatform.dblPositionY + objStageContainer.y
      if (dblScreenY > CANVAS_HEIGHT + PLATFORM_RECYCLE_BUFFER) {
        objPlatform.dblPositionY = dblHighestPlatformY - PLATFORM_VERTICAL_SPACING
        objPlatform.dblWidth = fncRandomWidth()
        dblHighestPlatformY = objPlatform.dblPositionY
      }

      updatePlatformSprite(objPlatform.objGraphic, objPlatform)
    }
  }

  function fncUpdateScore() {
    if (objPlayerState.dblPositionY < dblHighestAltitude) {
      dblHighestAltitude = objPlayerState.dblPositionY
      const intNewScore = Math.max(0, Math.floor((PLAYER_START_OFFSET_Y - dblHighestAltitude) * SCORE_PER_PIXEL))

      if (intNewScore !== intScore && typeof fncOnScoreUpdate === 'function') {
        intScore = intNewScore
        fncOnScoreUpdate(intScore)
      } else if (intNewScore !== intScore) {
        intScore = intNewScore
      }
    }
  }

  function fncUpdateCamera() {
    const dblPlayerViewportY = objPlayerState.dblPositionY + objStageContainer.y

    if (dblPlayerViewportY < CAMERA_SCROLL_TRIGGER_Y) {
      const dblScrollDelta = CAMERA_SCROLL_TRIGGER_Y - dblPlayerViewportY
      objStageContainer.y += dblScrollDelta
    }
  }

  function fncCheckGameOver() {
    const dblPlayerViewportY = objPlayerState.dblPositionY + objStageContainer.y

    if (dblPlayerViewportY > CANVAS_HEIGHT + GAME_OVER_OFFSET && !blnGameOver) {
      blnGameOver = true
      fncStop()

      if (typeof fncOnGameOver === 'function') {
        fncOnGameOver()
      }
    }
  }

  function fncStart() {
    if (!blnInitialized) {
      const objInitResult = fncInitializeStage()
      if (!objInitResult.success) {
        return objInitResult
      }
    }

    if (blnRunning) {
      return { success: true }
    }

    objTicker.add(fncUpdateFrame)
    blnRunning = true
    blnGameOver = false

    return { success: true }
  }

  function fncStop() {
    if (!blnRunning) {
      return { success: true }
    }

    objTicker.remove(fncUpdateFrame)
    blnRunning = false

    return { success: true }
  }

  function fncClearStage() {
    objStageContainer.removeChildren()
    objPlayerGraphic = null
    arrPlatformState = []
  }

  function fncReset() {
    fncStop()
    fncClearStage()
    objStageContainer.y = 0
    blnInitialized = false
    blnGameOver = false
    intScore = 0

    const objInitResult = fncInitializeStage()
    if (!objInitResult.success) {
      return objInitResult
    }

    if (typeof fncOnScoreUpdate === 'function') {
      fncOnScoreUpdate(intScore)
    }

    return { success: true }
  }

  return {
    success: true,
    data: {
      initializeStage: fncInitializeStage,
      start: fncStart,
      stop: fncStop,
      reset: fncReset,
      getStageContainer: () => objStageContainer,
      getScore: () => intScore,
      isGameOver: () => blnGameOver,
    },
  }
}