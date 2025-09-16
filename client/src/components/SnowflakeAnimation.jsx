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

    // Create a new raindrop
    const createRaindrop = () => {
      return {
        x: Math.random() * canvas.width,
        y: -50,
        size: Math.random() * 15 + 8, // 8-23px
        speed: Math.random() * 0.06 + 0.02, // 0.02-0.08px per frame (very slow rain)
        opacity: Math.random() * 0.5 + 0.3 // 0.3-0.8 opacity for variety
      }
    }

    // Draw the Pump Fun logo as a raindrop
    const drawRaindrop = (raindrop) => {
      ctx.save()
      ctx.globalAlpha = raindrop.opacity

      // Create a simple pill-shaped logo
      const width = raindrop.size
      const height = raindrop.size * 0.6
      
      // Draw the pill shape
      ctx.fillStyle = '#00E0B7' // Green color
      ctx.beginPath()
      ctx.roundRect(raindrop.x - width/2, raindrop.y - height/2, width, height, height/2)
      ctx.fill()
      
      // Add white half
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.roundRect(raindrop.x - width/2, raindrop.y - height/2, width/2, height, height/2)
      ctx.fill()
      
      // Add border
      ctx.strokeStyle = '#00B38F'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(raindrop.x - width/2, raindrop.y - height/2, width, height, height/2)
      ctx.stroke()

      ctx.restore()
    }

    // Update raindrop position
    const updateRaindrop = (raindrop) => {
      raindrop.y += raindrop.speed
      
      return raindrop.y < canvas.height + 50 // Remove if off screen
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Update existing raindrops
      setSnowflakes(prev => prev.filter(updateRaindrop))
      
      // Draw all raindrops
      snowflakes.forEach(drawRaindrop)
      
      // Add new raindrops occasionally
      if (Math.random() < 0.0006) { // 0.06% chance per frame (very gentle rain)
        setSnowflakes(prev => [...prev, createRaindrop()])
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
