import React, { useState } from 'react'
import { X, Save, Plus, Twitter, TrendingUp, Zap } from 'lucide-react'

const AdminPanel = ({ posts, config, onClose, onUpdateConfig, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('posts')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    author: 'Admin'
  })
  const [configData, setConfigData] = useState({
    title: config.title || 'NIGGA SCIENCE',
    socialLinks: {
      twitter: config.socialLinks?.twitter || '',
      telegram: config.socialLinks?.telegram || '',
      discord: config.socialLinks?.discord || '',
      medium: config.socialLinks?.medium || ''
    }
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      if (response.ok) {
        setIsAuthenticated(true)
        setPassword('')
      } else {
        alert('Invalid password')
      }
    } catch (error) {
      console.error('Login failed:', error)
      alert('Login failed')
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPost,
          pinned: true,
          admin: true
        })
      })
      
      if (response.ok) {
        setNewPost({ title: '', content: '', author: 'Admin' })
        onRefresh()
      }
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  const handleUpdateConfig = async (e) => {
    e.preventDefault()
    
    try {
      await onUpdateConfig(configData)
      alert('Configuration updated successfully!')
    } catch (error) {
      console.error('Failed to update config:', error)
      alert('Failed to update configuration')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <h2 className="text-2xl font-heading font-bold text-primary-500 mb-6">
            Admin Login
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="input-field w-full"
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary flex-1">
                Login
              </button>
              <button 
                type="button" 
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-primary-500">
            Admin Panel
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white transition-all duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-dark-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${
              activeTab === 'posts'
                ? 'bg-primary-500 text-dark-950'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Manage Posts
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${
              activeTab === 'config'
                ? 'bg-primary-500 text-dark-950'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Configuration
          </button>
        </div>

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-heading font-bold text-primary-400 mb-4">
                Create New Admin Post
              </h3>
              
              <form onSubmit={handleCreatePost} className="space-y-4">
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  placeholder="Post title"
                  className="input-field w-full"
                  required
                />
                
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  placeholder="Post content"
                  rows={4}
                  className="input-field w-full resize-none"
                  required
                />
                
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary flex items-center space-x-2">
                    <Plus size={20} />
                    <span>Create Post</span>
                  </button>
                </div>
              </form>
            </div>

            <div>
              <h3 className="text-lg font-heading font-bold text-primary-400 mb-4">
                Existing Admin Posts
              </h3>
              
              <div className="space-y-3">
                {posts.pinned && posts.pinned.length > 0 ? (
                  posts.pinned.map(post => (
                    <div key={post.id} className="p-4 bg-dark-800/50 rounded-lg border border-dark-600">
                      <h4 className="font-bold text-primary-400">{post.title}</h4>
                      <p className="text-gray-300 text-sm mt-1">{post.content}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        By {post.author} • {new Date(post.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No admin posts yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <form onSubmit={handleUpdateConfig} className="space-y-6">
            <div>
              <h3 className="text-lg font-heading font-bold text-primary-400 mb-4">
                Site Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Site Title
                  </label>
                  <input
                    type="text"
                    value={configData.title}
                    onChange={(e) => setConfigData({...configData, title: e.target.value})}
                    className="input-field w-full"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-heading font-bold text-primary-400 mb-4">
                Social Links
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Twitter size={16} className="mr-2" />
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={configData.socialLinks.twitter}
                    onChange={(e) => setConfigData({
                      ...configData, 
                      socialLinks: {...configData.socialLinks, twitter: e.target.value}
                    })}
                    placeholder="https://twitter.com/username"
                    className="input-field w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <img 
                      src="/dexscreener-favicon.ico" 
                      alt="Dexscreener" 
                      width="16" 
                      height="16"
                      className="w-4 h-4 mr-2"
                    />
                    Dexscreener
                  </label>
                  <input
                    type="url"
                    value={configData.socialLinks.dexscreener}
                    onChange={(e) => setConfigData({
                      ...configData, 
                      socialLinks: {...configData.socialLinks, dexscreener: e.target.value}
                    })}
                    placeholder="https://dexscreener.com/solana/token"
                    className="input-field w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <img 
                      src="/pumpfun-favicon.svg" 
                      alt="Pump Fun" 
                      width="16" 
                      height="16"
                      className="w-4 h-4 mr-2"
                    />
                    Pump Fun
                  </label>
                  <input
                    type="url"
                    value={configData.socialLinks.pumpfun}
                    onChange={(e) => setConfigData({
                      ...configData, 
                      socialLinks: {...configData.socialLinks, pumpfun: e.target.value}
                    })}
                    placeholder="https://pump.fun/token"
                    className="input-field w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary flex items-center space-x-2">
                <Save size={20} />
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
