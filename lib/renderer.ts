import { COLORS, DIMENSIONS } from './config'
import type { GameState, GameAssets } from './types'

export class Renderer {
  private ctx: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement
  private assets: GameAssets

  constructor(canvas: HTMLCanvasElement, assets: GameAssets) {
    console.log("Renderer constructor - canvas:", canvas, "assets:", assets)
    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    })
    
    if (!ctx) {
      throw new Error("Could not get 2D context from canvas")
    }
    
    console.log("Canvas context obtained:", ctx)
    this.ctx = ctx
    this.canvas = canvas
    this.assets = assets
    
    // Force initial clear and test render
    this.clearCanvas()
    console.log("Canvas cleared, dimensions:", canvas.width, "x", canvas.height)
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx
  }

  clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  applyScreenShake(shakeAmount: number): { shakeX: number; shakeY: number } {
    const shakeX = shakeAmount > 0 ? (Math.random() - 0.5) * shakeAmount : 0
    const shakeY = shakeAmount > 0 ? (Math.random() - 0.5) * shakeAmount : 0
    
    this.ctx.save()
    this.ctx.translate(shakeX, shakeY)
    
    return { shakeX, shakeY }
  }

  restoreTransform(): void {
    this.ctx.restore()
  }

  renderParallaxBackground(backgroundOffset: number): void {
    const bgWidth = this.canvas.width
    const bgHeight = this.canvas.height
    
    // Fallback gradient background if image fails to load
    if (!this.assets.background) {
      const gradient = this.ctx.createLinearGradient(0, 0, 0, bgHeight)
      gradient.addColorStop(0, '#87CEEB') // Sky blue
      gradient.addColorStop(0.7, '#98D8E8') // Light blue
      gradient.addColorStop(1, '#B0E0E6') // Powder blue
      this.ctx.fillStyle = gradient
      this.ctx.fillRect(0, 0, bgWidth, bgHeight)
      return
    }
    
    // Far background (slowest)
    const farOffset = backgroundOffset * 0.2
    this.ctx.drawImage(this.assets.background, farOffset % bgWidth - bgWidth, 0, bgWidth, bgHeight)
    this.ctx.drawImage(this.assets.background, farOffset % bgWidth, 0, bgWidth, bgHeight)
    this.ctx.drawImage(this.assets.background, farOffset % bgWidth + bgWidth, 0, bgWidth, bgHeight)
    
    // Mid background
    const midOffset = backgroundOffset * 0.5
    this.ctx.globalAlpha = 0.7
    this.ctx.drawImage(this.assets.background, midOffset % bgWidth - bgWidth, 0, bgWidth, bgHeight)
    this.ctx.drawImage(this.assets.background, midOffset % bgWidth, 0, bgWidth, bgHeight)
    this.ctx.drawImage(this.assets.background, midOffset % bgWidth + bgWidth, 0, bgWidth, bgHeight)
    this.ctx.globalAlpha = 1
    
    // Add sophisticated gradient overlay
    const overlayGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
    overlayGradient.addColorStop(0, 'rgba(15, 23, 42, 0.2)')
    overlayGradient.addColorStop(0.7, 'rgba(15, 23, 42, 0.4)')
    overlayGradient.addColorStop(1, 'rgba(15, 23, 42, 0.6)')
    this.ctx.fillStyle = overlayGradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  renderStartScreen(): void {
    // Modern start screen overlay
    const startOverlayGradient = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
    )
    startOverlayGradient.addColorStop(0, 'rgba(248, 250, 252, 0.1)')
    startOverlayGradient.addColorStop(1, 'rgba(15, 23, 42, 0.7)')
    this.ctx.fillStyle = startOverlayGradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    // Draw message with enhanced styling
    if (this.assets.message) {
      const messageWidth = 184
      const messageHeight = 267
      const messageX = (this.canvas.width - messageWidth) / 2
      const messageY = (this.canvas.height - messageHeight) / 2
      
      // Add glow to start message
      this.ctx.shadowColor = COLORS.primary.glow
      this.ctx.shadowBlur = 10
      this.ctx.drawImage(this.assets.message, messageX, messageY, messageWidth, messageHeight)
      this.ctx.shadowBlur = 0
    }
    
    // Add modern "Tap to Start" text
    this.ctx.fillStyle = COLORS.neutral.white
    this.ctx.font = "18px -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    this.ctx.textAlign = 'center'
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    this.ctx.shadowBlur = 4
    this.ctx.fillText("TAP TO START", this.canvas.width / 2, this.canvas.height - 60)
    this.ctx.textAlign = 'start'
    this.ctx.shadowBlur = 0
  }

  renderPipes(pipes: GameState['pipes']): void {
    for (const pipe of pipes) {
      if (!this.assets.pipe) continue

      // Add subtle glow effect with theme colors
      this.ctx.shadowColor = COLORS.secondary.glow
      this.ctx.shadowBlur = 8
      
      // Draw top pipe (flipped vertically)
      this.ctx.save()
      this.ctx.scale(1, -1)
      this.ctx.drawImage(this.assets.pipe, pipe.x, -pipe.topHeight, DIMENSIONS.PIPE_WIDTH, 320)
      this.ctx.restore()

      // Draw bottom pipe
      this.ctx.drawImage(this.assets.pipe, pipe.x, pipe.topHeight + DIMENSIONS.PIPE_GAP, DIMENSIONS.PIPE_WIDTH, 320)
      
      // Add subtle highlight on pipe edges for depth
      this.ctx.shadowBlur = 0
      this.ctx.strokeStyle = COLORS.secondary.light
      this.ctx.lineWidth = 1
      this.ctx.globalAlpha = 0.3
      
      // Top pipe outline
      this.ctx.strokeRect(pipe.x, 0, DIMENSIONS.PIPE_WIDTH, pipe.topHeight)
      // Bottom pipe outline  
      this.ctx.strokeRect(pipe.x, pipe.topHeight + DIMENSIONS.PIPE_GAP, DIMENSIONS.PIPE_WIDTH, this.canvas.height - pipe.topHeight - DIMENSIONS.PIPE_GAP)
      
      this.ctx.globalAlpha = 1
    }
  }

  renderBird(bird: GameState['bird']): void {
    if (!this.assets.bird) return

    this.ctx.save()
    this.ctx.translate(50 + DIMENSIONS.BIRD_WIDTH / 2, bird.y + DIMENSIONS.BIRD_HEIGHT / 2)
    this.ctx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.velocity * 0.1)))

    // Add radial shadow beneath the bird
    const shadowRadius = DIMENSIONS.BIRD_WIDTH * 0.8
    const shadowGradient = this.ctx.createRadialGradient(0, DIMENSIONS.BIRD_HEIGHT / 3, 0, 0, DIMENSIONS.BIRD_HEIGHT / 3, shadowRadius)
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)')
    shadowGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)')
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    
    this.ctx.save()
    this.ctx.globalCompositeOperation = 'multiply'
    this.ctx.fillStyle = shadowGradient
    this.ctx.beginPath()
    this.ctx.ellipse(0, DIMENSIONS.BIRD_HEIGHT / 3, shadowRadius * 0.8, shadowRadius * 0.4, 0, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.restore()

    // Add larger drop shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    this.ctx.shadowBlur = 15
    this.ctx.shadowOffsetX = 6
    this.ctx.shadowOffsetY = 6

    // Draw dark outline
    this.ctx.globalCompositeOperation = 'source-over'
    const outlineSize = 2
    
    for (let x = -outlineSize; x <= outlineSize; x++) {
      for (let y = -outlineSize; y <= outlineSize; y++) {
        if (x !== 0 || y !== 0) {
          this.ctx.save()
          this.ctx.beginPath()
          this.ctx.arc(x, y, DIMENSIONS.BIRD_WIDTH / 2, 0, Math.PI * 2)
          this.ctx.clip()
          this.ctx.filter = 'brightness(0)'
          this.ctx.drawImage(this.assets.bird, -DIMENSIONS.BIRD_WIDTH / 2 + x, -DIMENSIONS.BIRD_HEIGHT / 2 + y, DIMENSIONS.BIRD_WIDTH, DIMENSIONS.BIRD_HEIGHT)
          this.ctx.restore()
        }
      }
    }

    // Draw the actual bird on top
    this.ctx.filter = 'none'
    this.ctx.beginPath()
    this.ctx.arc(0, 0, DIMENSIONS.BIRD_WIDTH / 2, 0, Math.PI * 2)
    this.ctx.clip()
    this.ctx.drawImage(this.assets.bird, -DIMENSIONS.BIRD_WIDTH / 2, -DIMENSIONS.BIRD_HEIGHT / 2, DIMENSIONS.BIRD_WIDTH, DIMENSIONS.BIRD_HEIGHT)
    
    this.ctx.restore()
  }

  renderScore(score: number): void {
    const scoreString = score.toString()
    const digitWidth = 24
    const totalWidth = scoreString.length * digitWidth
    const startX = (this.canvas.width - totalWidth) / 2
    const padding = 16
    const borderRadius = 12
    
    // Modern score container with gradient background
    const scoreGradient = this.ctx.createLinearGradient(startX - padding, 15, startX - padding, 61)
    scoreGradient.addColorStop(0, 'rgba(248, 250, 252, 0.95)')
    scoreGradient.addColorStop(1, 'rgba(226, 232, 240, 0.95)')
    
    // Draw rounded rectangle background
    this.ctx.fillStyle = scoreGradient
    this.ctx.beginPath()
    this.ctx.roundRect(startX - padding, 15, totalWidth + (padding * 2), 46, borderRadius)
    this.ctx.fill()
    
    // Add subtle border
    this.ctx.strokeStyle = COLORS.primary.light
    this.ctx.lineWidth = 2
    this.ctx.stroke()
    
    // Add inner shadow for depth
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    this.ctx.shadowBlur = 4
    this.ctx.shadowOffsetY = 2
    
    // Draw score digits with enhanced glow
    this.ctx.shadowColor = COLORS.primary.glow
    this.ctx.shadowBlur = 8
    
    for (let i = 0; i < scoreString.length; i++) {
      const digitImage = this.assets.numberSprites[Number.parseInt(scoreString[i])]
      if (digitImage) {
        this.ctx.drawImage(digitImage, startX + i * digitWidth, 20, digitWidth, 36)
      }
    }
    this.ctx.shadowBlur = 0
    this.ctx.shadowOffsetY = 0
  }

  renderFlashEffect(flashAmount: number): void {
    if (flashAmount > 0) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${flashAmount})`
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  renderGameOverScreen(score: number): void {
    // Modern game over overlay
    const overlayGradient = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
    )
    overlayGradient.addColorStop(0, 'rgba(15, 23, 42, 0.7)')
    overlayGradient.addColorStop(1, 'rgba(15, 23, 42, 0.9)')
    this.ctx.fillStyle = overlayGradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    if (this.assets.gameOver) {
      const gameOverWidth = 192
      const gameOverHeight = 42
      const gameOverX = (this.canvas.width - gameOverWidth) / 2
      const gameOverY = (this.canvas.height - gameOverHeight) / 2 - 30
      
      // Add dramatic glow to game over text
      this.ctx.shadowColor = COLORS.danger.glow
      this.ctx.shadowBlur = 15
      this.ctx.drawImage(this.assets.gameOver, gameOverX, gameOverY, gameOverWidth, gameOverHeight)
      this.ctx.shadowBlur = 0

      // Modern restart button with design system
      const buttonWidth = 120
      const buttonHeight = 48
      const buttonX = this.canvas.width / 2 - buttonWidth / 2
      const buttonY = this.canvas.height / 2 + 30
      const buttonRadius = 12
      
      // Button gradient using theme colors
      const buttonGradient = this.ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight)
      buttonGradient.addColorStop(0, COLORS.primary.light)
      buttonGradient.addColorStop(1, COLORS.primary.main)
      
      // Draw rounded button
      this.ctx.fillStyle = buttonGradient
      this.ctx.beginPath()
      this.ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, buttonRadius)
      this.ctx.fill()
      
      // Button glow effect
      this.ctx.shadowColor = COLORS.primary.glow
      this.ctx.shadowBlur = 12
      this.ctx.stroke()
      this.ctx.shadowBlur = 0
      
      // Button border
      this.ctx.strokeStyle = COLORS.neutral.white
      this.ctx.lineWidth = 2
      this.ctx.globalAlpha = 0.8
      this.ctx.stroke()
      this.ctx.globalAlpha = 1
      
      // Draw restart icon (circular arrow)
      const iconSize = 20
      const iconX = this.canvas.width / 2
      const iconY = buttonY + buttonHeight / 2
      
      this.ctx.strokeStyle = COLORS.neutral.white
      this.ctx.fillStyle = COLORS.neutral.white
      this.ctx.lineWidth = 2.5
      this.ctx.lineCap = 'round'
      this.ctx.lineJoin = 'round'
      
      // Draw circular arrow path (restart icon)
      this.ctx.beginPath()
      // Main circular arc
      this.ctx.arc(iconX, iconY, iconSize * 0.4, -Math.PI * 0.2, Math.PI * 1.5, false)
      this.ctx.stroke()
      
      // Arrow head
      const arrowX = iconX + iconSize * 0.35
      const arrowY = iconY - iconSize * 0.2
      this.ctx.beginPath()
      this.ctx.moveTo(arrowX - 4, arrowY - 4)
      this.ctx.lineTo(arrowX + 2, arrowY)
      this.ctx.lineTo(arrowX - 4, arrowY + 4)
      this.ctx.stroke()
      
      // Reset line properties
      this.ctx.lineCap = 'butt'
      this.ctx.lineJoin = 'miter'
      
      // Final score display
      this.ctx.fillStyle = COLORS.neutral.light
      this.ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
      this.ctx.textAlign = 'center'
      this.ctx.fillText(`FINAL SCORE: ${score}`, this.canvas.width / 2, gameOverY - 10)
      this.ctx.textAlign = 'start'
    }
  }
}
