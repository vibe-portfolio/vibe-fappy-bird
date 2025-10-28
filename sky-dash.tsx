"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"

// Import modular components
import { PHYSICS, DIMENSIONS } from './lib/config'
import { AssetManager } from './lib/assetManager'
import { AudioManager } from './lib/audioManager'
import { ParticleSystem } from './lib/particleSystem'
import { GameLogic } from './lib/gameLogic'
import { Renderer } from './lib/renderer'
import type { GameState, GameAssets, AudioBuffers } from './lib/types'

export default function SkyDash() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [scale, setScale] = useState(1)

  // Game system instances
  const assetManagerRef = useRef<AssetManager>(new AssetManager())
  const audioManagerRef = useRef<AudioManager | null>(null)
  const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem())
  const rendererRef = useRef<Renderer | null>(null)
  
  // Game state and timing
  const gameStateRef = useRef<GameState>(GameLogic.createInitialGameState())
  const lastFrameTimeRef = useRef<number>(0)
  const lastJumpTimeRef = useRef<number>(0)
  
  // Assets
  const assetsRef = useRef<GameAssets | null>(null)
  const audioBuffersRef = useRef<AudioBuffers | null>(null)

  // Calculate scale for mobile
  useEffect(() => {
    const updateScale = () => {
      if (window.innerWidth < 768) {
        const scaleX = window.innerWidth / DIMENSIONS.CANVAS_WIDTH
        const scaleY = window.innerHeight / DIMENSIONS.CANVAS_HEIGHT
        setScale(Math.max(scaleX, scaleY))
      } else {
        setScale(1)
      }
    }

    updateScale()
    window.addEventListener("resize", updateScale)
    window.addEventListener("orientationchange", updateScale)

    return () => {
      window.removeEventListener("resize", updateScale)
      window.removeEventListener("orientationchange", updateScale)
    }
  }, [])

  // Load all game assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const { assets, audioBuffers } = await assetManagerRef.current.loadAllAssets()
        
        assetsRef.current = assets
        audioBuffersRef.current = audioBuffers
        
        // Initialize audio manager
        audioManagerRef.current = new AudioManager(
          assetManagerRef.current.getAudioContext(),
          audioBuffers
        )
        
        // Initialize renderer
        const canvas = canvasRef.current
        if (canvas) {
          rendererRef.current = new Renderer(canvas, assets)
        }
        
        setAssetsLoaded(true)
      } catch (error) {
        console.error("Asset loading error:", error)
        setLoadingError(error instanceof Error ? error.message : 'Unknown error')
      }
    }

    loadAssets()
  }, [])

  // Game control functions
  const playSoundImmediately = useCallback((soundType: "point" | "hit" | "wing") => {
    audioManagerRef.current?.playSoundImmediately(soundType)
  }, [])

  const queueSound = useCallback((soundType: "point" | "hit" | "wing") => {
    audioManagerRef.current?.queueSound(soundType)
  }, [])

  const createParticles = useCallback((x: number, y: number, type: 'trail' | 'explosion' | 'score' | 'jump', count: number = 5) => {
    return particleSystemRef.current.createParticles(x, y, type, count)
  }, [])

  const jump = useCallback(() => {
    const state = gameStateRef.current
    const now = Date.now()

    // Prevent rapid-fire jumps
    if (now - lastJumpTimeRef.current < PHYSICS.JUMP_COOLDOWN) {
      return
    }
    lastJumpTimeRef.current = now

    // Initialize audio context on user interaction
    audioManagerRef.current?.initializeAudioContext()

    if (!state.gameOver && state.gameStarted) {
      GameLogic.jump(state.bird)
      playSoundImmediately("wing")
      // Add jump particles
      const jumpParticles = createParticles(50 + DIMENSIONS.BIRD_WIDTH/2, state.bird.y + DIMENSIONS.BIRD_HEIGHT/2, 'jump', 3)
      state.particles.push(...jumpParticles)
    } else if (!state.gameStarted) {
      state.gameStarted = true
      setIsGameStarted(true)
      lastFrameTimeRef.current = 0
    }
  }, [playSoundImmediately, createParticles])

  const restartGame = useCallback(() => {
    gameStateRef.current = GameLogic.createInitialGameState()
    gameStateRef.current.gameStarted = true
    setIsGameOver(false)
    setIsGameStarted(true)
    lastFrameTimeRef.current = 0
  }, [])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        const state = gameStateRef.current
        if (!state.gameStarted) {
          state.gameStarted = true
          setIsGameStarted(true)
          lastFrameTimeRef.current = 0
        } else if (!state.gameOver) {
          jump()
        }
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [jump])

  // Main game loop
  useEffect(() => {
    if (!assetsLoaded || !rendererRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    let animationFrameId: number

    const gameLoop = (currentTime: number) => {
      const state = gameStateRef.current
      const renderer = rendererRef.current!

      // Play pending sounds
      audioManagerRef.current?.playPendingSounds()

      // Calculate delta time
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = currentTime
      }
      let deltaTime = (currentTime - lastFrameTimeRef.current) / (1000 / PHYSICS.TARGET_FPS)
      deltaTime = Math.min(deltaTime, PHYSICS.MAX_DELTA_TIME)
      lastFrameTimeRef.current = currentTime

      // Update effects
      GameLogic.updateEffects(state)

      // Clear and setup canvas
      renderer.clearCanvas()
      renderer.applyScreenShake(state.screenShake)

      // Render background
      renderer.renderParallaxBackground(state.backgroundOffset)

      if (!state.gameStarted) {
        renderer.renderStartScreen()
        renderer.restoreTransform()
        animationFrameId = requestAnimationFrame(gameLoop)
        return
      }

      if (!state.gameOver) {
        // Update game logic
        GameLogic.updateBird(state.bird, deltaTime)
        GameLogic.updateBirdAnimation(state.bird, state.frameCount)
        GameLogic.updatePipes(state.pipes, deltaTime, canvas.width)
        GameLogic.generateNewPipe(state.pipes, canvas.width, canvas.height)

        // Add bird trail particles
        if (state.frameCount % 3 === 0) {
          const trailParticles = createParticles(50 + DIMENSIONS.BIRD_WIDTH/2 - 10, state.bird.y + DIMENSIONS.BIRD_HEIGHT/2, 'trail', 1)
          state.particles.push(...trailParticles)
        }

        // Check collisions and scoring
        const collisionResult = GameLogic.checkCollisions(state.bird, state.pipes, canvas.height)
        
        if (collisionResult.collision) {
          state.gameOver = true
          setIsGameOver(true)
          queueSound("hit")
          // Add explosion particles
          const explosionParticles = createParticles(50 + DIMENSIONS.BIRD_WIDTH/2, state.bird.y + DIMENSIONS.BIRD_HEIGHT/2, 'explosion', 15)
          state.particles.push(...explosionParticles)
          GameLogic.triggerCollisionEffects(state)
        } else if (collisionResult.scoredPipe) {
          state.score++
          queueSound("point")
          // Add score particles
          const scoreParticles = createParticles(collisionResult.scoredPipe.x + DIMENSIONS.PIPE_WIDTH, collisionResult.scoredPipe.topHeight + DIMENSIONS.PIPE_GAP/2, 'score', 8)
          state.particles.push(...scoreParticles)
          GameLogic.triggerScoreEffects(state)
        }

        state.frameCount++
      }

      // Update and render particles
      particleSystemRef.current.updateParticles(state.particles, deltaTime)

      // Render game objects
      renderer.renderPipes(state.pipes)
      particleSystemRef.current.renderParticles(renderer.getContext(), state.particles)
      renderer.renderBird(state.bird)
      renderer.renderScore(state.score)

      // Render effects
      renderer.renderFlashEffect(state.flashEffect)
      renderer.restoreTransform()

      if (state.gameOver) {
        renderer.renderGameOverScreen(state.score)
      }

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    animationFrameId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationFrameId)
  }, [assetsLoaded, queueSound, createParticles])

  // Click/touch handlers
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (DIMENSIONS.CANVAS_WIDTH / rect.width)
    const y = (event.clientY - rect.top) * (DIMENSIONS.CANVAS_HEIGHT / rect.height)

    const state = gameStateRef.current

    if (state.gameOver) {
      // Check restart button
      const buttonWidth = 120
      const buttonHeight = 48
      const buttonX = DIMENSIONS.CANVAS_WIDTH / 2 - buttonWidth / 2
      const buttonY = DIMENSIONS.CANVAS_HEIGHT / 2 + 30
      
      if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        restartGame()
        return
      }
    }

    jump()
  }, [jump, restartGame])

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = (touch.clientX - rect.left) * (DIMENSIONS.CANVAS_WIDTH / rect.width)
    const y = (touch.clientY - rect.top) * (DIMENSIONS.CANVAS_HEIGHT / rect.height)

    const state = gameStateRef.current

    if (state.gameOver) {
      // Check restart button
      const buttonWidth = 120
      const buttonHeight = 48
      const buttonX = DIMENSIONS.CANVAS_WIDTH / 2 - buttonWidth / 2
      const buttonY = DIMENSIONS.CANVAS_HEIGHT / 2 + 30
      
      if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        restartGame()
        return
      }
    }

    jump()
  }, [jump, restartGame])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 overflow-hidden">
      {!assetsLoaded && !loadingError && (
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Loading Sky Dash...</div>
          <div className="animate-pulse text-gray-600">Please wait</div>
        </div>
      )}
      {loadingError && (
        <div className="text-center p-4 max-w-md">
          <div className="text-2xl font-bold mb-4 text-red-600">Loading Error</div>
          <div className="text-gray-700 mb-4">{loadingError}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}
      {assetsLoaded && (
        <>
          <canvas
            ref={canvasRef}
            width={DIMENSIONS.CANVAS_WIDTH}
            height={DIMENSIONS.CANVAS_HEIGHT}
            className="border border-gray-300 touch-none md:border"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              imageRendering: "pixelated",
            }}
            onClick={handleCanvasClick}
            onTouchStart={handleTouchStart}
          />
          <p className="hidden md:block mt-4 text-lg text-center px-4">Tap to soar or press Space to dash through the sky</p>
        </>
      )}
    </div>
  )
}
