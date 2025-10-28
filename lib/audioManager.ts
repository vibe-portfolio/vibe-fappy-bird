import type { AudioBuffers, SoundType } from './types'

export class AudioManager {
  private audioContext: AudioContext | null = null
  private audioBuffers: AudioBuffers = {}
  private pendingSounds = new Set<SoundType>()

  constructor(audioContext: AudioContext | null, audioBuffers: AudioBuffers) {
    this.audioContext = audioContext
    this.audioBuffers = audioBuffers
  }

  initializeAudioContext(): void {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      this.audioContext = new AudioContextClass()
    }

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume()
    }
  }

  playSoundImmediately(soundType: SoundType): void {
    const buffer = this.audioBuffers[soundType]

    if (buffer && this.audioContext && this.audioContext.state === "running") {
      try {
        const source = this.audioContext.createBufferSource()
        source.buffer = buffer
        source.connect(this.audioContext.destination)
        source.start(0)
      } catch (error) {
        console.error("Error playing sound:", error)
      }
    }
  }

  queueSound(soundType: SoundType): void {
    this.pendingSounds.add(soundType)
  }

  playPendingSounds(): void {
    if (this.pendingSounds.size > 0) {
      this.pendingSounds.forEach((sound) => {
        this.playSoundImmediately(sound)
      })
      this.pendingSounds.clear()
    }
  }

  updateAudioBuffers(audioBuffers: AudioBuffers): void {
    this.audioBuffers = audioBuffers
  }

  updateAudioContext(audioContext: AudioContext | null): void {
    this.audioContext = audioContext
  }
}
