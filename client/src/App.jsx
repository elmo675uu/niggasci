import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Board from './components/Board'
import AdminPanel from './components/AdminPanel'
import AudioPlayer from './components/AudioPlayer'
import SnowflakeAnimation from './components/SnowflakeAnimation'

function App() {
  const [posts, setPosts] = useState({ pinned: [], user: [] })
  const [config, setConfig] = useState({})
  const [showAdmin, setShowAdmin] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load initial data immediately
  useEffect(() => {
    loadData()
    
    // No maximum loading time needed with aggressive optimization
    
    // No cleanup needed
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
      
      // No loading state needed with aggressive optimization
      
      // No fallback needed - API is now fast
      
      // Load posts with moderate optimization - only remove very large base64 images
      try {
        console.log('Loading posts with moderate optimization...')
        const postsResponse = await Promise.race([
          fetch('/api/posts', { 
            cache: 'no-cache',
            headers: { 'Accept': 'application/json' }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Posts loading timeout')), 5000) // 5 second timeout
          )
        ])
        
        if (postsResponse.ok) {
          const postsData = await postsResponse.json()
          console.log('Posts data loaded, applying moderate optimization...')
          
          // Moderate optimization - only remove very large base64 images (>200KB)
          const optimizedPosts = {
            pinned: postsData.pinned?.map(post => ({
              ...post,
              imageUrl: post.imageUrl && post.imageUrl.length > 200000 ? 
                'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A' : 
                post.imageUrl
            })) || [],
            user: postsData.user?.map(post => ({
              ...post,
              imageUrl: post.imageUrl && post.imageUrl.length > 200000 ? 
                'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A' : 
                post.imageUrl
            })) || []
          }
          
          setPosts(optimizedPosts)
          console.log('Posts loaded with moderate optimization (only very large images removed)')
        } else {
          console.error(`Posts API failed with status: ${postsResponse.status}`)
        }
      } catch (error) {
        console.error('Failed to load posts:', error)
        console.log('Using fallback posts data')
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
        {/* No loading indicator needed with aggressive optimization */}
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
