import React, { useState, useEffect } from 'react'
import { Plus, MessageSquare, Users, Clock, Edit, Trash2, Info, X, GripVertical } from 'lucide-react'
import RichTextEditor from './RichTextEditor'

const BoardList = ({ isAdminAuthenticated, onBoardSelect, config }) => {
  const [boards, setBoards] = useState([])
  const [boardThreadCounts, setBoardThreadCounts] = useState({})
  const [showCreateBoard, setShowCreateBoard] = useState(false)
  const [newBoard, setNewBoard] = useState({ name: '', description: '' })
  const [isCreating, setIsCreating] = useState(false)
  const [editingBoard, setEditingBoard] = useState(null)
  const [editBoardData, setEditBoardData] = useState({ name: '', description: '' })
  const [infoPosts, setInfoPosts] = useState([])
  const [showCreateInfoPost, setShowCreateInfoPost] = useState(false)
  const [newInfoPost, setNewInfoPost] = useState({ title: '', content: '', imageUrl: '' })
  const [isCreatingInfoPost, setIsCreatingInfoPost] = useState(false)
  const [draggedBoard, setDraggedBoard] = useState(null)
  const [isReordering, setIsReordering] = useState(false)

  useEffect(() => {
    loadBoards()
    loadInfoPosts()
  }, [])

  const loadBoards = async () => {
    try {
      const response = await fetch('/api/boards')
      if (response.ok) {
        const data = await response.json()
        setBoards(data.boards || [])
        
        // Load thread counts for each board
        const threadCounts = {}
        for (const board of data.boards || []) {
          try {
            const threadsResponse = await fetch(`/api/boards/${board.id}/threads`)
            if (threadsResponse.ok) {
              const threadsData = await threadsResponse.json()
              threadCounts[board.id] = threadsData.threads?.length || 0
            }
          } catch (error) {
            console.error(`Failed to load thread count for board ${board.id}:`, error)
            threadCounts[board.id] = 0
          }
        }
        setBoardThreadCounts(threadCounts)
      }
    } catch (error) {
      console.error('Failed to load boards:', error)
    }
  }

  const loadInfoPosts = async () => {
    try {
      const response = await fetch('/api/info-posts')
      if (response.ok) {
        const data = await response.json()
        setInfoPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Failed to load info posts:', error)
    }
  }

  const handleCreateInfoPost = async (e) => {
    e.preventDefault()
    if (!newInfoPost.title || !newInfoPost.content) return

    setIsCreatingInfoPost(true)
    try {
      const response = await fetch('/api/info-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInfoPost)
      })

      if (response.ok) {
        setNewInfoPost({ title: '', content: '', imageUrl: '' })
        setShowCreateInfoPost(false)
        loadInfoPosts()
      } else {
        const error = await response.json()
        alert('Failed to create info post: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to create info post:', error)
      alert('Failed to create info post')
    } finally {
      setIsCreatingInfoPost(false)
    }
  }

  const handleDeleteInfoPost = async (postId) => {
    if (!confirm('Are you sure you want to delete this info post?')) return

    try {
      const response = await fetch(`/api/info-posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadInfoPosts()
      } else {
        const error = await response.json()
        alert('Failed to delete info post: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to delete info post:', error)
      alert('Failed to delete info post')
    }
  }

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    if (!newBoard.name || !newBoard.description) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBoard)
      })

      if (response.ok) {
        setNewBoard({ name: '', description: '' })
        setShowCreateBoard(false)
        loadBoards() // This will reload boards and thread counts
      } else {
        const error = await response.json()
        alert('Failed to create board: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to create board:', error)
      alert('Failed to create board')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditBoard = (board) => {
    setEditBoardData({
      name: board.name,
      description: board.description
    })
    setEditingBoard(board.id)
  }

  const handleSaveBoardEdit = async () => {
    try {
      const response = await fetch(`/api/boards/${editingBoard}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editBoardData)
      })

      if (response.ok) {
        setEditingBoard(null)
        loadBoards() // This will reload boards and thread counts
      } else {
        const error = await response.json()
        alert('Failed to update board: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to update board:', error)
      alert('Failed to update board')
    }
  }

  const handleDeleteBoard = async (boardId) => {
    if (!confirm('Are you sure you want to delete this board? This will also delete all threads and replies in this board.')) return

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadBoards() // This will reload boards and thread counts
      } else {
        const error = await response.json()
        alert('Failed to delete board: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to delete board:', error)
      alert('Failed to delete board')
    }
  }

  const handleDragStart = (e, board) => {
    if (!isAdminAuthenticated) return
    console.log('Drag start:', board.id)
    setDraggedBoard(board)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', board.id)
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedBoard(null)
  }

  const handleDragOver = (e) => {
    if (!isAdminAuthenticated || !draggedBoard) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetBoard) => {
    if (!isAdminAuthenticated || !draggedBoard) return
    
    e.preventDefault()
    console.log('Drop on:', targetBoard.id, 'from:', draggedBoard.id)
    
    if (draggedBoard.id === targetBoard.id) return
    
    setIsReordering(true)
    
    try {
      // Create new board order
      const newBoards = [...boards]
      const draggedIndex = newBoards.findIndex(b => b.id === draggedBoard.id)
      const targetIndex = newBoards.findIndex(b => b.id === targetBoard.id)
      
      // Remove dragged board from its current position
      const [draggedItem] = newBoards.splice(draggedIndex, 1)
      
      // Insert at new position
      newBoards.splice(targetIndex, 0, draggedItem)
      
      // Update local state immediately for better UX
      setBoards(newBoards)
      
      // Send to server
      const boardIds = newBoards.map(b => b.id)
      const response = await fetch('/api/boards/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardIds })
      })
      
      if (!response.ok) {
        // Revert on error
        loadBoards()
        alert('Failed to reorder boards')
      }
    } catch (error) {
      console.error('Failed to reorder boards:', error)
      // Revert on error
      loadBoards()
      alert('Failed to reorder boards')
    } finally {
      setIsReordering(false)
    }
  }

  const renderHTMLContent = (content) => {
    if (!content) return ''
    
    // Split by newlines first
    const lines = content.split('\n')
    const processedLines = lines.map((line, index) => {
      if (line.trim() === '') {
        return <br key={index} />
      }
      
      // Create a temporary div to parse HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = line
      
      // Process each child node
      const processedNodes = Array.from(tempDiv.childNodes).map((node, nodeIndex) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName.toLowerCase()
          const className = node.className || ''
          const style = node.style.cssText || ''
          
          switch (tagName) {
            case 'b':
            case 'strong':
              return <strong key={nodeIndex} className="font-bold text-white">{node.textContent}</strong>
            case 'i':
            case 'em':
              return <em key={nodeIndex} className="italic text-gray-300">{node.textContent}</em>
            case 'img':
              const src = node.getAttribute('src')
              const alt = node.getAttribute('alt') || ''
              return (
                <img
                  key={nodeIndex}
                  src={src}
                  alt={alt}
                  className="min-w-[300px] max-w-[500px] h-auto rounded-lg my-2"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )
            case 'iframe':
              const iframeSrc = node.getAttribute('src')
              const iframeWidth = node.getAttribute('width') || '560'
              const iframeHeight = node.getAttribute('height') || '315'
              const iframeTitle = node.getAttribute('title') || 'Embedded content'
              
              // Check if it's a YouTube Short
              const isYouTubeShort = iframeSrc && iframeSrc.includes('youtube.com/embed/') && iframeHeight > '400'
              
              return (
                <iframe
                  key={nodeIndex}
                  src={iframeSrc}
                  width={iframeWidth}
                  height={iframeHeight}
                  title={iframeTitle}
                  frameBorder="0"
                  allowFullScreen
                  className={isYouTubeShort ? "max-w-sm mx-auto" : "w-full max-w-2xl mx-auto"}
                />
              )
            default:
              return <span key={nodeIndex} dangerouslySetInnerHTML={{ __html: node.outerHTML }} />
          }
        }
        return null
      })
      
      return (
        <div key={index} className="mb-1">
          {processedNodes}
        </div>
      )
    })
    
    return processedLines
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 mb-4">
            NIGGA SCIENCE
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            The ultimate imageboard for nigga science discussions
          </p>
          
          {/* Token Contract Address */}
          {config?.tokenCA && (
            <div className="mb-8">
              <div className="inline-block bg-dark-800/50 border border-primary-500/30 rounded-lg px-6 py-3">
                <p className="text-sm text-gray-400 mb-1">Token Contract Address</p>
                <p className="text-primary-400 font-mono text-sm break-all">
                  {config.tokenCA}
                </p>
                <div className="flex justify-center space-x-4 mt-3">
                  {config.socialLinks?.dexscreener && (
                    <a
                      href={`${config.socialLinks.dexscreener}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300 underline"
                    >
                      View on Dexscreener
                    </a>
                  )}
                  {config.socialLinks?.pumpfun && (
                    <a
                      href={`${config.socialLinks.pumpfun}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300 underline"
                    >
                      View on Pump Fun
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {isAdminAuthenticated && (
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={() => setShowCreateBoard(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Create New Board</span>
              </button>
              <p className="text-sm text-gray-400 text-center">
                💡 <strong>Admin Tip:</strong> Drag and drop boards to reorder them
              </p>
            </div>
          )}
        </div>

        {/* Create Board Modal */}
        {showCreateBoard && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="card max-w-md w-full mx-4">
              <h3 className="text-xl font-heading font-bold text-primary-500 mb-4">
                Create New Board
              </h3>
              <form onSubmit={handleCreateBoard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Board Name
                  </label>
                  <input
                    type="text"
                    value={newBoard.name}
                    onChange={(e) => setNewBoard({...newBoard, name: e.target.value})}
                    placeholder="e.g., Technology"
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newBoard.description}
                    onChange={(e) => setNewBoard({...newBoard, description: e.target.value})}
                    placeholder="Brief description of this board"
                    className="input-field w-full h-24 resize-none"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="btn-primary flex-1"
                  >
                    {isCreating ? 'Creating...' : 'Create Board'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateBoard(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Boards Grid */}
        {isReordering && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-primary-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-400"></div>
              <span>Reordering boards...</span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className={`card hover:bg-dark-700/50 transition-all duration-300 group relative h-80 flex flex-col ${
                isAdminAuthenticated ? 'cursor-move' : ''
              } ${draggedBoard?.id === board.id ? 'opacity-50' : ''}`}
              draggable={isAdminAuthenticated}
              onDragStart={(e) => {
                e.stopPropagation()
                handleDragStart(e, board)
              }}
              onDragEnd={(e) => {
                e.stopPropagation()
                handleDragEnd(e)
              }}
              onDragOver={(e) => {
                e.stopPropagation()
                handleDragOver(e)
              }}
              onDrop={(e) => {
                e.stopPropagation()
                handleDrop(e, board)
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {isAdminAuthenticated && (
                    <GripVertical 
                      size={16} 
                      className="text-gray-500 cursor-move hover:text-gray-400 transition-colors" 
                    />
                  )}
                  <h3 className="text-xl font-heading font-bold text-primary-400 group-hover:text-primary-300">
                    /{board.id}/
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare size={20} className="text-gray-400 group-hover:text-primary-400" />
                  {isAdminAuthenticated && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditBoard(board)
                        }}
                        className="p-1 rounded bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-primary-400 transition-all duration-300"
                        title="Edit board"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteBoard(board.id)
                        }}
                        className="p-1 rounded bg-dark-700 hover:bg-red-600 text-gray-400 hover:text-white transition-all duration-300"
                        title="Delete board"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {editingBoard === board.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Board Name
                    </label>
                    <input
                      type="text"
                      value={editBoardData.name}
                      onChange={(e) => setEditBoardData({...editBoardData, name: e.target.value})}
                      className="input-field w-full text-sm"
                      placeholder="Board name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editBoardData.description}
                      onChange={(e) => setEditBoardData({...editBoardData, description: e.target.value})}
                      className="input-field w-full text-sm h-16 resize-none"
                      placeholder="Board description"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveBoardEdit}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingBoard(null)}
                      className="btn-secondary text-sm px-3 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {board.name}
                  </h4>
                  
                  <p className="text-gray-400 text-sm mb-4 flex-grow">
                    {board.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <MessageSquare size={14} />
                        <span>{boardThreadCounts[board.id] || 0} threads</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>Created {new Date(board.created).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {board.admin && (
                      <span className="bg-primary-600 text-white px-2 py-1 rounded text-xs">
                        Admin
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onBoardSelect(board)}
                    className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    View Board
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Admin Info Posts Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary-400 flex items-center space-x-2">
              <Info size={24} />
              <span>Information Posts</span>
            </h2>
            {isAdminAuthenticated && (
              <button
                onClick={() => setShowCreateInfoPost(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>New Info Post</span>
              </button>
            )}
          </div>

            {/* Info Posts List */}
            {infoPosts.length > 0 ? (
              <div className="space-y-4">
                {infoPosts.map((post) => (
                  <div key={post.id} className="card">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-primary-400">{post.title}</h3>
                      {isAdminAuthenticated && (
                        <button
                          onClick={() => handleDeleteInfoPost(post.id)}
                          className="p-1 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 transition-all duration-300"
                          title="Delete info post"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    {post.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={post.imageUrl}
                          alt="Info post image"
                          className="min-w-[300px] max-w-[500px] h-auto rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div className="text-gray-300">
                      {renderHTMLContent(post.content)}
                    </div>
                    <div className="text-xs text-gray-500 mt-4">
                      Posted {new Date(post.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Info size={48} className="mx-auto mb-4 text-gray-600" />
                <p>No information posts yet.</p>
                {isAdminAuthenticated && (
                  <p className="text-sm mt-2">Create one to share important updates with users.</p>
                )}
              </div>
            )}
        </div>

        {/* Create Info Post Modal */}
        {showCreateInfoPost && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-heading font-bold text-primary-500 mb-4">
                Create Information Post
              </h3>
              <form onSubmit={handleCreateInfoPost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Post Title
                  </label>
                  <input
                    type="text"
                    value={newInfoPost.title}
                    onChange={(e) => setNewInfoPost({...newInfoPost, title: e.target.value})}
                    placeholder="e.g., Important Update"
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={newInfoPost.imageUrl}
                    onChange={(e) => setNewInfoPost({...newInfoPost, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Post Content
                  </label>
                  <RichTextEditor
                    value={newInfoPost.content}
                    onChange={(content) => setNewInfoPost({...newInfoPost, content})}
                    placeholder="Write your information post here..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isCreatingInfoPost}
                    className="btn-primary flex-1"
                  >
                    {isCreatingInfoPost ? 'Creating...' : 'Create Post'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateInfoPost(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Click on a board to view threads and start discussions</p>
        </div>
      </div>
    </div>
  )
}

export default BoardList
