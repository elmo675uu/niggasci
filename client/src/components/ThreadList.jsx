import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Heart, MessageSquare, User, Clock } from 'lucide-react'
import NewThreadForm from './NewThreadForm'

const ThreadList = ({ board, onBack, isAdminAuthenticated }) => {
  const [threads, setThreads] = useState([])
  const [showNewThread, setShowNewThread] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (board) {
      loadThreads()
    }
  }, [board])

  const loadThreads = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/boards/${board.id}/threads`)
      if (response.ok) {
        const data = await response.json()
        setThreads(data.threads || [])
      }
    } catch (error) {
      console.error('Failed to load threads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLikeToggle = async (threadId, isLiked) => {
    try {
      const endpoint = isLiked ? 'unlike' : 'like'
      const response = await fetch(`/api/posts/${threadId}/${endpoint}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        // Update local state
        setThreads(threads.map(thread => {
          if (thread.id === threadId) {
            const newLikes = isLiked 
              ? thread.likes.filter(like => !like.startsWith('user'))
              : [...thread.likes, 'user_' + Date.now()]
            return { ...thread, likes: newLikes }
          }
          return thread
        }))
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const isLikedByUser = (thread) => {
    return thread.likes && thread.likes.some(like => like.startsWith('user'))
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const renderContent = (content) => {
    if (!content) return null
    
    // YouTube URL detection
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g
    const linkRegex = /(https?:\/\/[^\s]+)/g
    
    let processedContent = content.replace(youtubeRegex, (match, videoId) => {
      const isShorts = match.includes('/shorts/')
      return `[YOUTUBE:${videoId}:${isShorts ? 'SHORTS' : 'VIDEO'}]`
    })
    
    const parts = processedContent.split(linkRegex)
    
    return parts.map((part, index) => {
      if (part.startsWith('[YOUTUBE:')) {
        const [videoId, type] = part.replace('[YOUTUBE:', '').replace(']', '').split(':')
        const isShorts = type === 'SHORTS'
        
        return (
          <div key={index} className="my-2">
            <iframe
              width="100%"
              height={isShorts ? "200" : "150"}
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={`rounded-lg max-w-full ${isShorts ? 'max-w-xs mx-auto' : ''}`}
            />
          </div>
        )
      } else if (linkRegex.test(part)) {
        return (
          <a 
            key={index}
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 underline"
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-t-2 border-primary-400 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Loading threads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-primary-400 transition-all duration-300"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primary-400">
                /{board.id}/
              </h1>
              <p className="text-gray-300">{board.name}</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowNewThread(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>New Thread</span>
          </button>
        </div>

        {/* New Thread Form */}
        {showNewThread && (
          <div className="mb-8">
            <NewThreadForm
              boardId={board.id}
              onThreadCreated={() => {
                setShowNewThread(false)
                loadThreads()
              }}
              onCancel={() => setShowNewThread(false)}
            />
          </div>
        )}

        {/* Threads List */}
        {threads.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No threads yet</h3>
            <p className="text-gray-500">Be the first to start a discussion in this board!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className="card hover:bg-dark-700/50 cursor-pointer transition-all duration-300"
                onClick={() => window.location.href = `#/thread/${thread.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {thread.title || 'Untitled Thread'}
                    </h3>
                    <div className="text-gray-300 text-sm mb-3">
                      {renderContent(thread.content)}
                    </div>
                    {thread.imageUrl && (
                      <div className="mb-3">
                        <img
                          src={thread.imageUrl}
                          alt="Thread image"
                          className="max-w-xs max-h-32 object-cover rounded-lg"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{thread.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{formatDate(thread.timestamp)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare size={14} />
                      <span>{thread.replyCount || 0} replies</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLikeToggle(thread.id, isLikedByUser(thread))
                    }}
                    className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                      isLikedByUser(thread)
                        ? 'bg-red-600 text-white'
                        : 'bg-dark-700 hover:bg-dark-600 text-gray-400'
                    }`}
                  >
                    <Heart size={14} fill={isLikedByUser(thread) ? 'currentColor' : 'none'} />
                    <span>{thread.likes?.length || 0}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ThreadList
