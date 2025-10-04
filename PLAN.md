# Platformer Game Architectural Plan

This document outlines the plan for creating a simple platformer game, similar to "Doodle Jump" or "Icy Tower".

## 1. Core Philosophy

- **Minimum Viable Product (MVP):** Start with the simplest possible implementation and iterate.
- **Focus on Logic:** Prioritize game mechanics and physics over aesthetics.
- **Leverage Existing Stack:** Use PixiJS for rendering to avoid duplicating canvas-ticker logic that the framework already solves.
- **Repository Standards:** Respect naming prefixes, file headers, and the Result-pattern guidance when modeling functions that can fail.

## 2. Project Setup

- **Framework:** React + Vite application under `frontend`.
- **Rendering:** PixiJS `Application` embedded through a React component; prefer built-ins before introducing additional packages.
- **Language:** JavaScript (ES6+). Keep modules small and cohesive.
- **Assets:** Continue using geometric primitives rendered via Pixi `Graphics`; defer textures until needed.

## 3. Game Modules

- **`GameCanvas.jsx`:** React component responsible for mounting/unmounting the Pixi `Application`, wiring the ticker, and exposing a minimal interface for the engine to register update callbacks.
- **`GameEngine.js`:** Orchestrates the game loop data model. Manages physics, collision checks, score tracking, and delegates drawing to entity modules.
- **`PlayerSprite.js`:** Encapsulates creation and updates of the player display object. Expose helpers to sync Pixi graphics with player state.
- **`PlatformSprite.js`:** Manages platform graphics creation and positioning.
- **`gameConstants.js`:** Stores shared constants (e.g., gravity, jump strength, canvas dimensions) using uppercase symbolic names. Avoid literal magic numbers elsewhere.
- **`useKeyboardControls.js`:** React hook that manages keyboard state, adheres to setup/cleanup requirements, and returns a Result describing whether mapping succeeded when keys are unsupported.

All new modules must begin with the mandated file header (`System`, `Module`, `Purpose`). Variable names must follow the given prefixes (e.g., `intScore`, `objPlayerState`, `arrPlatforms`).

## 4. Implementation Steps

### Step 1: Pixi Stage Setup

1. **Create Pixi Host Component (`GameCanvas.jsx`):**
   - Render a `div` container using `useRef` to hold the Pixi view.
   - Inside `useEffect`, instantiate `PIXI.Application` with width/height constants from `gameConstants.js`.
   - Append the Pixi canvas to the container and register a ticker callback that the engine provides.
   - Return a cleanup function that stops the ticker, destroys the application, removes listeners, and clears the container.

### Step 2: Core Engine Skeleton (`GameEngine.js`)

1. Define the engine factory that receives the Pixi `Application`, ticker, and keyboard state hook output.
2. Initialize state objects with prefixed names (`objPlayerState`, `arrPlatformState`).
3. Expose methods: `initializeStage`, `start`, `stop`, and `reset`. Each should return a Result indicating success or failure, keeping error handling explicit.
4. Bind the ticker to call an `update` function that advances physics, handles collisions, and then syncs entity graphics.

### Step 3: Entity Modules

1. **`PlayerSprite.js`:**
   - Provide `createPlayerSprite` that builds a Pixi `Graphics` rectangle, sets anchor points, and attaches to the stage container returned by the engine.
   - Provide `updatePlayerSprite` to position the sprite using the current state values.
2. **`PlatformSprite.js`:**
   - Offer `createPlatformSprite` and `updatePlatformSprite` helpers. Use a recycling approach (hide or reposition) before creating new objects to stay minimal.

### Step 4: Keyboard Controls

1. Implement `useKeyboardControls` hook:
   - Track pressed keys using state with prefixed names (e.g., `objKeyMap`).
   - Register `keydown`/`keyup` listeners in `useEffect`, ensuring cleanup on unmount.
   - Normalize inputs to a small set of allowed controls (`ArrowLeft`, `ArrowRight`, `KeyA`, `KeyD`).
   - Return `{ success: true, data: { blnMovingLeft, blnMovingRight } }` on supported browsers; otherwise return `{ success: false, error: 'UnsupportedControls' }` for transparency.
   - Downstream callers must branch on the Result before using the flags.

### Step 5: Physics, Platforms, and Collision Logic

1. **Physics:** Update `objPlayerState` velocity using constants (e.g., `GRAVITY_ACCELERATION`). Clamp maximum fall speed to avoid tunneling.
2. **Platform Pool:** Maintain `arrPlatformState` with objects containing positions and widths. Generate initial platforms evenly, then spawn replacements above when the player surpasses a threshold.
3. **Collision Detection:**
   - Only check collisions while the player is descending.
   - Treat a collision as valid when the player's previous frame bottom was above a platform and current bottom intersects the top surface.
   - On collision, set `dblVerticalVelocity` to the jump constant and snap the player to the platform top to prevent sinking.

### Step 6: Camera and Score Handling

1. Emulate vertical scrolling by adjusting stage container `y` offset once the player rises above a midpoint threshold.
2. Track `intScore` as the maximum vertical distance reached. Update displayed text via a Pixi `Text` object or a React overlay.
3. When the player falls below the bottom of the visible playfield, trigger a game over state and pause ticker updates.

### Step 7: UI Layer

1. Overlay score and status elements using React DOM positioned above the Pixi canvas. Keep typography simple (Arial / sans-serif, greyscale palette).
2. Provide a restart button that calls the engine `reset` method and resumes the ticker.
3. Ensure the UI reacts to Result errors from the controls hook by showing a small warning message if controls could not be bound.

## 5. Validation Checklist

- Ensure each module owns one responsibility and uses mandated naming prefixes.
- Verify Pixi `Application` is cleaned up on React unmount to prevent memory leaks.
- Confirm physics constants and configuration live in `gameConstants.js`.
- Run `npm run lint` and `npm run typecheck` (if available) from the `frontend` workspace. Add focused unit tests if logic becomes complex enough to justify them.
- Manually confirm keyboard input, jump physics, spawn of new platforms, score incrementing, and restart flow.

## 6. Future Iteration Hooks

- Add audio cues, sprite textures, and more intricate platform behaviors only after the MVP is stable.
- Consider extracting platform generation into its own module once multiple platform types exist.
- Explore accessibility (touch controls, difficulty tuning) after the keyboard baseline is verified.
