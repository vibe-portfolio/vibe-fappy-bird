import { ASSET_URLS } from './config'
import type { GameAssets, AudioBuffers } from './types'

export class AssetManager {
  private assets: GameAssets = {
    bird: null,
    background: null,
    numberSprites: [],
    gameOver: null,
    message: null,
    pipe: null,
  }

  private audioBuffers: AudioBuffers = {}
  private audioContext: AudioContext | null = null

  async loadAllAssets(): Promise<{ assets: GameAssets; audioBuffers: AudioBuffers }> {
    try {
      // Load images
      const [
        birdImage,
        ...numberImages
      ] = await Promise.all([
        this.loadImage(ASSET_URLS.bird),
        ...ASSET_URLS.numbers.map(url => this.loadImage(url))
      ])

      const [backgroundImage, gameOverImage, messageImage, pipeImage] = await Promise.all([
        this.loadImage(ASSET_URLS.background),
        this.loadImage(ASSET_URLS.gameOver),
        this.loadImage(ASSET_URLS.message),
        this.loadImage(ASSET_URLS.pipe)
      ])

      // Load audio
      const [pointBuffer, hitBuffer, wingBuffer] = await Promise.all([
        this.loadAudioBuffer(ASSET_URLS.audio.point),
        this.loadAudioBuffer(ASSET_URLS.audio.hit),
        this.loadAudioBuffer(ASSET_URLS.audio.wing)
      ])

      // Assign loaded assets
      this.assets = {
        bird: birdImage,
        background: backgroundImage,
        numberSprites: numberImages,
        gameOver: gameOverImage,
        message: messageImage,
        pipe: pipeImage,
      }

      this.audioBuffers = {
        point: pointBuffer,
        hit: hitBuffer,
        wing: wingBuffer,
      }

      return {
        assets: this.assets,
        audioBuffers: this.audioBuffers
      }
    } catch (error) {
      throw new Error(`Failed to load assets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  }

  private async loadAudioBuffer(url: string): Promise<AudioBuffer> {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!this.audioContext) {
      this.audioContext = new AudioContextClass()
    }
    
    return await this.audioContext.decodeAudioData(arrayBuffer)
  }

  getAssets(): GameAssets {
    return this.assets
  }

  getAudioBuffers(): AudioBuffers {
    return this.audioBuffers
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext
  }
}
