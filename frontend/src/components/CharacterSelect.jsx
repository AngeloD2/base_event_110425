/**
 * System: Base Event Platformer
 * Module: Character Selection Component
 * Purpose: Allow player to choose character before game starts
 */
import { useState } from 'react'
import './CharacterSelect.css'

const CHARACTERS = [
  {
    id: 'cat-blue',
    name: 'Blue Cat',
    imagePath: '/cat-blue.png',
    color: '#4A90E2'
  },
  {
    id: 'cat-orange',
    name: 'Orange Cat',
    imagePath: '/cat-orange.png',
    color: '#FF6B35'
  },
  {
    id: 'cat-purple',
    name: 'Purple Cat',
    imagePath: '/cat-purple.png',
    color: '#8A4FFF'
  }
]

function CharacterSelect({ onCharacterSelect }) {
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character)
  }

  const handleConfirmSelection = () => {
    if (selectedCharacter && onCharacterSelect) {
      onCharacterSelect(selectedCharacter)
    }
  }

  return (
    <div className="character-select-backdrop" role="dialog" aria-modal="true">
      <div className="character-select-modal">
        <h2 className="character-select-title">Choose Your Character</h2>
        <p className="character-select-subtitle">Select a character to start your adventure</p>
        
        <div className="character-grid">
          {CHARACTERS.map((character) => (
            <div
              key={character.id}
              className={`character-card ${
                selectedCharacter?.id === character.id ? 'character-card--selected' : ''
              }`}
              onClick={() => handleCharacterSelect(character)}
            >
              <div 
                className="character-image-container"
                style={{ borderColor: character.color }}
              >
                <img 
                  src={character.imagePath} 
                  alt={character.name}
                  className="character-image"
                  onError={(e) => {
                    console.warn(`Failed to load character image: ${character.imagePath}`)
                    e.target.style.display = 'none'
                  }}
                />
              </div>
              <h3 className="character-name">{character.name}</h3>
              <div 
                className="character-color-indicator"
                style={{ backgroundColor: character.color }}
              />
            </div>
          ))}
        </div>

        <button
          className="character-confirm-button"
          onClick={handleConfirmSelection}
          disabled={!selectedCharacter}
        >
          Start Game as {selectedCharacter?.name || 'Select Character'}
        </button>
      </div>
    </div>
  )
}

export default CharacterSelect