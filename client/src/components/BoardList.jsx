import React, { useState, useEffect } from 'react'
import { Plus, MessageSquare, Users, Clock, Edit, Trash2 } from 'lucide-react'

const BoardList = ({ isAdminAuthenticated, onBoardSelect, config }) => {
  const [boards, setBoards] = useState([])
  const [showCreateBoard, setShowCreateBoard] = useState(false)
  const [newBoard, setNewBoard] = useState({ name: '', description: '' })
  const [isCreating, setIsCreating] = useState(false)
  const [editingBoard, setEditingBoard] = useState(null)
  const [editBoardData, setEditBoardData] = useState({ name: '', description: '' })

  useEffect(() => {
    loadBoards()
  }, [])

  const loadBoards = async () => {
    try {
      const response = await fetch('/api/boards')
      if (response.ok) {
        const data = await response.json()
        setBoards(data.boards || [])
      }
    } catch (error) {
      console.error('Failed to load boards:', error)
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
        loadBoards()
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
        loadBoards()
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
        loadBoards()
      } else {
        const error = await response.json()
        alert('Failed to delete board: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to delete board:', error)
      alert('Failed to delete board')
    }
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
            <button
              onClick={() => setShowCreateBoard(true)}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <Plus size={20} />
              <span>Create New Board</span>
            </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className="card hover:bg-dark-700/50 transition-all duration-300 group relative"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-heading font-bold text-primary-400 group-hover:text-primary-300">
                  /{board.id}/
                </h3>
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
                  
                  <p className="text-gray-400 text-sm mb-4">
                    {board.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>Created {new Date(board.created).toLocaleDateString()}</span>
                    </div>
                    {board.admin && (
                      <span className="bg-primary-600 text-white px-2 py-1 rounded text-xs">
                        Admin
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onBoardSelect(board)}
                    className="w-full mt-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    View Board
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Click on a board to view threads and start discussions</p>
        </div>
      </div>
    </div>
  )
}

export default BoardList
