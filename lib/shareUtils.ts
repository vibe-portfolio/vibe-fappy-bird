export class ShareUtils {
  static async captureCanvasScreenshot(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to capture screenshot'))
        }
      }, 'image/png', 0.9)
    })
  }

  static generateShareText(score: number): string {
    const messages = [
      `Just scored ${score} in Sky Dash! 🚀 Can you beat me?`,
      `${score} points in Sky Dash! 🎮 Think you can do better?`,
      `Sky Dash high score: ${score}! 🏆 Your turn to fly!`,
      `Crashed at ${score} points in Sky Dash! 💥 Beat that!`,
      `${score} points and counting! 🌟 Play Sky Dash now!`
    ]
    
    // Add special messages for milestone scores
    if (score >= 100) {
      return `🔥 CENTURY CLUB! Just hit ${score} points in Sky Dash! Who's next? 🔥`
    } else if (score >= 50) {
      return `💪 Half-century! ${score} points in Sky Dash! Can you join the club? 💪`
    } else if (score >= 25) {
      return `🎯 Getting good! ${score} points in Sky Dash! Your move! 🎯`
    }
    
    return messages[Math.floor(Math.random() * messages.length)]
  }

  static async shareScore(canvas: HTMLCanvasElement, score: number): Promise<boolean> {
    try {
      const shareText = this.generateShareText(score)
      const gameUrl = window.location.href
      
      // Check if Web Share API is supported
      if (navigator.share) {
        try {
          const screenshot = await this.captureCanvasScreenshot(canvas)
          const file = new File([screenshot], 'sky-dash-score.png', { type: 'image/png' })
          
          await navigator.share({
            title: 'Sky Dash - High Score!',
            text: shareText,
            url: gameUrl,
            files: [file]
          })
          return true
        } catch (shareError) {
          console.log('Web Share API failed, falling back to text share:', shareError)
          // Fallback to text-only share
          await navigator.share({
            title: 'Sky Dash - High Score!',
            text: shareText,
            url: gameUrl
          })
          return true
        }
      }
      
      // Fallback for browsers without Web Share API
      return this.fallbackShare(shareText, gameUrl)
    } catch (error) {
      console.error('Share failed:', error)
      return false
    }
  }

  static fallbackShare(text: string, url: string): boolean {
    // Try to copy to clipboard
    const fullText = `${text}\n\n${url}`
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText).then(() => {
        this.showShareFeedback('Link copied to clipboard! 📋')
      }).catch(() => {
        this.openTwitterShare(text, url)
      })
    } else {
      this.openTwitterShare(text, url)
    }
    
    return true
  }

  static openTwitterShare(text: string, url: string): void {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
    this.showShareFeedback('Opening Twitter... 🐦')
  }

  static showShareFeedback(message: string): void {
    // Create a temporary toast notification
    const toast = document.createElement('div')
    toast.textContent = message
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      font-size: 14px;
      z-index: 10000;
      animation: slideDown 0.3s ease-out;
    `
    
    // Add animation keyframes
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style')
      style.id = 'toast-styles'
      style.textContent = `
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `
      document.head.appendChild(style)
    }
    
    document.body.appendChild(toast)
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease-out reverse'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }

  static getScoreRank(score: number): string {
    if (score >= 100) return "🏆 LEGEND"
    if (score >= 75) return "🥇 MASTER"
    if (score >= 50) return "🥈 EXPERT"
    if (score >= 25) return "🥉 SKILLED"
    if (score >= 10) return "⭐ RISING"
    return "🌱 ROOKIE"
  }
}
