import React, { useState } from 'react'
import { Send, User, Image, Type } from 'lucide-react'
import RichTextEditor from './RichTextEditor'

const NewPostForm = ({ onAddPost }) => {
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
      await onAddPost({
        ...formData,
        author: formData.author || 'Anonymous'
      })
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        author: '',
        imageUrl: ''
      })
    } catch (error) {
      console.error('Failed to submit post:', error)
      alert('Failed to submit post. Please try again.')
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
      <h2 className="text-xl font-heading font-bold text-primary-500 mb-6 flex items-center">
        <Type size={24} className="mr-3" />
        Create New Post
      </h2>
      
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
            className="input-field w-full h-24 text-base"
          />
        </div>

        {/* Title Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <Type size={16} className="mr-2" />
            Post Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Post title (optional)"
            className="input-field w-full h-24 text-base"
          />
        </div>

        {/* Content Field with Rich Text Editor */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Post Content
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
            placeholder="Image URL (optional)"
            className="input-field w-full h-24 text-base"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-dark-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3"
          >
            <Send size={20} />
            <span>{isSubmitting ? 'Posting...' : 'Create Post'}</span>
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-dark-800/50 rounded-lg">
        <p className="text-sm text-gray-400">
          <strong>Tips:</strong> You can include links in your post content - they'll be automatically clickable. 
          Image URLs will be displayed as images. At least one field (title, content, or image) is required.
        </p>
      </div>
    </div>
  )
}

export default NewPostForm
