# NIGGA SCIENCE - Imageboard

A modern, crypto-themed imageboard built with React and Express, inspired by the design system of niggachain.ai. Features a sleek dark theme with neon accents, audio autoplay, and a comprehensive admin panel.

## 🚀 Features

- **Modern Design**: Niggachain.ai inspired design system with neon gradients and dark theme
- **Real-time Posts**: Create, edit, and manage posts with image support
- **Admin Panel**: Password-protected admin interface for managing pinned posts and site configuration
- **Audio Integration**: Background music with autoplay fallback for browser compatibility
- **Security**: XSS protection, rate limiting, and input sanitization
- **Responsive**: Mobile-friendly design with Tailwind CSS
- **File-based Storage**: No database required - uses JSON files for data persistence

## 📁 Project Structure

```
niggachain-imageboard/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Header.jsx
│   │   │   ├── Board.jsx
│   │   │   ├── Post.jsx
│   │   │   ├── NewPostForm.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   └── AudioPlayer.jsx
│   │   ├── styles/
│   │   │   └── index.css   # Tailwind CSS styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   ├── bg.gif         # Background animation
│   │   ├── theme.mp3      # Background music
│   │   └── logo.svg       # Site logo
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                 # Express backend
│   ├── index.js           # Main server file
│   ├── package.json
│   ├── env.example        # Environment variables template
│   ├── posts.json         # Posts data (auto-generated)
│   └── config.json        # Site configuration (auto-generated)
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd niggachain-imageboard

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

```bash
# Copy the environment template
cd server
cp env.example .env

# Edit .env file with your settings
# Default admin password is 'admin123'
```

### 3. Run the Application

```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the client
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎨 Customization

### Changing the Site Title

**Option 1: Via Admin Panel**
1. Click the settings icon in the header
2. Enter admin password (default: `admin123`)
3. Go to "Configuration" tab
4. Update the "Site Title" field
5. Click "Save Configuration"

**Option 2: Direct File Edit**
Edit `server/config.json`:
```json
{
  "title": "Your Custom Title",
  "socialLinks": { ... }
}
```

### Updating Social Links

**Via Admin Panel:**
1. Access admin panel
2. Go to "Configuration" tab
3. Update social media URLs
4. Save changes

**Direct File Edit:**
Edit `server/config.json`:
```json
{
  "socialLinks": {
    "twitter": "https://twitter.com/yourusername",
    "telegram": "https://t.me/yourchannel",
    "discord": "https://discord.gg/yourinvite",
    "medium": "https://medium.com/@yourusername"
  }
}
```

### Changing Admin Password

1. Edit `server/.env` file:
```env
ADMIN_PASSWORD=your_secure_password_here
```

2. Restart the server

### Customizing Assets

**Background GIF:**
- Replace `client/public/bg.gif` with your own animated background
- Recommended size: 1920x1080 or similar
- Format: GIF, WebP, or MP4

**Logo:**
- Replace `client/public/logo.svg` with your custom logo
- SVG format recommended for scalability

**Background Music:**
- Replace `client/public/theme.mp3` with your audio file
- Supported formats: MP3, OGG, WAV
- Update `server/config.json` if using a different filename

### Styling Customization

**Color Scheme:**
Edit `client/tailwind.config.js` to modify the color palette:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#79ffa8', // Main neon green
        600: '#00e0a4', // Darker green
      },
      // Add your custom colors
    }
  }
}
```

**Typography:**
The project uses Space Grotesk for headings and Inter for body text. To change fonts:

1. Update Google Fonts import in `client/index.html`
2. Modify font families in `client/tailwind.config.js`

## 📝 Managing Posts

### Creating Admin Posts

1. Access admin panel (settings icon in header)
2. Enter admin password
3. Go to "Manage Posts" tab
4. Fill in title and content
5. Click "Create Post"

### Post Structure

Posts are stored in `server/posts.json` with the following structure:

```json
{
  "pinned": [
    {
      "id": "unique-uuid",
      "title": "Post Title",
      "content": "Post content with support for line breaks",
      "author": "Author Name",
      "imageUrl": "https://example.com/image.jpg",
      "timestamp": 1640995200000,
      "pinned": true,
      "admin": true
    }
  ],
  "user": [
    // Regular user posts with same structure
    // pinned: false, admin: false
  ]
}
```

### Post Features

- **Rich Text**: Basic HTML tags supported (bold, italic, line breaks)
- **Auto-links**: URLs automatically become clickable
- **Images**: Paste image URLs to display images in posts
- **Anonymous Posting**: Users can post without names (defaults to "Anonymous")
- **Admin Controls**: Pin/unpin, edit, and delete posts

## 🔒 Security Features

### Implemented Security Measures

- **Helmet.js**: Security headers and CSP
- **Rate Limiting**: Prevents spam and abuse
- **CORS**: Configurable cross-origin resource sharing
- **XSS Protection**: Input sanitization with sanitize-html
- **Input Validation**: Length limits and format validation
- **Password Protection**: Admin panel requires authentication

### Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Post Creation**: 5 posts per minute per IP

### Content Sanitization

All user input is sanitized to prevent XSS attacks:
- HTML tags are stripped except for basic formatting
- URLs are validated before processing
- Content length is limited

## 🎵 Audio Features

### Autoplay Behavior

The audio system handles browser autoplay restrictions:

1. **Initial Load**: Attempts muted autoplay
2. **User Interaction**: Shows overlay to enable sound
3. **Manual Control**: Floating audio controls in bottom-right
4. **Fallback**: Graceful degradation if audio fails

### Audio Configuration

Edit `server/config.json`:

```json
{
  "audioUrl": "/theme.mp3",
  "audioAutoplay": true,
  "audioLoop": true,
  "audioVolume": 0.5
}
```

## 🚀 Deployment

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

### Heroku (Backend)

1. Create a new Heroku app
2. Set environment variables:
   ```bash
   heroku config:set ADMIN_PASSWORD=your_secure_password
   heroku config:set NODE_ENV=production
   ```
3. Deploy:
   ```bash
   git subtree push --prefix server heroku main
   ```

### Custom Server

1. Build the client:
   ```bash
   cd client
   npm run build
   ```

2. Serve the built files with your web server
3. Run the Express server with PM2 or similar
4. Configure reverse proxy (nginx/Apache) if needed

## 🐛 Troubleshooting

### Common Issues

**Audio not playing:**
- Check browser autoplay policies
- Ensure audio file exists and is accessible
- Verify audio format compatibility

**Posts not saving:**
- Check server console for errors
- Verify file permissions for `posts.json`
- Ensure server is running on correct port

**Admin panel not accessible:**
- Verify admin password in `.env` file
- Check browser console for authentication errors
- Ensure CORS is properly configured

**Styling issues:**
- Clear browser cache
- Verify Tailwind CSS is building correctly
- Check for CSS conflicts

### Development Tips

- Use browser dev tools to inspect network requests
- Check server console for detailed error messages
- Test with different browsers for compatibility
- Use incognito mode to test without cached data

## 📄 API Endpoints

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/pin` - Pin post
- `POST /api/posts/:id/unpin` - Unpin post

### Configuration
- `GET /api/config` - Get site configuration
- `PUT /api/config` - Update configuration

### Admin
- `POST /api/admin/login` - Admin authentication

### Health
- `GET /api/health` - Server health check

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📜 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub
4. Check browser console for errors

---

**Built with ❤️ using React, Express, and Tailwind CSS**

*Inspired by the niggachain.ai design system*