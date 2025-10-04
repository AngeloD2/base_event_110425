/**
 * System: Base Event Platformer
 * Module: Platform Sprite Helpers
 * Purpose: Create and update PixiJS graphics representing jump platforms
 */
import { Graphics } from 'pixi.js'
import {
  PLATFORM_COLOR,
  PLATFORM_HEIGHT,
} from './gameConstants.js'

export function createPlatformSprite(objStageContainer) {
  if (!objStageContainer) {
    return { success: false, error: 'PlatformStageMissing' }
  }

  const objPlatformGraphic = new Graphics()
  objPlatformGraphic.beginFill(PLATFORM_COLOR)
  objPlatformGraphic.drawRoundedRect(0, 0, PLATFORM_HEIGHT, PLATFORM_HEIGHT, 6)
  objPlatformGraphic.endFill()
  objPlatformGraphic.x = 0
  objPlatformGraphic.y = 0
  objStageContainer.addChild(objPlatformGraphic)

  return { success: true, data: objPlatformGraphic }
}

export function updatePlatformSprite(objPlatformGraphic, objPlatformState) {
  if (!objPlatformGraphic || !objPlatformState) {
    return { success: false, error: 'PlatformSpriteUpdateInvalid' }
  }

  objPlatformGraphic.clear()
  objPlatformGraphic.beginFill(PLATFORM_COLOR)
  objPlatformGraphic.drawRoundedRect(0, 0, objPlatformState.dblWidth, PLATFORM_HEIGHT, 6)
  objPlatformGraphic.endFill()
  objPlatformGraphic.x = objPlatformState.dblPositionX
  objPlatformGraphic.y = objPlatformState.dblPositionY

  return { success: true }
}