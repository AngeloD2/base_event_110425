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
    <main className="flex justify-center h-dvh w-dvw">
      <PrivyWrapper>
        <div className="flex flex-col md:flex-row max-h-[400px] max-w-[600px]">
          <div className='w-dvw lg:w-1/3 lg:h-dvh lg:space-y-12 flex flex-col justify-center'>
            <div>
              <p className="text-sm">Use the arrow keys or A / D to navigate between platforms.</p>
              <h1 className="text-lg">Base Event Platformer</h1>
            </div>
            <WalletConnect />
          </div>
          <div className='w-dvw lg:w-2/3 lg:pt-24'>
            <GameCanvas />
          </div>
        </div>
        <MusicPlayer />
      </PrivyWrapper>
    </main>
  )
}

export default App