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
// multer removed - no more file uploads

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// File upload functionality removed - use external URLs only

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
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
  standardHeaders: true,
  legacyHeaders: false
})

const postLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 posts per minute
  message: 'Too many posts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
})

app.use(limiter)

// Body parsers (be tolerant of proxies changing content-type)
app.use(express.json({ limit: '10mb' }))
app.use(express.text({ type: 'text/plain', limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static file serving removed - no more uploads

// Fallback: if body came as plain text "key:value" lines, coerce to object
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'string') {
    const text = req.body.trim()
    // Try JSON first
    try {
      const parsed = JSON.parse(text)
      req.body = parsed
      return next()
    } catch (_) {}

    // Parse simple key:value or key=value lines
    const obj = {}
    const lines = text.split(/\r?\n|&/)
    for (const line of lines) {
      const m = line.split(/[:=]/)
      if (m.length >= 2) {
        const key = m[0].trim()
        const val = m.slice(1).join(':').trim()
        if (key) obj[key] = val
      }
    }
    if (Object.keys(obj).length > 0) {
      req.body = obj
    }
  }
  next()
})

// File paths
const POSTS_FILE = path.join(__dirname, 'posts.json')
const CONFIG_FILE = path.join(__dirname, 'config.json')
const BOARDS_FILE = path.join(__dirname, 'boards.json')

// Initialize data files if they don't exist
async function initializeFiles() {
  try {
    // Initialize posts.json
    try {
      await fs.access(POSTS_FILE)
    } catch {
      const initialPosts = {
        pinned: [
          {
            id: uuidv4(),
            title: "Welcome to NIGGA SCIENCE",
            content: "Welcome to the NIGGA SCIENCE imageboard! This is a community-driven platform for sharing ideas, images, and discussions. Feel free to post your thoughts, share images, or start conversations.\n\nRemember to be respectful and follow community guidelines. Let's build something amazing together!",
            author: "Admin",
            timestamp: Date.now(),
            pinned: true,
            admin: true
          },
          {
            id: uuidv4(),
            title: "How to Use This Platform",
            content: "Here's how to get started:\n\n1. **Create Posts**: Use the form at the top to create new posts. You can include text, images, or both.\n\n2. **Share Images**: Paste image URLs in the image field to display them in your posts.\n\n3. **Links**: Any URLs in your post content will automatically become clickable links.\n\n4. **Anonymous Posting**: You can post anonymously or choose a custom name.\n\n5. **Admin Posts**: Posts marked with 'ADMIN' are official announcements and updates.",
            author: "Admin",
            timestamp: Date.now() + 1000,
            pinned: true,
            admin: true
          },
          {
            id: uuidv4(),
            title: "Community Guidelines",
            content: "To maintain a positive community environment, please follow these guidelines:\n\n• Be respectful to other users\n• No spam or excessive posting\n• Keep content relevant and constructive\n• Report any inappropriate content\n• Have fun and be creative!\n\nViolations may result in post removal or temporary restrictions. Let's keep this space welcoming for everyone!",
            author: "Admin",
            timestamp: Date.now() + 2000,
            pinned: true,
            admin: true
          }
        ],
        user: []
      }
      await fs.writeFile(POSTS_FILE, JSON.stringify(initialPosts, null, 2))
    }

    // Initialize config.json
    try {
      await fs.access(CONFIG_FILE)
    } catch {
      const initialConfig = {
        title: "NIGGA SCIENCE",
        socialLinks: {
          twitter: "https://twitter.com/niggachain",
          dexscreener: "https://dexscreener.com/solana/niggachain",
          pumpfun: "https://pump.fun/niggachain"
        },
        audioUrl: "/theme.mp3",
        audioAutoplay: true,
        audioLoop: true,
        audioVolume: 0.5
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
    errors.push('At least one field (title, content, or imageUrl) is required')
  }
  
  if (post.title && post.title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }
  
  if (post.content && post.content.length > 4000) {
    errors.push('Content must be less than 4000 characters')
  }
  
  if (post.author && post.author.length > 50) {
    errors.push('Author name must be less than 50 characters')
  }
  
  if (post.imageUrl && !isValidUrl(post.imageUrl)) {
    errors.push('Invalid image URL format')
  }
  
  return errors
}

function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// Authentication middleware
async function authenticateAdmin(req, res, next) {
  const { password } = req.body
  
  if (!password) {
    return res.status(400).json({ error: 'Password required' })
  }
  
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  
  try {
    const isValid = await bcrypt.compare(password, adminPassword) || password === adminPassword
    if (isValid) {
      req.isAdmin = true
      next()
    } else {
      res.status(401).json({ error: 'Invalid password' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' })
  }
}

// Routes

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const data = await fs.readFile(POSTS_FILE, 'utf8')
    const posts = JSON.parse(data)
    res.json(posts)
  } catch (error) {
    console.error('Error reading posts:', error)
    res.status(500).json({ error: 'Failed to load posts' })
  }
})

// Create new post
app.post('/api/posts', postLimiter, async (req, res) => {
  try {
    const { title, content, author, imageUrl, pinned = false, admin = false } = req.body || {}
    
    // Validate input
    const errors = validatePost({ title, content, author, imageUrl })
    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }
    
    // Sanitize input
    const sanitizedPost = {
      id: uuidv4(),
      title: sanitizeInput(title),
      content: sanitizeInput(content),
      author: sanitizeInput(author) || 'Anonymous',
      imageUrl: imageUrl ? sanitizeInput(imageUrl) : '',
      timestamp: Date.now(),
      pinned: Boolean(pinned),
      admin: Boolean(admin)
    }
    
    // Read current posts
    const data = await fs.readFile(POSTS_FILE, 'utf8')
    const posts = JSON.parse(data)
    
    // Add new post
    if (sanitizedPost.pinned) {
      posts.pinned.push(sanitizedPost)
    } else {
      posts.user.push(sanitizedPost)
    }
    
    // Save posts
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2))
    
    res.status(201).json(sanitizedPost)
  } catch (error) {
    console.error('Error creating post:', error)
    res.status(500).json({ error: 'Failed to create post' })
  }
})

// File upload endpoint removed - use external URLs only

// Update post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, author, imageUrl } = req.body
    
    // Validate input
    const errors = validatePost({ title, content, author, imageUrl })
    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }
    
    // Read current posts
    const data = await fs.readFile(POSTS_FILE, 'utf8')
    const posts = JSON.parse(data)
    
    // Find and update post
    let postFound = false
    const allPosts = [...posts.pinned, ...posts.user]
    
    for (const post of allPosts) {
      if (post.id === id) {
        post.title = sanitizeInput(title)
        post.content = sanitizeInput(content)
        post.author = sanitizeInput(author) || 'Anonymous'
        post.imageUrl = imageUrl ? sanitizeInput(imageUrl) : ''
        post.updatedAt = Date.now()
        postFound = true
        break
      }
    }
    
    if (!postFound) {
      return res.status(404).json({ error: 'Post not found' })
    }
    
    // Save posts
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2))
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error updating post:', error)
    res.status(500).json({ error: 'Failed to update post' })
  }
})

// Delete post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Read current posts
    const data = await fs.readFile(POSTS_FILE, 'utf8')
    const posts = JSON.parse(data)
    
    // Remove post from both arrays
    posts.pinned = posts.pinned.filter(post => post.id !== id)
    posts.user = posts.user.filter(post => post.id !== id)
    
    // Save posts
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2))
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

// Pin/Unpin post
app.post('/api/posts/:id/:action', async (req, res) => {
  try {
    const { id, action } = req.params
    
    if (!['pin', 'unpin', 'like', 'unlike'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' })
    }
    
    // Read current posts
    const data = await fs.readFile(POSTS_FILE, 'utf8')
    const posts = JSON.parse(data)
    
    // Find post
    let post = null
    let sourceArray = null
    let targetArray = null
    
    // Check pinned posts
    const pinnedIndex = posts.pinned.findIndex(p => p.id === id)
    if (pinnedIndex !== -1) {
      post = posts.pinned[pinnedIndex]
      sourceArray = posts.pinned
      targetArray = posts.user
    } else {
      // Check user posts
      const userIndex = posts.user.findIndex(p => p.id === id)
      if (userIndex !== -1) {
        post = posts.user[userIndex]
        sourceArray = posts.user
        targetArray = posts.pinned
      }
    }
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    
    // Handle different actions
    if (action === 'pin' && sourceArray === posts.user) {
      posts.user.splice(posts.user.findIndex(p => p.id === id), 1)
      post.pinned = true
      posts.pinned.push(post)
    } else if (action === 'unpin' && sourceArray === posts.pinned) {
      posts.pinned.splice(posts.pinned.findIndex(p => p.id === id), 1)
      post.pinned = false
      posts.user.push(post)
    } else if (action === 'like') {
      // Initialize likes array if it doesn't exist
      if (!post.likes) {
        post.likes = []
      }
      // Generate a unique user ID for this session (could be enhanced with proper user auth)
      const userId = req.ip + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      // Add like with unique identifier
      if (!post.likes.includes(userId)) {
        post.likes.push(userId)
      }
    } else if (action === 'unlike') {
      // Initialize likes array if it doesn't exist
      if (!post.likes) {
        post.likes = []
      }
      // For unlike, we'll use a different approach - track by IP and timestamp
      const userLikeId = req.ip + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      // Remove the most recent like from this IP (simple approach)
      const ipLikes = post.likes.filter(like => like.startsWith(req.ip))
      if (ipLikes.length > 0) {
        const latestLike = ipLikes[ipLikes.length - 1]
        post.likes = post.likes.filter(like => like !== latestLike)
      }
    }
    
    // Save posts
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2))
    
    // Return the updated post data for live updates
    res.json({ 
      success: true, 
      post: {
        id: post.id,
        likes: post.likes || [],
        likeCount: (post.likes || []).length
      }
    })
  } catch (error) {
    console.error('Error toggling pin:', error)
    res.status(500).json({ error: 'Failed to toggle pin' })
  }
})

// Get configuration
app.get('/api/config', async (req, res) => {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8')
    const config = JSON.parse(data)
    res.json(config)
  } catch (error) {
    console.error('Error reading config:', error)
    res.status(500).json({ error: 'Failed to load configuration' })
  }
})

// Update configuration
app.put('/api/config', async (req, res) => {
  try {
    const newConfig = req.body
    
    // Validate required fields
    if (!newConfig.title) {
      return res.status(400).json({ error: 'Title is required' })
    }
    
    // Sanitize configuration
    const sanitizedConfig = {
      title: sanitizeInput(newConfig.title),
      socialLinks: {
        twitter: sanitizeInput(newConfig.socialLinks?.twitter || ''),
        telegram: sanitizeInput(newConfig.socialLinks?.telegram || ''),
        discord: sanitizeInput(newConfig.socialLinks?.discord || ''),
        medium: sanitizeInput(newConfig.socialLinks?.medium || '')
      },
      audioUrl: sanitizeInput(newConfig.audioUrl || ''),
      audioAutoplay: Boolean(newConfig.audioAutoplay),
      audioLoop: Boolean(newConfig.audioLoop),
      audioVolume: Math.max(0, Math.min(1, parseFloat(newConfig.audioVolume) || 0.5))
    }
    
    // Save configuration
    await fs.writeFile(CONFIG_FILE, JSON.stringify(sanitizedConfig, null, 2))
    
    res.json(sanitizedConfig)
  } catch (error) {
    console.error('Error updating config:', error)
    res.status(500).json({ error: 'Failed to update configuration' })
  }
})

// Admin login
app.post('/api/admin/login', authenticateAdmin, (req, res) => {
  res.json({ success: true, message: 'Login successful' })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Start server
async function startServer() {
  await initializeFiles()
  
  app.listen(PORT, () => {
    console.log(`🚀 NIGGA SCIENCE server running on port ${PORT}`)
    console.log(`📁 Data files: ${__dirname}`)
    console.log(`🔒 Admin password: ${process.env.ADMIN_PASSWORD || 'admin123'}`)
  })
}

startServer().catch(console.error)
