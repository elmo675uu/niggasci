import React, { useState, useEffect } from 'react'

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Initializing...')

  useEffect(() => {
    const loadingSteps = [
      { progress: 50, text: 'Loading NIGGA SCIENCE...' },
      { progress: 100, text: 'Ready!' }
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep]
        setProgress(step.progress)
        setLoadingText(step.text)
        currentStep++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          onComplete()
        }, 100) // Very fast completion
      }
    }, 100) // Much faster steps

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-6">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary-500 mb-2">
            NIGGA SCIENCE
          </h1>
          <p className="text-gray-400 text-sm">Imageboard Loading...</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{loadingText}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>

        {/* Loading Tips */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            {progress < 30 && "Preparing the science..."}
            {progress >= 30 && progress < 60 && "Establishing connection..."}
            {progress >= 60 && progress < 90 && "Loading content..."}
            {progress >= 90 && "Almost ready!"}
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
