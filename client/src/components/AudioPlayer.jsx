import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

const AudioPlayer = ({ config }) => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showPlayOverlay, setShowPlayOverlay] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Set audio source if configured
    if (config.audioUrl) {
      audio.src = config.audioUrl
      audio.loop = config.audioLoop !== false
      audio.volume = config.audioVolume || 0.5
    }

    // Try autoplay on load
    const tryAutoplay = async () => {
      if (config.audioUrl && config.audioAutoplay !== false) {
        try {
          audio.muted = true // Start muted for autoplay
          await audio.play()
          setIsPlaying(true)
          setShowPlayOverlay(true) // Show overlay to enable sound
        } catch (error) {
          console.log('Autoplay blocked:', error)
          setShowPlayOverlay(true)
        }
      }
    }

    // Audio event listeners
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

    // Try autoplay after a short delay
    setTimeout(tryAutoplay, 1000)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [config])

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
    
    if (newMuted === false && showPlayOverlay) {
      setShowPlayOverlay(false)
      setHasUserInteracted(true)
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
      
      if (!isPlaying) {
        await audio.play()
      }
    } catch (error) {
      console.error('Failed to enable sound:', error)
    }
  }

  // Don't render if no audio URL is configured
  if (!config.audioUrl) {
    return null
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        preload="auto"
        style={{ display: 'none' }}
      />

      {/* Play Overlay */}
      {showPlayOverlay && (
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

      {/* Floating Audio Controls */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="flex items-center space-x-2 bg-dark-900/95 backdrop-blur-md border border-dark-700 rounded-lg p-3 shadow-xl">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-primary-400 transition-all duration-300"
            title={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Mute/Unmute Button */}
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
