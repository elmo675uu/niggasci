import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Board from './components/Board'
import AdminPanel from './components/AdminPanel'
import AudioPlayer from './components/AudioPlayer'
import SnowflakeAnimation from './components/SnowflakeAnimation'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [posts, setPosts] = useState({ pinned: [], user: [] })
  const [config, setConfig] = useState({})
  const [showAdmin, setShowAdmin] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)

  // Load initial data immediately
  useEffect(() => {
    // Start loading data immediately, don't wait for loading screen
    loadData()
    
    // Also set a maximum loading time to prevent infinite loading
    const maxLoadingTime = setTimeout(() => {
      console.log('Maximum loading time reached, forcing completion')
      setIsLoading(false)
      setShowLoadingScreen(false)
    }, 2000) // 2 second maximum
    
    return () => clearTimeout(maxLoadingTime)
  }, [])

  const loadData = async () => {
    try {
      console.log('Loading data...')
      
      // Set fallback data immediately for faster initial render
      setPosts({ pinned: [], user: [] })
      setConfig({ 
        siteTitle: 'NIGGA SCIENCE',
        audioUrl: '/theme.mp3',
        audioAutoplay: true,
        audioLoop: true,
        audioVolume: 0.3
      })
      
      // Always clear loading state after a short delay to ensure UI shows
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
      
      // Try to load posts with multiple attempts
      let postsLoaded = false
      let attempts = 0
      const maxAttempts = 3
      
      while (!postsLoaded && attempts < maxAttempts) {
        attempts++
        console.log(`Attempt ${attempts} to load posts...`)
        
        try {
          const postsResponse = await fetch('/api/posts', { 
            cache: 'no-cache',
            headers: { 'Accept': 'application/json' }
          })
          
          if (postsResponse.ok) {
            const postsData = await postsResponse.json()
            console.log('Loaded posts data:', postsData)
            console.log('Pinned posts count:', postsData.pinned?.length || 0)
            console.log('User posts count:', postsData.user?.length || 0)
            setPosts(postsData)
            postsLoaded = true
          } else {
            console.error(`Posts API failed with status: ${postsResponse.status}`)
          }
        } catch (error) {
          console.error(`Posts API attempt ${attempts} failed:`, error)
        }
        
        if (!postsLoaded && attempts < maxAttempts) {
          console.log('Retrying in 1 second...')
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      if (!postsLoaded) {
        console.error('Failed to load posts after all attempts')
      }
      
      // Load config
      try {
        const configResponse = await fetch('/api/config', { 
          cache: 'no-cache',
          headers: { 'Accept': 'application/json' }
        })
        
        if (configResponse.ok) {
          const configData = await configResponse.json()
          console.log('Loaded config data:', configData)
          setConfig(configData)
        } else {
          console.error(`Config API failed with status: ${configResponse.status}`)
        }
      } catch (error) {
        console.error('Failed to load config:', error)
      }
      
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const addPost = async (postData) => {
    try {
      console.log('Creating post with data:', postData)
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })
      
      console.log('Post creation response:', response.status, response.statusText)
      
      if (response.ok) {
        console.log('Post created successfully, refreshing data...')
        await loadData()
      } else {
        const errorData = await response.text()
        console.error('Post creation failed:', errorData)
        alert('Failed to create post: ' + errorData)
      }
    } catch (error) {
      console.error('Failed to add post:', error)
      alert('Failed to create post: ' + error.message)
    }
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
  if (showLoadingScreen) {
    return <LoadingScreen onComplete={() => setShowLoadingScreen(false)} />
  }

  return (
    <div className="min-h-screen">
      <Header 
        config={config}
        onToggleAdmin={() => setShowAdmin(!showAdmin)}
        showAdmin={showAdmin}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Board 
          posts={posts}
          onAddPost={addPost}
          onRefresh={loadData}
          isAdminAuthenticated={isAdminAuthenticated}
        />
        {isLoading && (
          <div className="fixed top-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm">
            Loading posts...
          </div>
        )}
      </main>
      
      <AudioPlayer config={config} />
      <SnowflakeAnimation />
      
      {showAdmin && (
        <AdminPanel 
          posts={posts}
          config={config}
          onClose={() => setShowAdmin(false)}
          onUpdateConfig={updateConfig}
          onRefresh={loadData}
          onAdminLogin={() => setIsAdminAuthenticated(true)}
        />
      )}
    </div>
  )
}

export default App
