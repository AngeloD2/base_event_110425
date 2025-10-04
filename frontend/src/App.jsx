/**
 * System: Base Event Platformer
 * Module: Application Shell
 * Purpose: Present the platformer layout and delegate rendering to PixiJS
 */
import './App.css'
import { PrivyWrapper } from './providers/provider.jsx'
import GameCanvas from './components/GameCanvas.jsx'
import MusicPlayer from './components/MusicPlayer.jsx'
import WalletConnect from './components/WalletConnect.jsx'

function App() {
  return (
    <main className="app-shell">
      <PrivyWrapper>
        <p className="app-description">Use the arrow keys or A / D to navigate between platforms.</p>
        <h1 className="app-title">Base Event Platformer</h1>
        <div className="flex flex-row">
          <WalletConnect />
          <GameCanvas />
        </div>
        <MusicPlayer />
      </PrivyWrapper>
    </main>
  )
}

export default App