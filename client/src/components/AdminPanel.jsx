import React, { useState } from 'react'
import { X, Save, Twitter, TrendingUp, Zap } from 'lucide-react'

const AdminPanel = ({ config, onClose, onUpdateConfig, onAdminLogin }) => {
  const [activeTab, setActiveTab] = useState('config')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [configData, setConfigData] = useState(config)

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
        onAdminLogin()
      } else {
        alert('Invalid password')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed')
    }
  }

  const handleSaveConfig = async () => {
    try {
      await onUpdateConfig(configData)
      alert('Configuration saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save configuration')
    }
  }

  const handleConfigChange = (field, value) => {
    setConfigData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialLinkChange = (platform, value) => {
    setConfigData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="card max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-heading font-bold text-primary-500">
              Admin Login
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white transition-all duration-300"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="Enter admin password"
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
                className="btn-secondary flex-1"
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="card max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
        <div className="flex space-x-4 mb-6 border-b border-dark-700">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2 px-1 font-medium transition-colors ${
              activeTab === 'config'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Configuration
          </button>
        </div>

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Zap size={20} className="mr-2" />
                Basic Settings
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Site Title
                </label>
                <input
                  type="text"
                  value={configData.title || ''}
                  onChange={(e) => handleConfigChange('title', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Site Description
                </label>
                <textarea
                  value={configData.description || ''}
                  onChange={(e) => handleConfigChange('description', e.target.value)}
                  className="input-field w-full h-20 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Contract Address (CA)
                </label>
                <input
                  type="text"
                  value={configData.tokenCA || ''}
                  onChange={(e) => handleConfigChange('tokenCA', e.target.value)}
                  className="input-field w-full"
                  placeholder="Enter token contract address (e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The token contract address will be displayed on the main page
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Twitter size={20} className="mr-2" />
                Social Links
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={configData.socialLinks?.twitter || ''}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    className="input-field w-full"
                    placeholder="https://twitter.com/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dexscreener
                  </label>
                  <input
                    type="url"
                    value={configData.socialLinks?.dexscreener || ''}
                    onChange={(e) => handleSocialLinkChange('dexscreener', e.target.value)}
                    className="input-field w-full"
                    placeholder="https://dexscreener.com/solana/token"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pump Fun
                  </label>
                  <input
                    type="url"
                    value={configData.socialLinks?.pumpfun || ''}
                    onChange={(e) => handleSocialLinkChange('pumpfun', e.target.value)}
                    className="input-field w-full"
                    placeholder="https://pump.fun/token"
                  />
                </div>
              </div>
            </div>

            {/* Audio Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <TrendingUp size={20} className="mr-2" />
                Audio Settings
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Audio URL
                </label>
                <input
                  type="url"
                  value={configData.audioUrl || ''}
                  onChange={(e) => handleConfigChange('audioUrl', e.target.value)}
                  className="input-field w-full"
                  placeholder="/theme.mp3"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={configData.audioAutoplay !== false}
                      onChange={(e) => handleConfigChange('audioAutoplay', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">Auto Play</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={configData.audioLoop !== false}
                      onChange={(e) => handleConfigChange('audioLoop', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">Loop</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Volume
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={configData.audioVolume || 0.3}
                    onChange={(e) => handleConfigChange('audioVolume', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-dark-700">
              <button
                onClick={handleSaveConfig}
                className="btn-primary flex items-center space-x-2"
              >
                <Save size={20} />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel