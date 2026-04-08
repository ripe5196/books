import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import '../styles/Book.css'

const baseEvents = [
  { id: 1, emoji: '💕', type: 'cover', image: 'https://picsum.photos/seed/love-story/480/580' },
  { id: 2, emoji: '👀', image: 'https://picsum.photos/seed/first-meeting/480/580' },
  { id: 3, emoji: '☕', image: 'https://picsum.photos/seed/first-date/480/580' },
  { id: 4, emoji: '💍', image: 'https://picsum.photos/seed/proposal/480/580' },
  { id: 5, emoji: '👰', image: 'https://picsum.photos/seed/wedding-day/480/580' },
  { id: 6, emoji: '🌸', image: 'https://picsum.photos/seed/ceremony/480/580' },
  { id: 7, emoji: '🥂', image: 'https://picsum.photos/seed/reception/480/580' },
]

function LeftPageContent({ event }) {
  if (!event) return null
  return (
    <div className={`page-content page-left-content ${event.type === 'cover' ? 'page-cover' : ''}`}>
      <div className="page-emoji">{event.emoji}</div>
      <h2 className="page-title">{event.title}</h2>
      {event.date && <p className="page-date">{event.date}</p>}
      <p className="page-description">{event.description}</p>
      <div className="page-number page-number-left">{event.id}</div>
    </div>
  )
}

function RightPageContent({ event }) {
  if (!event) return null
  return (
    <div className="page-content page-right-content">
      <img
        src={event.image}
        alt={event.title}
        className="page-image"
      />
      <div className="page-number page-number-right">{event.id}</div>
    </div>
  )
}

export default function Book() {
  const { t } = useLanguage()
  const weddingEvents = baseEvents.map((base, i) => ({
    ...base,
    ...t.book.events[i],
  }))

  const total = weddingEvents.length
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [flipContent, setFlipContent] = useState(null) // { dir, event }

  const goNext = () => {
    if (isAnimating || currentIndex >= total - 1) return
    const flippingEvent = weddingEvents[currentIndex]
    setFlipContent({ dir: 'forward', event: flippingEvent })
    setCurrentIndex(i => i + 1)
    setIsAnimating(true)
    setTimeout(() => {
      setIsAnimating(false)
      setFlipContent(null)
    }, 650)
  }

  const goPrev = () => {
    if (isAnimating || currentIndex <= 0) return
    const flippingEvent = weddingEvents[currentIndex]
    setFlipContent({ dir: 'backward', event: flippingEvent })
    setCurrentIndex(i => i - 1)
    setIsAnimating(true)
    setTimeout(() => {
      setIsAnimating(false)
      setFlipContent(null)
    }, 650)
  }

  const currentEvent = weddingEvents[currentIndex]

  return (
    <div className="book-scene">
      <div className="book-wrapper">
        <div className="book-spread">
          {/* Left page – event name & description */}
          <div className="book-page book-left-page">
            <LeftPageContent event={currentEvent} />
          </div>

          {/* Spine shadow */}
          <div className="book-spine" aria-hidden="true"></div>

          {/* Right page – image */}
          <div className="book-page book-right-page">
            <RightPageContent event={currentEvent} />
          </div>

          {/* 3D flip overlay */}
          {isAnimating && flipContent && (
            <div className={`flip-page flip-${flipContent.dir}`}>
              <div className="flip-face flip-front">
                {flipContent.dir === 'forward' ? (
                  <RightPageContent event={flipContent.event} />
                ) : (
                  <LeftPageContent event={flipContent.event} />
                )}
              </div>
              <div className="flip-face flip-back" aria-hidden="true"></div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation controls */}
      <div className="book-nav">
        <button
          className="book-nav-btn"
          onClick={goPrev}
          disabled={currentIndex === 0 || isAnimating}
          aria-label="Previous page"
        >
          {t.book.back}
        </button>
        <span className="book-page-indicator">
          {currentIndex + 1} / {total}
        </span>
        <button
          className="book-nav-btn"
          onClick={goNext}
          disabled={currentIndex === total - 1 || isAnimating}
          aria-label="Next page"
        >
          {t.book.next}
        </button>
      </div>
    </div>
  )
}