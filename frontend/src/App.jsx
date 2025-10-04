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
      <GameCanvas />
    </main>
  )
}

export default App