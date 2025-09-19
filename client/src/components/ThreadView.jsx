import React, { useState, useEffect } from 'react'
import { ArrowLeft, Heart, MessageSquare, User, Clock, Send, Edit, Trash2 } from 'lucide-react'
import RichTextEditor from './RichTextEditor'

const ThreadView = ({ threadId, onBack, isAdminAuthenticated }) => {
  const [thread, setThread] = useState(null)
  const [replies, setReplies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyData, setReplyData] = useState({
    content: '',
    author: '',
    imageUrl: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingThread, setEditingThread] = useState(false)
  const [editingReply, setEditingReply] = useState(null)
  const [editData, setEditData] = useState({
    title: '',
    content: '',
    author: '',
    imageUrl: ''
  })

  useEffect(() => {
    if (threadId) {
      loadThread()
    }
  }, [threadId])

  const loadThread = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        cache: 'no-cache',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      })
      if (response.ok) {
        const data = await response.json()
        setThread(data.thread)
        setReplies(data.replies || [])
      } else {
        console.error(`Failed to load thread: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to load thread:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReplySubmit = async (e) => {
    e.preventDefault()
    
    if (!replyData.content && !replyData.imageUrl) {
      alert('Please enter content or an image URL')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/threads/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...replyData,
          author: replyData.author || 'Anonymous'
        })
      })

      if (response.ok) {
        setReplyData({ content: '', author: '', imageUrl: '' })
        setShowReplyForm(false)
        loadThread() // Reload to get updated reply count
      } else {
        const error = await response.json()
        alert('Failed to post reply: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to post reply:', error)
      alert('Failed to post reply. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeToggle = async (postId, isLiked) => {
    try {
      const endpoint = isLiked ? 'unlike' : 'like'
      const response = await fetch(`/api/posts/${postId}/${endpoint}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        // Update local state
        if (thread && thread.id === postId) {
          const newLikes = isLiked 
            ? thread.likes.filter(like => !like.startsWith('user'))
            : [...thread.likes, 'user_' + Date.now()]
          setThread({ ...thread, likes: newLikes })
        } else {
          setReplies(replies.map(reply => {
            if (reply.id === postId) {
              const newLikes = isLiked 
                ? reply.likes.filter(like => !like.startsWith('user'))
                : [...reply.likes, 'user_' + Date.now()]
              return { ...reply, likes: newLikes }
            }
            return reply
          }))
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const handleEditThread = () => {
    setEditData({
      title: thread.title || '',
      content: thread.content || '',
      author: thread.author || '',
      imageUrl: thread.imageUrl || ''
    })
    setEditingThread(true)
  }

  const handleEditReply = (reply) => {
    setEditData({
      title: '',
      content: reply.content || '',
      author: reply.author || '',
      imageUrl: reply.imageUrl || ''
    })
    setEditingReply(reply.id)
  }

  const handleSaveEdit = async () => {
    try {
      if (editingThread) {
        // Edit thread - we'll need to add this API endpoint
        const response = await fetch(`/api/threads/${threadId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editData)
        })
        
        if (response.ok) {
          setEditingThread(false)
          loadThread()
        } else {
          alert('Failed to update thread')
        }
      } else if (editingReply) {
        // Edit reply - we'll need to add this API endpoint
        const response = await fetch(`/api/replies/${editingReply}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editData)
        })
        
        if (response.ok) {
          setEditingReply(null)
          loadThread()
        } else {
          alert('Failed to update reply')
        }
      }
    } catch (error) {
      console.error('Failed to save edit:', error)
      alert('Failed to save changes')
    }
  }

  const handleDeleteThread = async () => {
    if (!confirm('Are you sure you want to delete this thread? This will also delete all replies.')) return
    
    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        onBack() // Go back to thread list
      } else {
        alert('Failed to delete thread')
      }
    } catch (error) {
      console.error('Failed to delete thread:', error)
      alert('Failed to delete thread')
    }
  }

  const handleDeleteReply = async (replyId) => {
    if (!confirm('Are you sure you want to delete this reply?')) return
    
    try {
      const response = await fetch(`/api/replies/${replyId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        loadThread()
      } else {
        alert('Failed to delete reply')
      }
    } catch (error) {
      console.error('Failed to delete reply:', error)
      alert('Failed to delete reply')
    }
  }

  const isLikedByUser = (post) => {
    return post.likes && post.likes.some(like => like.startsWith('user'))
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
          <div key={index} className={`my-4 ${isShorts ? 'flex justify-center' : ''}`}>
            <iframe
              width={isShorts ? "315" : "100%"}
              height={isShorts ? "560" : "400"}
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={`rounded-lg ${isShorts ? 'max-w-sm' : 'max-w-4xl mx-auto'}`}
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

  const renderHTMLContent = (content) => {
    if (!content) return null
    
    // Handle line breaks and paragraphs properly
    const lines = content.split('\n')
    
    return lines.map((line, lineIndex) => {
      // Skip empty lines
      if (line.trim() === '') {
        return <br key={`line-break-${lineIndex}`} />
      }
      
      // Check if this line contains a YouTube URL (including Shorts)
      const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g
      const youtubeMatch = line.match(youtubeRegex)
      
      if (youtubeMatch) {
        const videoId = youtubeMatch[0].match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)[1]
        const isShorts = youtubeMatch[0].includes('/shorts/')
        
        return (
          <div key={`youtube-${lineIndex}`} className={`my-4 ${isShorts ? 'flex justify-center' : ''}`}>
            <iframe
              width={isShorts ? "315" : "100%"}
              height={isShorts ? "560" : "400"}
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={`rounded-lg ${isShorts ? 'max-w-sm' : 'max-w-4xl mx-auto'}`}
            />
          </div>
        )
      }
      
      // Create a temporary div to parse HTML in this line
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = line
      
      // Convert to React elements
      const convertNodeToReact = (node, key = 0) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return renderContent(node.textContent)
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName.toLowerCase()
          const children = Array.from(node.childNodes).map((child, index) => 
            convertNodeToReact(child, index)
          )
          
          switch (tagName) {
            case 'b':
              return <b key={key}>{children}</b>
            case 'i':
              return <i key={key}>{children}</i>
            case 'strong':
              return <strong key={key} className="text-primary-400 font-bold">{children}</strong>
            case 'em':
              return <em key={key}>{children}</em>
            case 'br':
              return <br key={key} />
            case 'p':
              return <p key={key} className="mb-2">{children}</p>
            default:
              return <span key={key}>{children}</span>
          }
        }
        
        return null
      }
      
      const lineElements = Array.from(tempDiv.childNodes).map((node, index) => 
        convertNodeToReact(node, index)
      )
      
      return (
        <div key={`line-${lineIndex}`} className="mb-1">
          {lineElements}
        </div>
      )
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-t-2 border-primary-400 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Loading thread...</p>
        </div>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">Thread not found</h2>
          <button onClick={onBack} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
              <h1 className="text-2xl font-bold text-primary-400">
                Thread: {thread.title || 'Untitled Thread'}
              </h1>
              <p className="text-gray-400">/{thread.boardId}/</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowReplyForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <MessageSquare size={20} />
            <span>Reply</span>
          </button>
        </div>

        {/* Original Thread */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <User size={16} />
                <span className="font-medium">{thread.author}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock size={16} />
                <span>{formatDate(thread.timestamp)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleLikeToggle(thread.id, isLikedByUser(thread))}
                className={`flex items-center space-x-1 px-3 py-2 rounded transition-colors ${
                  isLikedByUser(thread)
                    ? 'bg-red-600 text-white'
                    : 'bg-dark-700 hover:bg-dark-600 text-gray-400'
                }`}
              >
                <Heart size={16} fill={isLikedByUser(thread) ? 'currentColor' : 'none'} />
                <span>{thread.likes?.length || 0}</span>
              </button>
              
              {isAdminAuthenticated && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleEditThread}
                    className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-primary-400 transition-all duration-300"
                    title="Edit thread"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={handleDeleteThread}
                    className="p-2 rounded-lg bg-dark-700 hover:bg-red-600 text-gray-400 hover:text-white transition-all duration-300"
                    title="Delete thread"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {editingThread ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thread Title
                  </label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="input-field w-full"
                    placeholder="Thread title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                  </label>
                  <RichTextEditor
                    value={editData.content}
                    onChange={(value) => setEditData({...editData, content: value})}
                    placeholder="Thread content"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    value={editData.author}
                    onChange={(e) => setEditData({...editData, author: e.target.value})}
                    className="input-field w-full"
                    placeholder="Author name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={editData.imageUrl}
                    onChange={(e) => setEditData({...editData, imageUrl: e.target.value})}
                    className="input-field w-full"
                    placeholder="Image URL"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button onClick={handleSaveEdit} className="btn-primary">
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setEditingThread(false)} 
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {thread.title && (
                  <h2 className="text-xl font-heading font-bold text-primary-400">
                    {thread.title}
                  </h2>
                )}
                
                {thread.content && (
                  <div className="text-gray-300 leading-relaxed">
                    {renderHTMLContent(thread.content)}
                  </div>
                )}
                
                {thread.imageUrl && (
                  <div className="mt-4">
                    <img 
                      src={thread.imageUrl} 
                      alt={thread.title || 'Thread image'}
                      className="w-full min-w-[300px] max-w-[500px] h-auto rounded-lg border border-dark-600"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Post a Reply</h3>
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Author Name (optional)
                </label>
                <input
                  type="text"
                  value={replyData.author}
                  onChange={(e) => setReplyData({...replyData, author: e.target.value})}
                  placeholder="Your name (defaults to Anonymous)"
                  className="input-field w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reply Content
                </label>
                <RichTextEditor
                  value={replyData.content}
                  onChange={(value) => setReplyData({...replyData, content: value})}
                  placeholder="Write your reply..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={replyData.imageUrl}
                  onChange={(e) => setReplyData({...replyData, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="input-field w-full"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Send size={20} />
                  <span>{isSubmitting ? 'Posting...' : 'Post Reply'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Replies */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Replies ({replies.length})
          </h3>
          
          {replies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-600" />
              <p>No replies yet. Be the first to reply!</p>
            </div>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <User size={16} />
                      <span className="font-medium">{reply.author}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock size={16} />
                      <span>{formatDate(reply.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleLikeToggle(reply.id, isLikedByUser(reply))}
                      className={`flex items-center space-x-1 px-3 py-2 rounded transition-colors ${
                        isLikedByUser(reply)
                          ? 'bg-red-600 text-white'
                          : 'bg-dark-700 hover:bg-dark-600 text-gray-400'
                      }`}
                    >
                      <Heart size={16} fill={isLikedByUser(reply) ? 'currentColor' : 'none'} />
                      <span>{reply.likes?.length || 0}</span>
                    </button>
                    
                    {isAdminAuthenticated && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditReply(reply)}
                          className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-primary-400 transition-all duration-300"
                          title="Edit reply"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteReply(reply.id)}
                          className="p-2 rounded-lg bg-dark-700 hover:bg-red-600 text-gray-400 hover:text-white transition-all duration-300"
                          title="Delete reply"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {editingReply === reply.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Content
                        </label>
                        <RichTextEditor
                          value={editData.content}
                          onChange={(value) => setEditData({...editData, content: value})}
                          placeholder="Reply content"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Author
                        </label>
                        <input
                          type="text"
                          value={editData.author}
                          onChange={(e) => setEditData({...editData, author: e.target.value})}
                          className="input-field w-full"
                          placeholder="Author name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Image URL
                        </label>
                        <input
                          type="url"
                          value={editData.imageUrl}
                          onChange={(e) => setEditData({...editData, imageUrl: e.target.value})}
                          className="input-field w-full"
                          placeholder="Image URL"
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <button onClick={handleSaveEdit} className="btn-primary">
                          Save Changes
                        </button>
                        <button 
                          onClick={() => setEditingReply(null)} 
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {reply.content && (
                        <div className="text-gray-300 leading-relaxed">
                          {renderHTMLContent(reply.content)}
                        </div>
                      )}
                      
                      {reply.imageUrl && (
                        <div className="mt-4">
                          <img 
                            src={reply.imageUrl} 
                            alt="Reply image"
                            className="w-full min-w-[300px] max-w-[500px] h-auto rounded-lg border border-dark-600"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ThreadView
