import React from 'react'

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background GIF */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/bg.gif)',
          filter: 'brightness(0.3)'
        }}
      />
      
      {/* Matrix Green Text Overlay */}
      <div className="relative z-10 text-center">
        {/* Main Logo/Title */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-green-400 animate-pulse drop-shadow-lg" 
              style={{ 
                textShadow: '0 0 10px #10b981, 0 0 20px #10b981, 0 0 30px #10b981',
                fontFamily: 'monospace'
              }}>
            NIGGA
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-green-300 mt-2 drop-shadow-lg"
              style={{ 
                textShadow: '0 0 10px #34d399, 0 0 20px #34d399',
                fontFamily: 'monospace'
              }}>
            SCIENCE
          </h2>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center items-center space-x-2 mb-8">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" 
               style={{ boxShadow: '0 0 10px #10b981' }}></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" 
               style={{ animationDelay: '0.1s', boxShadow: '0 0 10px #10b981' }}></div>
          <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" 
               style={{ animationDelay: '0.2s', boxShadow: '0 0 10px #10b981' }}></div>
        </div>

        {/* Loading Text */}
        <p className="text-xl text-green-300 font-medium animate-pulse font-mono"
           style={{ textShadow: '0 0 5px #34d399' }}>
          Loading the future of science...
        </p>
      </div>
    </div>
  )
}

export default LoadingScreen
