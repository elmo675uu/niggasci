import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import BoardList from './components/BoardList'
import ThreadList from './components/ThreadList'
import AdminPanel from './components/AdminPanel'
import AudioPlayer from './components/AudioPlayer'
import SnowflakeAnimation from './components/SnowflakeAnimation'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [config, setConfig] = useState({})
  const [showAdmin, setShowAdmin] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState('boards') // 'boards', 'threads', 'thread'
  const [currentBoard, setCurrentBoard] = useState(null)
  const [currentThread, setCurrentThread] = useState(null)

  // Load initial data immediately
  useEffect(() => {
    loadData()
    
    // No cleanup needed
  }, [])

  const loadData = async () => {
    try {
      console.log('Loading data...')
      
      // Set default config first
      setConfig({
        title: "NIGGA SCIENCE",
        description: "The ultimate imageboard for nigga science discussions",
        socialLinks: {
          twitter: "https://twitter.com/niggascience",
          telegram: "https://t.me/niggascience", 
          discord: "https://discord.gg/niggascience",
          medium: "https://medium.com/@niggascience"
        },
        audioUrl: "/theme.mp3",
        audioAutoplay: true,
        audioLoop: true,
        audioVolume: 0.3
      })
      
      // Set loading to false after data loads
      setTimeout(() => {
        setIsLoading(false)
      }, 1000) // Show loading screen for at least 1 second
      
      // Load config
      try {
        const configResponse = await fetch('/api/config', { 
          cache: 'no-cache',
          headers: { 'Accept': 'application/json' }
        })
        
        if (configResponse.ok) {
          const configData = await configResponse.json()
          console.log('Config loaded:', configData)
          setConfig(configData)
        } else {
          console.error(`Config API failed with status: ${configResponse.status}`)
        }
      } catch (error) {
        console.error('Failed to load config:', error)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleBoardSelect = (board) => {
    setCurrentBoard(board)
    setCurrentView('threads')
  }

  const handleBackToBoards = () => {
    setCurrentView('boards')
    setCurrentBoard(null)
    setCurrentThread(null)
  }

  const handleThreadSelect = (thread) => {
    setCurrentThread(thread)
    setCurrentView('thread')
  }

  const handleBackToThreads = () => {
    setCurrentView('threads')
    setCurrentThread(null)
  }

  const updateConfig = async (newConfig) => {
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      })
      
      if (response.ok) {
        setConfig(newConfig)
      }
    } catch (error) {
      console.error('Failed to update config:', error)
    }
  }

  // Show loading screen while loading
  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen">
      <Header 
        config={config}
        onToggleAdmin={() => setShowAdmin(!showAdmin)}
        showAdmin={showAdmin}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {currentView === 'boards' && (
          <BoardList 
            isAdminAuthenticated={isAdminAuthenticated}
            onBoardSelect={handleBoardSelect}
          />
        )}
        
        {currentView === 'threads' && currentBoard && (
          <ThreadList 
            board={currentBoard}
            onBack={handleBackToBoards}
            isAdminAuthenticated={isAdminAuthenticated}
          />
        )}
      </main>
      
      <AudioPlayer config={config} />
      <SnowflakeAnimation />
      
      {showAdmin && (
        <AdminPanel 
          config={config}
          onClose={() => setShowAdmin(false)}
          onUpdateConfig={updateConfig}
          onAdminLogin={() => setIsAdminAuthenticated(true)}
        />
      )}
    </div>
  )
}

export default App