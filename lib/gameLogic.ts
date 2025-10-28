import { PHYSICS, DIMENSIONS, GAME_SETTINGS } from './config'
import type { GameState, Bird, Pipe } from './types'

export class GameLogic {
  static createInitialGameState(): GameState {
    return {
      bird: { y: GAME_SETTINGS.INITIAL_BIRD_Y, velocity: 0, frame: 0 },
      pipes: [],
      particles: [],
      score: 0,
      gameOver: false,
      gameStarted: false,
      frameCount: 0,
      backgroundOffset: 0,
      screenShake: 0,
      flashEffect: 0,
    }
  }

  static updateBird(bird: Bird, deltaTime: number): void {
    bird.velocity += PHYSICS.GRAVITY * deltaTime
    bird.y += bird.velocity * deltaTime
  }

  static updateBirdAnimation(bird: Bird, frameCount: number): void {
    if (frameCount % 5 === 0) {
      bird.frame = (bird.frame + 1) % 3
    }
  }

  static jump(bird: Bird): void {
    bird.velocity = -PHYSICS.JUMP_STRENGTH
  }

  static updatePipes(pipes: Pipe[], deltaTime: number, canvasWidth: number): void {
    // Move pipes
    for (const pipe of pipes) {
      pipe.x -= DIMENSIONS.PIPE_SPEED * deltaTime
    }

    // Remove off-screen pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
      if (pipes[i].x + DIMENSIONS.PIPE_WIDTH <= 0) {
        pipes.splice(i, 1)
      }
    }
  }

  static generateNewPipe(pipes: Pipe[], canvasWidth: number, canvasHeight: number): void {
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvasWidth - GAME_SETTINGS.PIPE_SPAWN_DISTANCE) {
      const topHeight = Math.random() * (canvasHeight - DIMENSIONS.PIPE_GAP - GAME_SETTINGS.MAX_PIPE_HEIGHT_BUFFER) + GAME_SETTINGS.MIN_PIPE_HEIGHT
      pipes.push({ 
        x: canvasWidth, 
        topHeight, 
        scored: false 
      })
    }
  }

  static checkCollisions(
    bird: Bird, 
    pipes: Pipe[], 
    canvasHeight: number
  ): { collision: boolean; scoredPipe?: Pipe } {
    const birdRect = { 
      x: 50, 
      y: bird.y, 
      width: DIMENSIONS.BIRD_WIDTH, 
      height: DIMENSIONS.BIRD_HEIGHT 
    }

    // Check boundary collisions
    if (bird.y > canvasHeight || bird.y < 0) {
      return { collision: true }
    }

    // Check pipe collisions and scoring
    for (const pipe of pipes) {
      // Scoring check
      if (!pipe.scored && pipe.x + DIMENSIONS.PIPE_WIDTH < 50) {
        pipe.scored = true
        return { collision: false, scoredPipe: pipe }
      }

      // Collision detection
      const topPipeRect = { 
        x: pipe.x, 
        y: 0, 
        width: DIMENSIONS.PIPE_WIDTH, 
        height: pipe.topHeight 
      }
      
      const bottomPipeRect = {
        x: pipe.x,
        y: pipe.topHeight + DIMENSIONS.PIPE_GAP,
        width: DIMENSIONS.PIPE_WIDTH,
        height: canvasHeight - pipe.topHeight - DIMENSIONS.PIPE_GAP,
      }

      // Check collision with top pipe
      if (
        birdRect.x < topPipeRect.x + topPipeRect.width &&
        birdRect.x + birdRect.width > topPipeRect.x &&
        birdRect.y < topPipeRect.y + topPipeRect.height &&
        birdRect.y + birdRect.height > topPipeRect.y
      ) {
        return { collision: true }
      }

      // Check collision with bottom pipe
      if (
        birdRect.x < bottomPipeRect.x + bottomPipeRect.width &&
        birdRect.x + birdRect.width > bottomPipeRect.x &&
        birdRect.y < bottomPipeRect.y + bottomPipeRect.height &&
        birdRect.y + birdRect.height > bottomPipeRect.y
      ) {
        return { collision: true }
      }
    }

    return { collision: false }
  }

  static updateEffects(gameState: GameState): void {
    // Update screen shake
    if (gameState.screenShake > 0) {
      gameState.screenShake = Math.max(0, gameState.screenShake - 0.5)
    }

    // Update flash effect
    if (gameState.flashEffect > 0) {
      gameState.flashEffect = Math.max(0, gameState.flashEffect - 0.05)
    }

    // Update background offset for parallax
    if (gameState.gameStarted && !gameState.gameOver) {
      gameState.backgroundOffset -= DIMENSIONS.PIPE_SPEED * 0.3
    }
  }

  static triggerCollisionEffects(gameState: GameState): void {
    gameState.screenShake = 8
    gameState.flashEffect = 0.5
  }

  static triggerScoreEffects(gameState: GameState): void {
    gameState.flashEffect = 0.3
  }
}
