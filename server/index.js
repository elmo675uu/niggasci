import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import sanitizeHtml from 'sanitize-html'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5001

// File paths
const POSTS_FILE = path.join(__dirname, 'posts.json')
const CONFIG_FILE = path.join(__dirname, 'config.json')
const BOARDS_FILE = path.join(__dirname, 'boards.json')

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://127.0.0.1:5001"],
      frameSrc: ["'self'", "https://www.youtube.com"]
    }
  }
}))

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS ? 
  process.env.CORS_ORIGINS.split(',') : 
  ['http://localhost:3000', 'http://127.0.0.1:3000']

app.use(cors({
  origin: corsOrigins,
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})

app.use(limiter)

// Body parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.text({ type: 'text/plain', limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Fallback: if body came as plain text "key:value" lines, coerce to object
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'string') {
    const text = req.body.trim()
    try {
      req.body = JSON.parse(text)
      req.headers['content-type'] = 'application/json'
    } catch (e) {
      // Not JSON, leave as text
    }
  }
  next()
})

// Initialize data files if they don't exist
async function initializeFiles() {
  try {
    // Initialize boards.json
    try {
      await fs.access(BOARDS_FILE)
    } catch {
      const initialBoards = {
        boards: [
          {
            id: "general",
            name: "General",
            description: "General discussions about nigga science",
            created: Date.now(),
            admin: true
          },
          {
            id: "science",
            name: "Science",
            description: "Scientific discussions and research",
            created: Date.now(),
            admin: true
          },
          {
            id: "memes",
            name: "Memes",
            description: "Funny content and memes",
            created: Date.now(),
            admin: true
          }
        ]
      }
      await fs.writeFile(BOARDS_FILE, JSON.stringify(initialBoards, null, 2))
    }

    // Initialize posts.json with new structure
    try {
      await fs.access(POSTS_FILE)
    } catch {
      const initialPosts = {
        threads: {},
        replies: {}
      }
      await fs.writeFile(POSTS_FILE, JSON.stringify(initialPosts, null, 2))
    }

    // Initialize config.json
    try {
      await fs.access(CONFIG_FILE)
    } catch {
      const initialConfig = {
        title: "NIGGA SCIENCE",
        description: "The ultimate imageboard for nigga science discussions",
        socialLinks: {
          twitter: "https://twitter.com/niggascience",
          telegram: "https://t.me/niggascience",
          discord: "https://discord.gg/niggascience",
          medium: "https://medium.com/@niggascience"
        },
        audioUrl: "/theme.mp3",
        audioAutoplay: true,
        audioLoop: true,
        audioVolume: 0.3
      }
      await fs.writeFile(CONFIG_FILE, JSON.stringify(initialConfig, null, 2))
    }
  } catch (error) {
    console.error('Error initializing files:', error)
  }
}

// Sanitization function
function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  return sanitizeHtml(input, {
    allowedTags: ['b', 'i', 'em', 'strong', 'br', 'p', 'iframe'],
    allowedAttributes: {
      'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'title']
    },
    allowedSchemes: ['http', 'https'],
    allowedSchemesByTag: {
      'iframe': ['http', 'https']
    },
    disallowedTagsMode: 'discard'
  })
}

// Validation functions
function validatePost(post) {
  const errors = []
  
  if (!post.title && !post.content && !post.imageUrl) {
    errors.push('At least one field (title, content, or image) is required')
  }
  
  if (post.title && post.title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }
  
  if (post.content && post.content.length > 10000) {
    errors.push('Content must be less than 10,000 characters')
  }
  
  if (post.author && post.author.length > 50) {
    errors.push('Author name must be less than 50 characters')
  }
  
  return errors
}

// API Routes

// Get all boards
app.get('/api/boards', async (req, res) => {
  try {
    const data = await fs.readFile(BOARDS_FILE, 'utf8')
    const boards = JSON.parse(data)
    res.json(boards)
  } catch (error) {
    console.error('Error reading boards:', error)
    res.status(500).json({ error: 'Failed to read boards' })
  }
})

// Create new board (admin only)
app.post('/api/boards', async (req, res) => {
  try {
    const { name, description } = req.body
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' })
    }
    
    const data = await fs.readFile(BOARDS_FILE, 'utf8')
    const boards = JSON.parse(data)
    
    const boardId = name.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    // Check if board already exists
    if (boards.boards.find(b => b.id === boardId)) {
      return res.status(400).json({ error: 'Board already exists' })
    }
    
    const newBoard = {
      id: boardId,
      name: sanitizeInput(name),
      description: sanitizeInput(description),
      created: Date.now(),
      admin: true
    }
    
    boards.boards.push(newBoard)
    await fs.writeFile(BOARDS_FILE, JSON.stringify(boards, null, 2))
    
    res.json({ success: true, board: newBoard })
  } catch (error) {
    console.error('Error creating board:', error)
    res.status(500).json({ error: 'Failed to create board' })
  }
})

// Get threads for a board
app.get('/api/boards/:boardId/threads', async (req, res) => {
  try {
    const { boardId } = req.params
    const data = await fs.readFile(POSTS_FILE, 'utf8')
    const posts = JSON.parse(data)
    
    const boardThreads = posts.threads[boardId] || []
    res.json({ threads: boardThreads })
  } catch (error) {
    console.error('Error reading threads:', error)
    res.status(500).json({ error: 'Failed to read threads' })
  }
})

// Create new thread
app.post('/api/boards/:boardId/threads', async (req, res) => {
  try {
    const { boardId } = req.params
    const { title, content, author, imageUrl } = req.body
    
    const errors = validatePost({ title, content, author, imageUrl })
    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }
    
    const data = await fs.readFile(POSTS_FILE, 'utf8')
    const posts = JSON.parse(data)
    
    const threadId = uuidv4()
    const newThread = {
      id: threadId,
      boardId,
      title: sanitizeInput(title),
      content: sanitizeInput(content),
      author: sanitizeInput(author) || 'Anonymous',
      imageUrl: imageUrl ? sanitizeInput(imageUrl) : '',
      timestamp: Date.now(),
      likes: [],
      replyCount: 0
    }
    
    if (!posts.threads[boardId]) {
      posts.threads[boardId] = []
    }
    
    posts.threads[boardId].unshift(newThread)
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2))
    
    res.json({ success: true, thread: newThread })
  } catch (error) {
    console.error('Error creating thread:', error)
    res.status(500).json({ error: 'Failed to create thread' })
  }
})

// Get thread with replies
app.get('/api/threads/:threadId', async (req, res) => {
  try {
    const { threadId } = req.params
    const data = await fs.readFile(POSTS_FILE, 'utf8')
    const posts = JSON.parse(data)
    
    // Find thread
    let thread = null
    for (const boardId in posts.threads) {
      const found = posts.threads[boardId].find(t => t.id === threadId)
      if (found) {
        thread = found
        break
      }
    }
    
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' })
    }
    
    // Get replies
    const replies = posts.replies[threadId] || []
    
    res.json({ thread, replies })
  } catch (error) {
    console.error('Error reading thread:', error)
    res.status(500).json({ error: 'Failed to read thread' })
  }
})

// Create reply to thread
app.post('/api/threads/:threadId/replies', async (req, res) => {
  try {
    const { threadId } = req.params
    const { content, author, imageUrl } = req.body
    
    const errors = validatePost({ content, author, imageUrl })
    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }
    
    const data = await fs.readFile(POSTS_FILE, 'utf8')
    const posts = JSON.parse(data)
    
    const replyId = uuidv4()
    const newReply = {
      id: replyId,
      threadId,
      content: sanitizeInput(content),
      author: sanitizeInput(author) || 'Anonymous',
      imageUrl: imageUrl ? sanitizeInput(imageUrl) : '',
      timestamp: Date.now(),
      likes: []
    }
    
    if (!posts.replies[threadId]) {
      posts.replies[threadId] = []
    }
    
    posts.replies[threadId].push(newReply)
    
    // Update thread reply count
    for (const boardId in posts.threads) {
      const thread = posts.threads[boardId].find(t => t.id === threadId)
      if (thread) {
        thread.replyCount = (thread.replyCount || 0) + 1
        break
      }
    }
    
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2))
    
    res.json({ success: true, reply: newReply })
  } catch (error) {
    console.error('Error creating reply:', error)
    res.status(500).json({ error: 'Failed to create reply' })
  }
})

// Like/unlike thread or reply
app.post('/api/posts/:id/:action', async (req, res) => {
  try {
    const { id, action } = req.params
    
    if (!['like', 'unlike'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' })
    }
    
    const data = await fs.readFile(POSTS_FILE, 'utf8')
    const posts = JSON.parse(data)
    
    // Find post (thread or reply)
    let post = null
    let isThread = false
    
    // Check threads
    for (const boardId in posts.threads) {
      const found = posts.threads[boardId].find(t => t.id === id)
      if (found) {
        post = found
        isThread = true
        break
      }
    }
    
    // Check replies
    if (!post) {
      for (const threadId in posts.replies) {
        const found = posts.replies[threadId].find(r => r.id === id)
        if (found) {
          post = found
          break
        }
      }
    }
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    
    // Initialize likes array if it doesn't exist
    if (!post.likes) {
      post.likes = []
    }
    
    const userId = req.ip + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    if (action === 'like') {
      if (!post.likes.includes(userId)) {
        post.likes.push(userId)
      }
    } else if (action === 'unlike') {
      post.likes = post.likes.filter(like => like !== userId)
    }
    
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2))
    
    res.json({ 
      success: true, 
      post: {
        id: post.id,
        likes: post.likes || [],
        likeCount: (post.likes || []).length
      }
    })
  } catch (error) {
    console.error('Error toggling like:', error)
    res.status(500).json({ error: 'Failed to toggle like' })
  }
})

// Get config
app.get('/api/config', async (req, res) => {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8')
    const config = JSON.parse(data)
    res.json(config)
  } catch (error) {
    console.error('Error reading config:', error)
    res.status(500).json({ error: 'Failed to read config' })
  }
})

// Update config (admin only)
app.put('/api/config', async (req, res) => {
  try {
    const newConfig = req.body
    await fs.writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2))
    res.json({ success: true })
  } catch (error) {
    console.error('Error updating config:', error)
    res.status(500).json({ error: 'Failed to update config' })
  }
})

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    if (password === adminPassword) {
      res.json({ success: true, message: 'Login successful' })
    } else {
      res.status(401).json({ error: 'Invalid password' })
    }
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  })
})

// Initialize files and start server
initializeFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch(error => {
  console.error('Failed to initialize:', error)
  process.exit(1)
})
