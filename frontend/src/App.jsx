/**
 * System: Base Event Platformer
 * Module: Application Shell
 * Purpose: Present the platformer layout and delegate rendering to PixiJS
 */
import './App.css'
import GameCanvas from './components/GameCanvas.jsx'

function App() {
  return (
    <main className="app-shell">
      <h1 className="app-title">Base Event Platformer</h1>
      <p className="app-description">Use the arrow keys to move and the space bar to jump.</p>
      <GameCanvas />
    </main>
  )
}

export default App
