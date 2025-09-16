import React, { useState } from 'react'
import { Send, User, Image, Type, X } from 'lucide-react'
import RichTextEditor from './RichTextEditor'

const NewThreadForm = ({ boardId, onThreadCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    imageUrl: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title && !formData.content && !formData.imageUrl) {
      alert('Please enter at least a title, content, or image URL')
      return
    }

    setIsSubmitting(true)
    
    try {
      const postData = {
        ...formData,
        author: formData.author || 'Anonymous'
      }
      
      const response = await fetch(`/api/boards/${boardId}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })
      
      if (response.ok) {
        onThreadCreated()
      } else {
        const error = await response.json()
        alert('Failed to create thread: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to create thread:', error)
      alert('Failed to create thread. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold text-primary-500 flex items-center">
          <Type size={24} className="mr-3" />
          Create New Thread
        </h2>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white transition-all duration-300"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Author Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <User size={16} className="mr-2" />
            Author Name
          </label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => handleChange('author', e.target.value)}
            placeholder="Your name (optional - defaults to Anonymous)"
            className="input-field w-full"
          />
        </div>

        {/* Title Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <Type size={16} className="mr-2" />
            Thread Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Thread title (optional)"
            className="input-field w-full"
          />
        </div>

        {/* Content Field with Rich Text Editor */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Content
          </label>
          <RichTextEditor
            value={formData.content}
            onChange={(value) => handleChange('content', value)}
            placeholder="What's on your mind? (optional)"
          />
        </div>

        {/* Image URL Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <Image size={16} className="mr-2" />
            Image URL
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            placeholder="https://example.com/image.jpg (optional)"
            className="input-field w-full"
          />
          <p className="text-xs text-gray-500">
            Use external image hosting services like Imgur, ImgBB, or similar for faster loading
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-dark-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3"
          >
            <Send size={20} />
            <span>{isSubmitting ? 'Creating...' : 'Create Thread'}</span>
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-dark-800/50 rounded-lg">
        <p className="text-sm text-gray-400">
          <strong>Tips:</strong> You can include links in your content - they'll be automatically clickable. 
          YouTube videos and Shorts will be embedded automatically. Use external image hosting for images. 
          At least one field (title, content, or image) is required.
        </p>
      </div>
    </div>
  )
}

export default NewThreadForm
