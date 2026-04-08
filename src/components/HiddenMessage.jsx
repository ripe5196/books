import { useEffect } from 'react'
import '../styles/HiddenMessage.css'

export default function HiddenMessage({ onClose }) {
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
        <p className="hidden-message-text">I love you&nbsp;.....</p>
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
