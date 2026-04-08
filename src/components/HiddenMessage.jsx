import { useEffect, useState } from 'react'
import '../styles/HiddenMessage.css'

const messages = [
  "You're my favorite everything 💕",
  "I still fall for you every day 💖",
  "You make my world brighter ✨",
  "Life is better with you 💗",
  "I love you more than yesterday 💌",
  "You're my happy place 🥰",
  "Every moment with you matters 💞"
]

export default function HiddenMessage({ onClose }) {
  const [message] = useState(
    () => messages[Math.floor(Math.random() * messages.length)]
  )

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="hidden-message-overlay" onClick={onClose}>
      <div className="hidden-message-card" onClick={(e) => e.stopPropagation()}>
        <div className="hidden-message-envelope">💌</div>
        <p className="hidden-message-text">{message}</p>
        <div className="hidden-message-hearts" aria-hidden="true">
          <span>💕</span><span>💖</span><span>💗</span><span>💓</span><span>💞</span>
        </div>
        <button className="hidden-message-close" onClick={onClose} aria-label="Close message">
          ✕
        </button>
      </div>
    </div>
  )
}
