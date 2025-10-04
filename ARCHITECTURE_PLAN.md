# Plan: Deliver Platformer Core Loop with Minimal UI

## Context Summary
- **Repository areas:** `frontend/src/components`, `frontend/src/game`, `frontend/src/hooks`
- **Key constraints:** Minimum Viable Approach, Single Responsibility Principle, mandated naming prefixes and Result-pattern errors, PixiJS for gameplay rendering, React + shadcn/ui overlays in neutral palette.
- **Open questions:** None identified; revisit if shadcn/ui setup surfaces blockers.

## Assumptions
- `PLAN.md` remains authoritative: the MVP is the vertical-scrolling platformer; non-game screens wait until after the engine loop is stable.
- Existing helpers in `frontend/src/game` (constants, sprites) are reused by the engine rather than duplicated.
- Tailwind CSS and shadcn/ui will be introduced for lightweight, neutral-toned React UI. All non-game screens (menus, instructions, wallet prompts) will live in React components, not inside Pixi scenes.
- Only the live gameplay scene runs in the Pixi canvas hosted by `GameCanvas`; React controls visibility/state for other experiences.

## Task Steps
1. **Discovery - Confirm current state and dependencies.**
   - Inspect `frontend/package.json` and determine the Tailwind/shadcn scaffolding tasks still outstanding.
   - Review `frontend/src/components/GameCanvas.jsx`, `frontend/src/game/*`, and `frontend/src/App.jsx` to inventory integration points, duplicated constants, and UI hooks.
   - Verify Tailwind config files are absent so their addition is captured in scope.

2. **Design - Lock minimal architecture decisions.**
   - **Engine orchestration:** Constrain Pixi concerns to `GameCanvas`; move physics/state/ticker logic into a new `GameEngine` module that composes `PlayerSprite` and `PlatformSprite` helpers.
   - **Input handling:** Produce a `useKeyboardControls` hook that returns a Result wrapping normalized control flags while honoring naming prefixes and cleanup requirements.
   - **Gameplay UI boundary:** Keep Pixi responsible only for in-canvas entities; expose engine state (score, status) to React via callbacks or refs so React renders overlays and other screens.
   - **React screens:** Plan future non-game experiences (menu, instructions, wallet) as shadcn/ui-based React components or routes that conditionally hide the canvas. For now, prepare minimal overlay scaffolding (scoreboard, restart button) in neutral tones.
   - **Styling system:** Introduce Tailwind config compatible with Vite, wire shadcn/ui styles, and document utility class usage limits to avoid over-styling beyond the neutral baseline.

3. **Implementation - Enumerate single-responsibility changes.**
   - Add Tailwind CSS support (`tailwind.config.js`, `postcss.config.js`, CSS entry updates) and install shadcn/ui, generating only the components required for scoreboard/control overlays.
   - Create `frontend/src/hooks/useKeyboardControls.js` with prefixed state variables, Result-pattern returns, and effect cleanup.
   - Create `frontend/src/game/GameEngine.js` that initializes state, runs the ticker, coordinates sprite helpers, and exposes `{ initializeStage, start, stop, reset, getSnapshot }` methods returning Result objects to surface engine status to React.
   - Refactor `frontend/src/components/GameCanvas.jsx` to instantiate `GameEngine`, forward keyboard Result data, read constants from `gameConstants.js`, and limit itself to Pixi lifecycle management.
   - Adjust `PlayerSprite` and `PlatformSprite` only as needed for engine integration (e.g., width metadata) while preserving Result responses and mandated headers.
   - Build a minimal React overlay (e.g., `ScoreboardOverlay.jsx`) with shadcn/ui components that displays score, status messages, and restart control using neutral greyscale tokens, and ensure it conditionally hides when other React pages (to be added later) are active.

4. **Validation - Tests, linting, and manual checks.**
   - Run `npm run lint` and `npm run build` within `frontend` to validate ESLint and Vite after adding Tailwind/shadcn and refactoring engine code.
   - Manually confirm: Pixi canvas mounts/tears down cleanly, keyboard input affects gameplay, score increases appropriately, restart resets state, and React overlays render correctly with neutral colors on desktop and mobile. Ensure hiding the canvas for non-game React screens leaves no residual Pixi state.

5. **Documentation & wrap-up - Capture decisions and follow-ups.**
   - Update `README.md` and `PLAN.md` with notes on Tailwind + shadcn integration, the GameEngine responsibilities, keyboard control expectations, and the separation between Pixi gameplay and React-driven screens.
   - Log future tasks for adding React-based menu/instructions flows once the core loop is validated.

## Validation Checklist
- [ ] File headers (`System`, `Module`, `Purpose`) present or updated in every touched source file.
- [ ] Naming prefixes and Result-pattern error handling applied across new logic.
- [ ] Tailwind + shadcn/ui integrated with neutral palette and limited component footprint; non-game screens remain React-based.
- [ ] `npm run lint` and `npm run build` executed with results recorded.
- [ ] Manual gameplay and overlay checks completed, including canvas hide/show when React screens take over.

## Risk and Confidence
- **Confidence:** Medium. Architectural alignment is solid, but Tailwind/shadcn onboarding and new engine boundaries introduce moderate integration risk.

## Mandatory Quality Directive
"Before you respond, develop an internal rubric for what defines a "world-class" and "industry-standard" answer to my request (task, analysis, or problem solving). Then internally iterate and refine the draft until it scores top marks against your rubric. Provide only the final perfected output. Always provide a comprehensive and detailed breakdown. Always think hard about the given topic, problem, and the solution. Always flag the responses that you are not confident so that I can research it further. Always use industry standard, best practices, and professional recommendations when programming. Always search and use the latest documentations and information regarding programming technologies as of the date of the conversation. Always ask for further clarifications whenever requirements, constraints, or expectations are unclear instead of relying on assumptions."
