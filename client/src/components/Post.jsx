import React, { useState } from 'react'
import { Pin, PinOff, Edit, Trash2, User, Clock } from 'lucide-react'

const Post = ({ post, isPinned, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: post.title || '',
    content: post.content || '',
    author: post.author || 'Anonymous'
  })

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

  const renderContent = (content) => {
    // Simple link detection and rendering
    const linkRegex = /(https?:\/\/[^\s]+)/g
    const parts = content.split(linkRegex)
    
    return parts.map((part, index) => {
      if (linkRegex.test(part)) {
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
    // Simple HTML parsing with regex for better performance
    const parts = content.split(/(<[^>]+>)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('<') && part.endsWith('>')) {
        const tagMatch = part.match(/^<(\/?)([^>\s]+)([^>]*)>$/)
        if (tagMatch) {
          const [, closing, tagName, attributes] = tagMatch
          
          if (closing) {
            return null // Closing tags are handled by opening tags
          }
          
          switch (tagName.toLowerCase()) {
            case 'b':
              return { type: 'bold', key: `bold-${index}` }
            case 'i':
              return { type: 'italic', key: `italic-${index}` }
            case 'strong':
              return { type: 'strong', key: `strong-${index}` }
            case 'em':
              return { type: 'em', key: `em-${index}` }
            case 'br':
              return <br key={`br-${index}`} />
            case 'p':
              return { type: 'paragraph', key: `p-${index}` }
            default:
              return null
          }
        }
      }
      return { type: 'text', content: part, key: `text-${index}` }
    }).filter(Boolean)
  }

  const renderFormattedContent = (content) => {
    const elements = renderHTMLContent(content)
    const result = []
    let currentFormatting = []
    
    elements.forEach((element, index) => {
      if (element.type === 'text') {
        let text = element.content
        if (text) {
          // Apply current formatting
          let formattedText = renderContent(text)
          
          // Apply formatting stack
          currentFormatting.reverse().forEach(format => {
            switch (format) {
              case 'bold':
                formattedText = <b key={`format-${index}-${format}`}>{formattedText}</b>
                break
              case 'italic':
                formattedText = <i key={`format-${index}-${format}`}>{formattedText}</i>
                break
              case 'strong':
                formattedText = <strong key={`format-${index}-${format}`} className="text-primary-400 font-bold">{formattedText}</strong>
                break
              case 'em':
                formattedText = <em key={`format-${index}-${format}`}>{formattedText}</em>
                break
            }
          })
          
          result.push(formattedText)
        }
      } else if (element.type === 'bold') {
        currentFormatting.push('bold')
      } else if (element.type === 'italic') {
        currentFormatting.push('italic')
      } else if (element.type === 'strong') {
        currentFormatting.push('strong')
      } else if (element.type === 'em') {
        currentFormatting.push('em')
      } else if (element.type === 'paragraph') {
        currentFormatting.push('paragraph')
      } else if (element === null) {
        // Closing tag - remove from formatting stack
        currentFormatting.pop()
      } else {
        // Direct elements like <br>
        result.push(element)
      }
    })
    
    return result
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
          <textarea
            value={editData.content}
            onChange={(e) => setEditData({...editData, content: e.target.value})}
            placeholder="Post content"
            rows={4}
            className="input-field w-full resize-none"
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
              {renderFormattedContent(post.content)}
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
    </article>
  )
}

export default Post
