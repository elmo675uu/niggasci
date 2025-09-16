import React, { useState } from 'react'
import { Send, User, Image, Type, Upload } from 'lucide-react'
import RichTextEditor from './RichTextEditor'

const NewPostForm = ({ onAddPost }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    imageUrl: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')
  const [compressionInfo, setCompressionInfo] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('Form submission started with data:', formData)
    
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
      
      console.log('Submitting post with data:', postData)
      console.log('Image URL length:', postData.imageUrl ? postData.imageUrl.length : 0)
      
      await onAddPost(postData)
      
      console.log('Post submitted successfully, resetting form...')
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        author: '',
        imageUrl: ''
      })
      setUploadedImageUrl('')
      setCompressionInfo('')
    } catch (error) {
      console.error('Failed to submit post:', error)
      alert('Failed to submit post. Please try again. Error: ' + error.message)
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

  const compressImage = (file, maxSizeKB = 1000) => {
    return new Promise((resolve, reject) => {
      // Use FileReader for simple base64 conversion - NO CANVAS
      const reader = new FileReader()
      
      reader.onload = (event) => {
        try {
          const base64Data = event.target.result
          const sizeKB = (base64Data.length * 0.75) / 1024 // Approximate base64 to KB conversion
          
          console.log(`Original file size: ${(file.size / 1024).toFixed(1)}KB, Base64 size: ${sizeKB.toFixed(1)}KB`)
          
          // Always use the base64 data as-is, no compression
          // If it's too large, we'll let the backend handle it or warn the user
          resolve({
            dataUrl: base64Data,
            sizeKB: sizeKB.toFixed(1),
            quality: 1.0
          })
          
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = (error) => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('File selected:', file.name, file.type, file.size)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type)
      alert('Please select an image file')
      return
    }

    // Validate file size (10MB limit for original file)
    if (file.size > 10 * 1024 * 1024) {
      console.error('File too large:', file.size)
      alert('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    console.log('Starting image compression...')
    
    try {
      const result = await compressImage(file, 1000) // 1MB limit
      
      console.log(`Image processed: ${result.sizeKB}KB`)
      
      // Warn if file is large but still proceed
      if (parseFloat(result.sizeKB) > 1000) {
        console.warn(`Large image detected: ${result.sizeKB}KB (may take longer to upload)`)
        setCompressionInfo(`Large image: ${result.sizeKB}KB (may be slow to upload)`)
      } else {
        setCompressionInfo(`Image: ${result.sizeKB}KB`)
      }
      
      setUploadedImageUrl(result.dataUrl)
      setFormData(prev => ({
        ...prev,
        imageUrl: result.dataUrl
      }))
      setIsUploading(false)
      console.log('Image processing completed successfully')
    } catch (error) {
      console.error('Image processing error:', error)
      alert('Failed to process image: ' + error.message)
      setIsUploading(false)
    }
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
            className="input-field w-full"
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
            className="input-field w-full"
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
            className="input-field w-full"
          />
        </div>

        {/* File Upload Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <Upload size={16} className="mr-2" />
            Upload Image
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-dashed border-dark-600 hover:border-primary-500 cursor-pointer transition-colors ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400">
                {isUploading ? 'Uploading...' : 'Choose Image File'}
              </span>
            </label>
            {uploadedImageUrl && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-400">✓ Uploaded</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedImageUrl('')
                      setCompressionInfo('')
                      setFormData(prev => ({ ...prev, imageUrl: '' }))
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                {compressionInfo && (
                  <div className="text-xs text-gray-400">
                    {compressionInfo}
                  </div>
                )}
              </div>
            )}
          </div>
          {uploadedImageUrl && (
            <div className="mt-2">
              <img
                src={uploadedImageUrl}
                alt="Uploaded preview"
                className="max-w-xs max-h-32 object-cover rounded-lg border border-dark-600"
              />
            </div>
          )}
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
