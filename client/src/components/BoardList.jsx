import React, { useState, useEffect } from 'react'
import { Plus, MessageSquare, Users, Clock } from 'lucide-react'

const BoardList = ({ isAdminAuthenticated, onBoardSelect }) => {
  const [boards, setBoards] = useState([])
  const [showCreateBoard, setShowCreateBoard] = useState(false)
  const [newBoard, setNewBoard] = useState({ name: '', description: '' })
  const [isCreating, setIsCreating] = useState(false)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 mb-4">
            NIGGA SCIENCE
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            The ultimate imageboard for nigga science discussions
          </p>
          
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
              onClick={() => onBoardSelect(board)}
              className="card hover:bg-dark-700/50 cursor-pointer transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-heading font-bold text-primary-400 group-hover:text-primary-300">
                  /{board.id}/
                </h3>
                <MessageSquare size={20} className="text-gray-400 group-hover:text-primary-400" />
              </div>
              
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
