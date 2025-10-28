// Game Physics Constants
export const PHYSICS = {
  GRAVITY: 0.3,
  JUMP_STRENGTH: 7.5,
  TARGET_FPS: 60,
  MAX_DELTA_TIME: 1, // Clamp delta time to prevent huge jumps
  JUMP_COOLDOWN: 200, // milliseconds between jumps
} as const

// Game Object Dimensions
export const DIMENSIONS = {
  PIPE_WIDTH: 52,
  PIPE_GAP: 150,
  PIPE_SPEED: 2,
  BIRD_WIDTH: 40,
  BIRD_HEIGHT: 40,
  CANVAS_WIDTH: 288,
  CANVAS_HEIGHT: 512,
} as const

// Design System - Color Palette
export const COLORS = {
  // Primary Theme - Modern Seattle/Tech inspired
  primary: {
    main: '#06b6d4',      // Cyan
    light: '#22d3ee',     // Light cyan
    dark: '#0891b2',      // Dark cyan
    glow: 'rgba(6, 182, 212, 0.6)'
  },
  secondary: {
    main: '#10b981',      // Emerald green
    light: '#34d399',     // Light emerald
    dark: '#059669',      // Dark emerald
    glow: 'rgba(16, 185, 129, 0.6)'
  },
  accent: {
    main: '#f59e0b',      // Amber
    light: '#fbbf24',     // Light amber
    dark: '#d97706',      // Dark amber
    glow: 'rgba(245, 158, 11, 0.6)'
  },
  danger: {
    main: '#ef4444',      // Red
    light: '#f87171',     // Light red
    dark: '#dc2626',      // Dark red
    glow: 'rgba(239, 68, 68, 0.6)'
  },
  neutral: {
    white: '#ffffff',
    light: '#f8fafc',     // Very light gray
    medium: '#64748b',    // Medium gray
    dark: '#334155',      // Dark gray
    black: '#0f172a'      // Very dark
  },
  particles: {
    trail: '#fbbf24',     // Golden trail
    jump: '#3b82f6',      // Blue jump
    score: '#10b981',     // Green score
    explosion: '#ef4444'  // Red explosion
  }
} as const

// Asset URLs
export const ASSET_URLS = {
  bird: "/ellehong.jpeg",
  background: "/seattle-bg.png",
  numbers: [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0-n6uJmiEzXXFf0NDHejRxdna8JdqZ9P.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-2s71zdNWUSfnqIUbOABB2QJzzbG7fR.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-QNpaMYRZvP9MgObyqVbxo7wu0MyjYE.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-6yXb5a7IxZyl8kdXXBatpxq48enb2d.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-9beOrHBy4QSBLifUwqaLXqbNWfK4Hr.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-pgAY4wiTYa2Ppho9w3YXtLx3UHryJI.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-5v6snji9HWY7UpBuqDkKDtck2zED4B.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7-zTxqP8uIOG4OYFtl8x6Dby0mqKfNYo.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8-gkhiN6iBVr2DY7SqrTZIEP7Q3doyo9.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9-PxwOSLzHQAiMeneqctp2q5mzWAv0Kv.png",
  ],
  gameOver: "/gameover.png",
  message: "/message.png",
  pipe: "/pipe.png",
  audio: {
    point: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/point-SdTORahWMlxujnLCoDbujDLHI6KFeC.wav",
    hit: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hit-YVMFYQJEgZASG6O3xPWiyiqPtOLygb.wav",
    wing: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wing-oOSsspXpVMDc0enrWj4WWLaHVqs6Hk.wav",
  }
} as const

// Game Settings
export const GAME_SETTINGS = {
  INITIAL_BIRD_Y: 200,
  PIPE_SPAWN_DISTANCE: 200,
  MIN_PIPE_HEIGHT: 50,
  MAX_PIPE_HEIGHT_BUFFER: 100,
} as const
