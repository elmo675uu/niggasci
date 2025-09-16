import React, { useEffect, useRef, useState } from 'react'

const SnowflakeAnimation = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [snowflakes, setSnowflakes] = useState([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create a new snowflake
    const createSnowflake = () => {
      return {
        x: Math.random() * canvas.width,
        y: -50,
        size: Math.random() * 20 + 10, // 10-30px
        speed: Math.random() * 2 + 1, // 1-3px per frame
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        opacity: 1,
        meltPoint: canvas.height * 0.7 + Math.random() * canvas.height * 0.3, // Start melting at 70% down
        melted: false
      }
    }

    // Draw the Pump Fun logo as a snowflake
    const drawSnowflake = (snowflake) => {
      if (snowflake.melted) return

      ctx.save()
      ctx.translate(snowflake.x, snowflake.y)
      ctx.rotate(snowflake.rotation)
      ctx.globalAlpha = snowflake.opacity

      // Create a simple pill-shaped logo
      const width = snowflake.size
      const height = snowflake.size * 0.6
      
      // Draw the pill shape
      ctx.fillStyle = '#00E0B7' // Green color
      ctx.beginPath()
      ctx.roundRect(-width/2, -height/2, width, height, height/2)
      ctx.fill()
      
      // Add white half
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.roundRect(-width/2, -height/2, width/2, height, height/2)
      ctx.fill()
      
      // Add border
      ctx.strokeStyle = '#00B38F'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(-width/2, -height/2, width, height, height/2)
      ctx.stroke()

      ctx.restore()
    }

    // Update snowflake position and properties
    const updateSnowflake = (snowflake) => {
      snowflake.y += snowflake.speed
      snowflake.rotation += snowflake.rotationSpeed
      
      // Add some horizontal drift
      snowflake.x += Math.sin(snowflake.y * 0.01) * 0.5
      
      // Check if it should start melting
      if (snowflake.y > snowflake.meltPoint && !snowflake.melted) {
        snowflake.melted = true
        snowflake.meltStartTime = Date.now()
        snowflake.meltDuration = 1000 // 1 second to melt
      }
      
      // Handle melting effect
      if (snowflake.melted) {
        const meltProgress = Math.min((Date.now() - snowflake.meltStartTime) / snowflake.meltDuration, 1)
        snowflake.opacity = 1 - meltProgress
        snowflake.size = snowflake.size * (1 - meltProgress * 0.5) // Shrink as it melts
        snowflake.y += snowflake.speed * 2 // Fall faster when melting
      }
      
      return snowflake.y < canvas.height + 50 // Remove if off screen
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Update existing snowflakes
      setSnowflakes(prev => prev.filter(updateSnowflake))
      
      // Draw all snowflakes
      snowflakes.forEach(drawSnowflake)
      
      // Add new snowflakes occasionally
      if (Math.random() < 0.02) { // 2% chance per frame
        setSnowflakes(prev => [...prev, createSnowflake()])
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [snowflakes])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ background: 'transparent' }}
    />
  )
}

export default SnowflakeAnimation
