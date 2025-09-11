import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

const AudioPlayer = ({ config }) => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showPlayOverlay, setShowPlayOverlay] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(() => {
    try {
      return localStorage.getItem('audioEnabled') === 'true'
    } catch {
      return false
    }
  })

  const audioUrl = config.audioUrl || ''
  const audioAutoplay = config.audioAutoplay !== false
  const audioLoop = config.audioLoop !== false
  const audioVolume = typeof config.audioVolume === 'number' ? config.audioVolume : 0.5

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Compute absolute URL for reliable comparison
    const desiredSrc = audioUrl ? new URL(audioUrl, window.location.origin).href : ''

    // Only set src if it actually changed to avoid restarts
    if (desiredSrc && audio.src !== desiredSrc) {
      audio.src = desiredSrc
    }

    // Always ensure loop/volume reflect config without restarting
    audio.loop = audioLoop
    audio.volume = audioVolume

    const resumeWithSoundIfAllowed = async () => {
      if (!desiredSrc) return
      if (hasUserInteracted) {
        try {
          audio.muted = false
          setIsMuted(false)
          setShowPlayOverlay(false)
          // Try to play, but do not force errors to surface
          await audio.play().catch(() => {})
          setIsPlaying(!audio.paused)
        } catch {
          // ignore
        }
        return
      }

      if (!audioAutoplay) return

      try {
        audio.muted = true
        await audio.play()
        setIsPlaying(true)
        setShowPlayOverlay(true)
      } catch {
        setShowPlayOverlay(true)
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)
    const handleError = (e) => {
      console.error('Audio error:', e)
      setIsPlaying(false)
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    setTimeout(resumeWithSoundIfAllowed, 300)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  // Depend only on values that matter, not the whole config object
  }, [audioUrl, audioAutoplay, audioLoop, audioVolume, hasUserInteracted])

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
      } else {
        await audio.play()
      }
    } catch (error) {
      console.error('Audio play/pause error:', error)
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    const newMuted = !isMuted
    audio.muted = newMuted
    setIsMuted(newMuted)

    if (newMuted === false) {
      try { localStorage.setItem('audioEnabled', 'true') } catch {}
      if (showPlayOverlay) setShowPlayOverlay(false)
      if (!hasUserInteracted) setHasUserInteracted(true)
    }
  }

  const enableSound = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      audio.muted = false
      setIsMuted(false)
      setShowPlayOverlay(false)
      setHasUserInteracted(true)
      try { localStorage.setItem('audioEnabled', 'true') } catch {}

      if (!isPlaying) {
        await audio.play()
      }
    } catch (error) {
      console.error('Failed to enable sound:', error)
    }
  }

  if (!audioUrl) {
    return null
  }

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        style={{ display: 'none' }}
      />

      {showPlayOverlay && !hasUserInteracted && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="card max-w-md text-center">
            <h3 className="text-xl font-heading font-bold text-primary-500 mb-4">
              Enable Sound
            </h3>
            <p className="text-gray-300 mb-6">
              Click the button below to enable audio for the best experience.
            </p>
            <button
              onClick={enableSound}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <Volume2 size={20} />
              <span>Enable Sound</span>
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-30">
        <div className="flex items-center space-x-2 bg-dark-900/95 backdrop-blur-md border border-dark-700 rounded-lg p-3 shadow-xl">
          <button
            onClick={togglePlayPause}
            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-primary-400 transition-all duration-300"
            title={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-primary-400 transition-all duration-300"
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
    </>
  )
}

export default AudioPlayer
