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
      
      // Use Promise.allSettled with timeout for faster loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 1000) // 1 second timeout
      )
      
      const [postsResult, configResult] = await Promise.allSettled([
        Promise.race([
          fetch('/api/posts', { 
            cache: 'no-cache',
            headers: { 'Accept': 'application/json' }
          }),
          timeoutPromise
        ]),
        Promise.race([
          fetch('/api/config', { 
            cache: 'no-cache',
            headers: { 'Accept': 'application/json' }
          }),
          timeoutPromise
        ])
      ])
      
      // Handle posts
      if (postsResult.status === 'fulfilled' && postsResult.value.ok) {
        const postsData = await postsResult.value.json()
        console.log('Loaded posts data:', postsData)
        setPosts(postsData)
      } else {
        console.error('Failed to load posts:', postsResult.reason || postsResult.value?.status)
      }
      
      // Handle config
      if (configResult.status === 'fulfilled' && configResult.value.ok) {
        const configData = await configResult.value.json()
        console.log('Loaded config data:', configData)
        setConfig(configData)
      } else {
        console.error('Failed to load config:', configResult.reason || configResult.value?.status)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
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
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-primary-500 text-lg font-heading animate-pulse">
              Loading posts...
            </div>
          </div>
        ) : (
          <Board 
            posts={posts}
            onAddPost={addPost}
            onRefresh={loadData}
            isAdminAuthenticated={isAdminAuthenticated}
          />
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
