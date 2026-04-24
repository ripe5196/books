import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import '../styles/Book.css'

const DEFAULT_EMOJIS = ['💕', '👀', '☕', '💍', '👰', '🌸', '🥂', '🌙', '✨', '💞', '🎀', '🕊️', '🌹', '💫', '🤍']
const IMAGE_SEEDS = [
  'love-story',
  'first-meeting',
  'first-conversation',
  'first-date',
  'becoming-official',
  'memories-together',
  'challenges-growth',
  'proposal-moment',
  'engagement-period',
  'wedding-day',
  'future-together',
  'golden-hour',
  'moonlight-vows',
  'starry-path',
  'forever-home',
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
  const images = Array.isArray(event.images) ? event.images.filter(Boolean) : []
  const hasManyImages = images.length > 1
  const displayImages = hasManyImages ? images : [event.image || images[0]].filter(Boolean)

  return (
    <div className="page-content page-right-content">
      <div
        className={`page-image-gallery ${displayImages.length > 1 ? 'page-image-gallery-multiple' : ''} ${
          displayImages.length === 2 ? 'page-image-gallery-two' : ''
        } ${displayImages.length >= 3 ? 'page-image-gallery-three-plus' : ''}`}
      >
        {displayImages.map((imageUrl, index) => (
          <img
            key={`${event.id}-${index}-${imageUrl}`}
            src={imageUrl}
            alt={`${event.title}${displayImages.length > 1 ? ` ${index + 1}` : ''}`}
            className="page-image"
          />
        ))}
      </div>
      <div className="page-number page-number-right">{event.id}</div>
    </div>
  )
}

export default function Book() {
  const { t } = useLanguage()
  const localizedEvents = Array.isArray(t.book.events) ? t.book.events : []
  const weddingEvents = localizedEvents.map((event, i) => {
    const seed = IMAGE_SEEDS[i % IMAGE_SEEDS.length]
    const fallbackImage = `https://picsum.photos/seed/${seed}-${i + 1}/480/580`
    const images = Array.isArray(event.images)
      ? event.images.filter(Boolean)
      : event.image
        ? [event.image]
        : [fallbackImage]

    return {
      id: i + 1,
      type: i === 0 ? 'cover' : undefined,
      emoji: DEFAULT_EMOJIS[i % DEFAULT_EMOJIS.length],
      image: images[0],
      images,
      ...event,
    }
  })

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