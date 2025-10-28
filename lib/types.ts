export interface Bird {
  y: number
  velocity: number
  frame: number
}

export interface Pipe {
  x: number
  topHeight: number
  scored: boolean
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: 'trail' | 'explosion' | 'score' | 'jump'
}

export interface GameState {
  bird: Bird
  pipes: Pipe[]
  particles: Particle[]
  score: number
  gameOver: boolean
  gameStarted: boolean
  frameCount: number
  backgroundOffset: number
  screenShake: number
  flashEffect: number
}

export interface GameAssets {
  bird: HTMLImageElement | null
  background: HTMLImageElement | null
  numberSprites: HTMLImageElement[]
  gameOver: HTMLImageElement | null
  message: HTMLImageElement | null
  pipe: HTMLImageElement | null
}

export interface AudioBuffers {
  point?: AudioBuffer
  hit?: AudioBuffer
  wing?: AudioBuffer
}

export type SoundType = 'point' | 'hit' | 'wing'
