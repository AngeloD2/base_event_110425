/**
 * System: Base Event Platformer
 * Module: Platform Sprite Helpers
 * Purpose: Create and update PixiJS graphics representing jump platforms
 */
import { Sprite, Texture } from 'pixi.js'
import { PLATFORM_HEIGHT } from './gameConstants.js'

export function createPlatformSprite(objStageContainer) {
  if (!objStageContainer) {
    return { success: false, error: 'PlatformStageMissing' }
  }

  const objPlatformSprite = new Sprite(Texture.from('platform'))
  objPlatformSprite.height = PLATFORM_HEIGHT
  objPlatformSprite.x = 0
  objPlatformSprite.y = 0
  objStageContainer.addChild(objPlatformSprite)

  return { success: true, data: objPlatformSprite }
}

export function updatePlatformSprite(objPlatformSprite, objPlatformState) {
  if (!objPlatformSprite || !objPlatformState) {
    return { success: false, error: 'PlatformSpriteUpdateInvalid' }
  }

  const blnIsActive = objPlatformState.blnActive !== false
  objPlatformSprite.visible = blnIsActive

  if (blnIsActive) {
    objPlatformSprite.width = objPlatformState.dblWidth
  }

  objPlatformSprite.x = objPlatformState.dblPositionX
  objPlatformSprite.y = objPlatformState.dblPositionY

  return { success: true }
}