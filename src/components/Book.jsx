import { useState } from 'react'
import '../styles/Book.css'

const weddingEvents = [
  {
    id: 1,
    title: 'Our Love Story',
    date: '',
    description: 'A beautiful journey of love, laughter, and forever together. Turn the pages to relive our most precious memories.',
    emoji: '💕',
    type: 'cover',
    image: 'https://picsum.photos/seed/love-story/480/580'
  },
  {
    id: 2,
    title: 'First Meeting',
    date: 'June 15, 2018',
    description: 'The day our eyes met across the room. A single glance that changed everything forever.',
    emoji: '👀',
    image: 'https://picsum.photos/seed/first-meeting/480/580'
  },
  {
    id: 3,
    title: 'First Date',
    date: 'July 20, 2018',
    description: 'Coffee turned into hours of conversation. We talked until the café closed and never wanted it to end.',
    emoji: '☕',
    image: 'https://picsum.photos/seed/first-date/480/580'
  },
  {
    id: 4,
    title: 'The Proposal',
    date: 'December 24, 2022',
    description: 'Under the stars on Christmas Eve, with a ring and a question that changed our lives: "Will you marry me?"',
    emoji: '💍',
    image: 'https://picsum.photos/seed/proposal/480/580'
  },
  {
    id: 5,
    title: 'Wedding Day',
    date: 'June 15, 2024',
    description: 'The day we said YES to forever. Surrounded by our loved ones, we began our greatest adventure together.',
    emoji: '👰',
    image: 'https://picsum.photos/seed/wedding-day/480/580'
  },
  {
    id: 6,
    title: 'The Ceremony',
    date: 'June 15, 2024',
    description: 'An intimate ceremony at the park, with flowers in bloom and hearts full of joy.',
    emoji: '🌸',
    image: 'https://picsum.photos/seed/ceremony/480/580'
  },
  {
    id: 7,
    title: 'The Reception',
    date: 'June 15, 2024',
    description: 'Dancing, laughter, and celebration into the evening. A night of pure magic with family and friends.',
    emoji: '🥂',
    image: 'https://picsum.photos/seed/reception/480/580'
  }
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
          Back 💖
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
          Next ✨
        </button>
      </div>
    </div>
  )
}