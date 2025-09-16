import React from 'react'
import Post from './Post'
import NewPostForm from './NewPostForm'

const Board = ({ posts, onAddPost, onRefresh, isAdminAuthenticated }) => {
  return (
    <div className="space-y-8">
      {/* Pinned Posts */}
      {posts.pinned && posts.pinned.length > 0 && (
        <section>
          <h2 className="text-2xl font-heading font-bold text-primary-500 mb-6 flex items-center">
            <span className="w-2 h-2 bg-primary-500 rounded-full mr-3 animate-pulse"></span>
            Pinned Posts
          </h2>
          <div className="grid gap-4">
            {posts.pinned.map(post => (
              <Post 
                key={post.id} 
                post={post} 
                isPinned={true}
                onRefresh={onRefresh}
                isAdminAuthenticated={isAdminAuthenticated}
              />
            ))}
          </div>
        </section>
      )}

      {/* User Posts */}
      <section>
        <h2 className="text-2xl font-heading font-bold text-primary-500 mb-6 flex items-center">
          <span className="w-2 h-2 bg-accent-blue rounded-full mr-3 animate-pulse"></span>
          Latest Posts
        </h2>
        <div className="grid gap-4">
          {posts.user && posts.user.length > 0 ? (
            posts.user.map(post => (
              <Post 
                key={post.id} 
                post={post} 
                isPinned={false}
                onRefresh={onRefresh}
                isAdminAuthenticated={isAdminAuthenticated}
              />
            ))
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-400 text-lg">
                No posts yet. Be the first to share something!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* New Post Form - Moved to the bottom */}
      <section>
        <h2 className="text-2xl font-heading font-bold text-primary-500 mb-6 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
          Create New Post
        </h2>
        <NewPostForm onAddPost={onAddPost} />
      </section>
    </div>
  )
}

export default Board
