/**
 * System: Base Event Platformer
 * Module: Audio Manager
 * Purpose: Handle background music loading, playback, and user controls
 */

export function createAudioManager({
  strAudioPath,
  dblVolumeDefault = 0.3,
  dblVolumeMin = 0,
  dblVolumeMax = 1,
}) {
  if (!strAudioPath) {
    return { success: false, error: 'AudioManagerInvalidPath' }
  }

  let objAudioElement = null
  let blnIsInitialized = false
  let blnIsPlaying = false
  let blnIsMuted = false
  let dblCurrentVolume = dblVolumeDefault
  let blnUserInteractionRequired = true

  const fncInitializeAudio = () => {
    if (blnIsInitialized) {
      return { success: true }
    }

    try {
      objAudioElement = new Audio(strAudioPath)

      objAudioElement.loop = true
      objAudioElement.volume = dblCurrentVolume
      objAudioElement.preload = 'auto'

      objAudioElement.addEventListener('loadstart', () => {
        console.log('Audio loading started')
      })

      objAudioElement.addEventListener('canplaythrough', () => {
        console.log('Audio ready to play')
        blnUserInteractionRequired = false
      })

      objAudioElement.addEventListener('error', (objError) => {
        console.warn('Audio loading failed:', objError)
      })

      objAudioElement.addEventListener('ended', () => {
        if (objAudioElement.loop) {
          objAudioElement.currentTime = 0
          objAudioElement.play().catch((objPlayError) => {
            console.warn('Audio autoplay failed, user interaction may be required:', objPlayError)
            blnUserInteractionRequired = true
          })
        }
      })

      blnIsInitialized = true
      return { success: true }
    } catch (objError) {
      console.error('Failed to initialize audio:', objError)
      return { success: false, error: 'AudioInitializationFailed' }
    }
  }

  const fncPlayMusic = async () => {
    if (!blnIsInitialized) {
      const objInitResult = fncInitializeAudio()
      if (!objInitResult.success) {
        return objInitResult
      }
    }

    if (!objAudioElement) {
      return { success: false, error: 'AudioElementNotAvailable' }
    }

    try {
      if (blnIsPlaying && !objAudioElement.paused) {
        return { success: true }
      }

      await objAudioElement.play()
      blnIsPlaying = true
      blnUserInteractionRequired = false
      return { success: true }
    } catch (objError) {
      console.warn('Music playback failed:', objError)
      blnUserInteractionRequired = true
      return { success: false, error: 'MusicPlaybackFailed' }
    }
  }

  const fncPauseMusic = () => {
    if (!objAudioElement || !blnIsPlaying) {
      return { success: true }
    }

    try {
      objAudioElement.pause()
      blnIsPlaying = false
      return { success: true }
    } catch (objError) {
      console.error('Failed to pause music:', objError)
      return { success: false, error: 'MusicPauseFailed' }
    }
  }

  const fncSetVolume = (dblNewVolume) => {
    const dblClampedVolume = Math.max(dblVolumeMin, Math.min(dblVolumeMax, dblNewVolume))

    if (objAudioElement) {
      objAudioElement.volume = dblClampedVolume
    }

    dblCurrentVolume = dblClampedVolume
    return { success: true, data: dblCurrentVolume }
  }

  const fncSetMuted = (blnMuted) => {
    blnIsMuted = Boolean(blnMuted)

    if (objAudioElement) {
      objAudioElement.muted = blnIsMuted
    }

    return { success: true, data: blnIsMuted }
  }

  const fncToggleMusic = async () => {
    if (blnIsPlaying) {
      return fncPauseMusic()
    } else {
      return fncPlayMusic()
    }
  }

  const fncGetAudioState = () => ({
    blnIsInitialized,
    blnIsPlaying,
    blnIsMuted,
    dblCurrentVolume,
    blnUserInteractionRequired,
    blnCanPlay: objAudioElement ? objAudioElement.readyState >= 3 : false,
  })

  const fncCleanup = () => {
    if (objAudioElement) {
      fncPauseMusic()
      objAudioElement.src = ''
      objAudioElement.load()
      objAudioElement = null
    }

    blnIsInitialized = false
    blnIsPlaying = false
    blnUserInteractionRequired = true
  }

  return {
    success: true,
    data: {
      initializeAudio: fncInitializeAudio,
      playMusic: fncPlayMusic,
      pauseMusic: fncPauseMusic,
      toggleMusic: fncToggleMusic,
      setVolume: fncSetVolume,
      setMuted: fncSetMuted,
      getAudioState: fncGetAudioState,
      cleanup: fncCleanup,
    },
  }
}