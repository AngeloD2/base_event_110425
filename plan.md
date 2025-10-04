# Plan to Implement Change Player Skin Feature

This document outlines the plan to add a feature that allows players to change their character's skin in the Base Event Platformer game.

## 1. Prepare Player Skin Assets

- Add a top-level `assets/skins` directory to keep visual assets outside of the framework tree as required.
- Produce `48x48` PNG textures for the default player skin and at least two alternates (for example, `default.png`, `coolBlue.png`, `awesomeRed.png`).
- Export those textures so the frontend can reference them (e.g., `frontend/src/assets/skins/index.js` can re-export each file path). Ensure the public bundle ultimately serves the textures at stable URLs (copy step or bundler import) before wiring them into the game.

## 2. Update Game Constants

- In `frontend/src/game/gameConstants.js`, import the exported skin textures and define the available player skins:

    import { strDefaultSkin, strCoolBlueSkin, strAwesomeRedSkin } from '../assets/skins/index.js';

    export const PLAYER_SKINS = {
      default: {
        name: 'Default',
        texture: strDefaultSkin,
      },
      coolBlue: {
        name: 'Cool Blue',
        texture: strCoolBlueSkin,
      },
      awesomeRed: {
        name: 'Awesome Red',
        texture: strAwesomeRedSkin,
      },
    };

- Add or update the file header comment while touching this file to keep it compliant with project conventions.

## 3. Modify PlayerSprite.js

- Update `createPlayerSprite` to accept a `strSkinTexture` parameter and return a `Result` object that signals success or failure.
- Replace the existing rectangle drawing logic with a `Sprite` that uses the provided texture via `Texture.from`.
- When texture creation fails, return `{ success: false, error: 'PlayerSkinUnavailable' }` so the caller can handle it cleanly.
- Preserve or add the required file header comment if missing.

    import { Sprite, Texture } from 'pixi.js';

    export function createPlayerSprite(objStageContainer, strSkinTexture) {
      if (!objStageContainer) {
        return { success: false, error: 'PlayerStageMissing' };
      }

      const objTexture = Texture.from(strSkinTexture);
      const objPlayerSprite = new Sprite(objTexture);

      // Configure sprite position and dimensions here.

      objStageContainer.addChild(objPlayerSprite);
      return { success: true, data: objPlayerSprite };
    }

## 4. Modify GameEngine.js

- Allow `createGameEngine` to accept a `strSelectedSkin` value.
- Pass `strSelectedSkin` into `createPlayerSprite` and, if creation fails, surface the error early (e.g., return the failure `Result` or log it and prevent engine startup) rather than proceeding with an undefined sprite.

    export function createGameEngine({
      // ... other params
      strSelectedSkin,
    }) {
      function fncInitializeStage() {
        const objPlayerCreationResult = createPlayerSprite(objStageContainer, strSelectedSkin);
        if (!objPlayerCreationResult.success) {
          return objPlayerCreationResult;
        }

        const objPlayerSprite = objPlayerCreationResult.data;
        // ... continue initialization
        return { success: true };
      }

      // ...
    }

## 5. Modify GameCanvas.jsx

- Introduce local state for the selected skin ID, defaulting to `'default'`.
- Render a select element that lists the entries from `PLAYER_SKINS`. Remember to use `className` in JSX samples.
- When the user changes skins, update state only; do not call the existing restart handler directly.
- Pass the selected skin’s texture into `createGameEngine` when constructing the engine.

    import { useState, useEffect } from 'react';
    import { PLAYER_SKINS } from '../game/gameConstants.js';

    function GameCanvas() {
      const [strSelectedSkinId, setStrSelectedSkinId] = useState('default');

      const fncHandleSkinChange = (objEvent) => {
        setStrSelectedSkinId(objEvent.target.value);
      };

      useEffect(() => {
        // Tear down prior engine instance (if any) and create a new one using
        // PLAYER_SKINS[strSelectedSkinId].texture.
      }, [strSelectedSkinId]);

      return (
        <section className="game-container">
          <div className="game-controls">
            <select onChange={fncHandleSkinChange} value={strSelectedSkinId}>
              {Object.entries(PLAYER_SKINS).map(([strKey, objSkin]) => (
                <option key={strKey} value={strKey}>
                  {objSkin.name}
                </option>
              ))}
            </select>
          </div>
          {/* Other UI */}
        </section>
      );
    }

## 6. Refine Restart and Lifecycle Logic

- Update the initialization `useEffect` in `GameCanvas.jsx` so it depends on `strSelectedSkinId`. The effect is responsible for cleaning up the old engine and creating a new one with the current skin texture.
- With the effect handling reinitialization, adjust `fncHandleRestart` (if still needed) to delegate to a shared teardown/start helper rather than reusing obsolete engine instances.
- Verify that the engine cleanup still runs on unmount to avoid leaked Pixi resources.

This refined plan keeps the feature implementation minimal while aligning with project conventions and ensuring error handling, asset placement, and JSX snippets are correct.
