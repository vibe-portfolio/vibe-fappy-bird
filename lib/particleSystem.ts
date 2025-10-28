import { COLORS, PHYSICS } from './config'
import type { Particle } from './types'

export class ParticleSystem {
  createParticles(x: number, y: number, type: Particle['type'], count: number = 5): Particle[] {
    const particles: Particle[] = []
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = type === 'explosion' ? 3 + Math.random() * 2 : 1 + Math.random()
      
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: type === 'trail' ? 30 : type === 'explosion' ? 60 : 40,
        maxLife: type === 'trail' ? 30 : type === 'explosion' ? 60 : 40,
        size: type === 'explosion' ? 3 + Math.random() * 2 : type === 'trail' ? 2 : 3,
        color: COLORS.particles[type] || COLORS.particles.trail,
        type
      })
    }
    
    return particles
  }

  updateParticles(particles: Particle[], deltaTime: number): void {
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      
      // Update position
      particle.x += particle.vx * deltaTime
      particle.y += particle.vy * deltaTime
      particle.life -= deltaTime
      
      // Add gravity to explosion particles
      if (particle.type === 'explosion') {
        particle.vy += 0.1 * deltaTime
      }
      
      // Remove dead particles
      if (particle.life <= 0) {
        particles.splice(i, 1)
      }
    }
  }

  renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
    for (const particle of particles) {
      const alpha = particle.life / particle.maxLife
      ctx.globalAlpha = alpha
      
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2)
      ctx.fill()
      
      // Add glow for certain particle types
      if (particle.type === 'score' || particle.type === 'explosion') {
        ctx.shadowColor = particle.color
        ctx.shadowBlur = 5
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * alpha * 0.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }
    ctx.globalAlpha = 1
  }
}
