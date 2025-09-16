import React, { useState } from 'react'
import { Volume2, VolumeX, Settings, Twitter, TrendingUp, Zap } from 'lucide-react'

const Header = ({ config, onToggleAdmin, showAdmin }) => {
  const [isMuted, setIsMuted] = useState(false)

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // Audio control will be handled by AudioPlayer component
  }

  const socialLinks = config.socialLinks || {
    twitter: '#',
    dexscreener: '#',
    pumpfun: '#'
  }

  return (
    <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-dark-700">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-neon-gradient rounded-lg flex items-center justify-center">
              <span className="text-dark-950 font-bold text-lg">NS</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-primary-500 text-glow">
              {config.title || 'NIGGA SCIENCE'}
            </h1>
          </div>
        </div>

        {/* Social Links and Controls */}
        <div className="flex items-center space-x-4">
          {/* Social Links */}
          <div className="hidden md:flex items-center space-x-3">
            <a 
              href={socialLinks.twitter} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-400 transition-colors duration-300"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a 
              href={socialLinks.dexscreener} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-400 transition-colors duration-300"
              aria-label="Dexscreener"
            >
              <img 
                src="/dexscreener-icon.svg" 
                alt="Dexscreener" 
                width="20" 
                height="20"
                className="w-5 h-5"
              />
            </a>
            <a 
              href={socialLinks.pumpfun} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-400 transition-colors duration-300"
              aria-label="Pump Fun"
            >
              <img 
                src="/pumpfun-icon.svg" 
                alt="Pump Fun" 
                width="20" 
                height="20"
                className="w-5 h-5"
              />
            </a>
          </div>

          {/* Audio Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-primary-400 transition-all duration-300"
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* Admin Panel Toggle */}
          <button
            onClick={onToggleAdmin}
            className={`p-2 rounded-lg transition-all duration-300 ${
              showAdmin 
                ? 'bg-primary-500 text-dark-950' 
                : 'bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-primary-400'
            }`}
            aria-label="Toggle admin panel"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
