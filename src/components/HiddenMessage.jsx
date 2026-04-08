import { useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import '../styles/HiddenMessage.css'

export default function HiddenMessage({ onClose }) {
  const { t } = useLanguage()
  const indexRef = useRef(Math.floor(Math.random() * t.hiddenMessage.messages.length))
  const message = t.hiddenMessage.messages[indexRef.current]

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
        <button className="hidden-message-close" onClick={onClose} aria-label={t.hiddenMessage.closeLabel}>
          ✕
        </button>
      </div>
    </div>
  )
}
