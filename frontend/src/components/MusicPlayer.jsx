import { useCallback, useEffect, useRef, useState } from 'react'

const trackList = [
    { title: "Game of Mind (Tetris Theme - Remastered)", url: "https://ohara-assets.s3.us-east-2.amazonaws.com/WJL-+game+of+mind+(tetris+theme+original+mix+remastered).wav.mp3" },
    { title: "Tetris Theme Type B", url: "https://ohara-assets.s3.us-east-2.amazonaws.com/tetris-theme-type-b.mp3" },
    { title: "Tetris Type B - Remix 8", url: "https://ohara-assets.s3.us-east-2.amazonaws.com/tetris-theme-type-b-8.mp3" },
    { title: "Tetris Type B - Remix 7", url: "https://ohara-assets.s3.us-east-2.amazonaws.com/tetris-theme-type-b-7.mp3" },
    { title: "Classic Tetris Theme", url: "https://ohara-assets.s3.us-east-2.amazonaws.com/Tetris+Theme.mp3" },
    { title: "Tetris Theme (Trap Remix)", url: "https://ohara-assets.s3.us-east-2.amazonaws.com/Tetris+Theme+Song+Trap+Remix.mp3" },
    { title: "Tetris Theme Loop (Techno)", url: "https://ohara-assets.s3.us-east-2.amazonaws.com/Tetris+Theme+Loop+(Techno).mp3" },
    { title: "Fight Theme (Looped)", url: "https://ohara-assets.s3.us-east-2.amazonaws.com/fight_looped.wav" },
    { title: "8-bit Bossa", url: "https://ohara-assets.s3.us-east-2.amazonaws.com/8bit+Bossa.mp3" }
]

const DEFAULT_VOLUME = 0.2
const FADE_INTERVAL = 50
const FADE_STEP = 0.03

const getRandomIndex = (length) => Math.floor(Math.random() * length)

const MusicPlayer = () => {
    const [trackIndex, setTrackIndex] = useState(() => getRandomIndex(trackList.length))
    const [showTitle, setShowTitle] = useState(false)
    const [muted, setMuted] = useState(false)
    const audioRef = useRef(null)
    const hasStartedRef = useRef(false)

    const fadeOut = useCallback((callback) => {
        const audio = audioRef.current
        if (!audio) return
        let volume = audio.volume
        const interval = setInterval(() => {
            if (volume > FADE_STEP) {
                volume -= FADE_STEP
                audio.volume = Math.max(0, volume)
            } else {
                clearInterval(interval)
                audio.volume = 0
                callback()
            }
        }, FADE_INTERVAL)
    }, [])

    const fadeIn = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return
        let volume = 0
        audio.volume = 0
        const interval = setInterval(() => {
            if (volume < DEFAULT_VOLUME) {
                volume += FADE_STEP
                audio.volume = Math.min(DEFAULT_VOLUME, volume)
            } else {
                clearInterval(interval)
            }
        }, FADE_INTERVAL)
    }, [])

    const playTrack = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return
        audio.src = trackList[trackIndex].url
        audio.load()

        const attemptPlay = () => {
            if (audio.readyState >= 3) {
                audio.volume = DEFAULT_VOLUME
                audio.play().then(() => {
                    fadeIn()
                    setShowTitle(true)
                }).catch((err) => {
                    console.warn('Autoplay failed:', err)
                })
            } else {
                setTimeout(attemptPlay, 100)
            }
        }

        attemptPlay()
    }, [trackIndex, fadeIn])

    const handleFirstClick = useCallback(() => {
        if (hasStartedRef.current) return
        hasStartedRef.current = true
        playTrack()
        window.removeEventListener('click', handleFirstClick)
        window.removeEventListener('touchstart', handleFirstClick)
    }, [playTrack])

    useEffect(() => {
        window.addEventListener('click', handleFirstClick)
        window.addEventListener('touchstart', handleFirstClick)

        return () => {
            window.removeEventListener('click', handleFirstClick)
            window.removeEventListener('touchstart', handleFirstClick)
        }
    }, [handleFirstClick])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handleEnded = () => {
            fadeOut(() => {
                const next = getRandomIndex(trackList.length)
                setTrackIndex(next)
                setShowTitle(true)
                playTrack()
            })
        }

        audio.addEventListener('ended', handleEnded)
        return () => audio.removeEventListener('ended', handleEnded)
    }, [trackIndex, playTrack, fadeOut])

    useEffect(() => {
        if (showTitle) {
            const timeout = setTimeout(() => setShowTitle(false), 3000)
            return () => clearTimeout(timeout)
        }
    }, [showTitle])

    return (
        <>
            <audio ref={audioRef} />

            {showTitle && (
                <div className="fixed top-[70px] left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black text-white text-sm rounded-lg shadow-md z-50">
                    Now Playing: {trackList[trackIndex].title}
                </div>
            )}

            {/* Mute Toggle */}
            <div className="fixed top-4 left-4 z-50">
                <button
                    onClick={() => {
                        const audio = audioRef.current
                        if (!audio) return
                        audio.muted = !audio.muted
                        setMuted(audio.muted)
                    }}
                    className="transition duration-200 bg-blue-600 text-yellow-300 font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105"
                >
                    {muted ? '🔇 Unmute' : '🔊 Mute'}
                </button>
            </div>
        </>
    )
}

export default MusicPlayer