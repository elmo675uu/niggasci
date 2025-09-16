import React, { useState } from 'react'
import { Pin, PinOff, Edit, Trash2, User, Clock, Heart } from 'lucide-react'
import RichTextEditor from './RichTextEditor'

const Post = ({ post, isPinned, onRefresh, isAdminAuthenticated }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: post.title || '',
    content: post.content || '',
    author: post.author || 'Anonymous'
  })

  // Helper function to check if current user has liked this post
  const isLikedByUser = () => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
    return likedPosts.includes(post.id)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })
      
      if (response.ok) {
        setIsEditing(false)
        onRefresh()
      }
    } catch (error) {
      console.error('Failed to update post:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const handlePinToggle = async () => {
    try {
      const endpoint = isPinned ? 'unpin' : 'pin'
      const response = await fetch(`/api/posts/${post.id}/${endpoint}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }

  const handleLikeToggle = async () => {
    try {
      // Get user's liked posts from localStorage
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
      const isLiked = likedPosts.includes(post.id)
      
      const endpoint = isLiked ? 'unlike' : 'like'
      const response = await fetch(`/api/posts/${post.id}/${endpoint}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Update localStorage
        if (isLiked) {
          // Remove from liked posts
          const updatedLikes = likedPosts.filter(id => id !== post.id)
          localStorage.setItem('likedPosts', JSON.stringify(updatedLikes))
        } else {
          // Add to liked posts
          likedPosts.push(post.id)
          localStorage.setItem('likedPosts', JSON.stringify(likedPosts))
        }
        
        // Update the post data locally for immediate UI update
        if (result.post) {
          post.likes = result.post.likes
        }
        
        // Trigger a refresh to get the latest data
        onRefresh()
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

    const renderContent = (content) => {
      // YouTube URL detection and rendering
      const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g
      const linkRegex = /(https?:\/\/[^\s]+)/g
      
      // First, handle YouTube URLs
      let processedContent = content.replace(youtubeRegex, (match, videoId) => {
        return `[YOUTUBE:${videoId}]`
      })
      
      // Then handle other links
      const parts = processedContent.split(linkRegex)
      
      return parts.map((part, index) => {
        if (part.startsWith('[YOUTUBE:')) {
          const videoId = part.replace('[YOUTUBE:', '').replace(']', '')
          return (
            <div key={index} className="my-4">
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg max-w-full"
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
              className="link-neon"
            >
              {part}
            </a>
          )
        }
        return part
      })
    }

  const renderHTMLContent = (content) => {
    // Handle line breaks and paragraphs properly
    const lines = content.split('\n')
    
    return lines.map((line, lineIndex) => {
      // Skip empty lines
      if (line.trim() === '') {
        return <br key={`line-break-${lineIndex}`} />
      }
      
      // Check if this line contains a YouTube URL
      const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g
      const youtubeMatch = line.match(youtubeRegex)
      
      if (youtubeMatch) {
        const videoId = youtubeMatch[0].match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)[1]
        return (
          <div key={`youtube-${lineIndex}`} className="my-4">
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg max-w-full"
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


  return (
    <article className={`card ${isPinned ? 'card-admin' : ''} group`}>
      {/* Admin Badge for Pinned Posts */}
      {isPinned && (
        <div className="flex items-center mb-4">
          <span className="bg-primary-500 text-dark-950 px-3 py-1 rounded-full text-sm font-bold">
            ADMIN
          </span>
        </div>
      )}

      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <User size={16} />
            <span className="font-medium">{post.author || 'Anonymous'}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>{formatDate(post.timestamp)}</span>
          </div>
        </div>
        

        {/* Admin Controls */}
        {isAdminAuthenticated && (
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handlePinToggle}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-primary-400 transition-all duration-300"
            title={isPinned ? 'Unpin post' : 'Pin post'}
          >
            {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-primary-400 transition-all duration-300"
            title="Edit post"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-dark-700 hover:bg-red-600 text-gray-400 hover:text-white transition-all duration-300"
            title="Delete post"
          >
            <Trash2 size={16} />
          </button>
        </div>
        )}
      </div>

      {/* Post Content */}
      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({...editData, title: e.target.value})}
            placeholder="Post title"
            className="input-field w-full"
          />
          <RichTextEditor
            value={editData.content}
            onChange={(value) => setEditData({...editData, content: value})}
            placeholder="Post content"
          />
          <input
            type="text"
            value={editData.author}
            onChange={(e) => setEditData({...editData, author: e.target.value})}
            placeholder="Author name"
            className="input-field w-full"
          />
          <div className="flex space-x-3">
            <button onClick={handleSave} className="btn-primary">
              Save Changes
            </button>
            <button 
              onClick={() => setIsEditing(false)} 
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {post.title && (
            <h3 className="text-xl font-heading font-bold text-primary-400">
              {post.title}
            </h3>
          )}
          {post.content && (
            <div className="text-gray-300 leading-relaxed">
              {renderHTMLContent(post.content)}
            </div>
          )}
          {post.imageUrl && (
            <div className="mt-4">
              <img 
                src={post.imageUrl} 
                alt={post.title || 'Post image'}
                className="w-full min-w-[300px] max-w-[500px] h-auto rounded-lg border border-dark-600"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Like Button - Below post content */}
      <div className="mt-4 pt-3 border-t border-dark-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLikeToggle}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
              isLikedByUser()
                ? 'bg-red-600 text-white'
                : 'bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-red-400'
            }`}
            title={isLikedByUser() ? 'Unlike post' : 'Like post'}
          >
            <Heart 
              size={16} 
              fill={isLikedByUser() ? 'currentColor' : 'none'} 
            />
            <span className="text-sm">
              {isLikedByUser() ? 'Liked' : 'Like'}
            </span>
          </button>
          {post.likes && post.likes.length > 0 && (
            <span className="text-sm text-gray-400">
              {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export default Post
