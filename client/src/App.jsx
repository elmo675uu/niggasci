import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Board from './components/Board'
import AdminPanel from './components/AdminPanel'
import AudioPlayer from './components/AudioPlayer'

function App() {
  const [posts, setPosts] = useState({ pinned: [], user: [] })
  const [config, setConfig] = useState({})
  const [showAdmin, setShowAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [postsRes, configRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/config')
      ])
      
      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setPosts(postsData)
      }
      
      if (configRes.ok) {
        const configData = await configRes.json()
        setConfig(configData)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addPost = async (postData) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })
      
      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error('Failed to add post:', error)
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary-500 text-xl font-heading animate-pulse">
          Loading NIGGA SCIENCE...
        </div>
      </div>
    )
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
        />
      </main>
      
      <AudioPlayer config={config} />
      
      {showAdmin && (
        <AdminPanel 
          posts={posts}
          config={config}
          onClose={() => setShowAdmin(false)}
          onUpdateConfig={updateConfig}
          onRefresh={loadData}
        />
      )}
    </div>
  )
}

export default App
