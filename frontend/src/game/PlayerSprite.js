/**
 * System: Base Event Platformer
 * Module: Player Sprite Helpers
 * Purpose: Manage creation and synchronization of the player PixiJS graphics object
 */
import { Graphics } from 'pixi.js'
import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_COLOR,
} from './gameConstants.js'

export function createPlayerSprite(objStageContainer) {
  if (!objStageContainer) {
    return { success: false, error: 'PlayerStageMissing' }
  }

  const objPlayerGraphic = new Graphics()
  objPlayerGraphic.beginFill(PLAYER_COLOR)
  objPlayerGraphic.drawRoundedRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT, 10)
  objPlayerGraphic.endFill()
  objPlayerGraphic.x = 0
  objPlayerGraphic.y = 0
  objStageContainer.addChild(objPlayerGraphic)

  return { success: true, data: objPlayerGraphic }
}

export function updatePlayerSprite(objPlayerGraphic, objPlayerState) {
  if (!objPlayerGraphic || !objPlayerState) {
    return { success: false, error: 'PlayerSpriteUpdateInvalid' }
  }

  objPlayerGraphic.x = objPlayerState.dblPositionX
  objPlayerGraphic.y = objPlayerState.dblPositionY

  return { success: true }
}