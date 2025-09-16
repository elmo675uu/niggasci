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
  const [isLoading, setIsLoading] = useState(true)

  // Load initial data immediately
  useEffect(() => {
    loadData()
    
    // Set a maximum loading time to prevent infinite loading
    const maxLoadingTime = setTimeout(() => {
      console.log('Maximum loading time reached, forcing completion')
      setIsLoading(false)
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
      
      // Set a fallback timeout to show posts even if API is slow
      setTimeout(() => {
        if (posts.pinned.length === 0 && posts.user.length === 0) {
          console.log('Setting fallback posts due to slow loading')
          setPosts({
            pinned: [{
              id: 'fallback-1',
              title: 'Welcome to NIGGA SCIENCE',
              content: 'Posts are loading... Please wait a moment.',
              author: 'System',
              timestamp: Date.now(),
              pinned: true,
              admin: false,
              likes: [],
              imageUrl: ''
            }],
            user: []
          })
        }
      }, 2000) // 2 second fallback
      
      // Load posts with aggressive optimization - remove ALL images for fast loading
      try {
        console.log('Loading posts with image optimization...')
        const postsResponse = await Promise.race([
          fetch('/api/posts', { 
            cache: 'no-cache',
            headers: { 'Accept': 'application/json' }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Posts loading timeout')), 3000) // 3 second timeout
          )
        ])
        
        if (postsResponse.ok) {
          const postsData = await postsResponse.json()
          console.log('Raw posts data loaded, optimizing...')
          
          // Aggressively optimize posts data by removing ALL images for fast loading
          const optimizedPosts = {
            pinned: postsData.pinned?.map(post => ({
              id: post.id,
              title: post.title,
              content: post.content,
              author: post.author,
              timestamp: post.timestamp,
              pinned: post.pinned,
              admin: post.admin,
              likes: post.likes || [],
              imageUrl: '' // Remove ALL images for fast loading
            })) || [],
            user: postsData.user?.map(post => ({
              id: post.id,
              title: post.title,
              content: post.content,
              author: post.author,
              timestamp: post.timestamp,
              pinned: post.pinned,
              admin: post.admin,
              likes: post.likes || [],
              imageUrl: '' // Remove ALL images for fast loading
            })) || []
          }
          
          setPosts(optimizedPosts)
          console.log('Posts optimized and loaded (images removed for performance)')
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
