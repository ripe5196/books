import { useState } from 'react'
import '../styles/Book.css'

const weddingEvents = [
  {
    id: 1,
    title: 'Our Love Story',
    date: '',
    description: 'A beautiful journey of love, laughter, and forever together. Turn the pages to relive our most precious memories.',
    emoji: '💕',
    type: 'cover'
  },
  {
    id: 2,
    title: 'First Meeting',
    date: 'June 15, 2018',
    description: 'The day our eyes met across the room. A single glance that changed everything forever.',
    emoji: '👀'
  },
  {
    id: 3,
    title: 'First Date',
    date: 'July 20, 2018',
    description: 'Coffee turned into hours of conversation. We talked until the café closed and never wanted it to end.',
    emoji: '☕'
  },
  {
    id: 4,
    title: 'The Proposal',
    date: 'December 24, 2022',
    description: 'Under the stars on Christmas Eve, with a ring and a question that changed our lives: "Will you marry me?"',
    emoji: '💍'
  },
  {
    id: 5,
    title: 'Wedding Day',
    date: 'June 15, 2024',
    description: 'The day we said YES to forever. Surrounded by our loved ones, we began our greatest adventure together.',
    emoji: '👰'
  },
  {
    id: 6,
    title: 'The Ceremony',
    date: 'June 15, 2024',
    description: 'An intimate ceremony at the park, with flowers in bloom and hearts full of joy.',
    emoji: '🌸'
  },
  {
    id: 7,
    title: 'The Reception',
    date: 'June 15, 2024',
    description: 'Dancing, laughter, and celebration into the evening. A night of pure magic with family and friends.',
    emoji: '🥂'
  }
]

function PageContent({ event, side }) {
  if (!event) {
    return (
      <div className="page-content page-decorative">
        <div className="page-deco-emoji">💕</div>
        <p className="page-deco-text">Our Wedding Book</p>
      </div>
    )
  }
  return (
    <div className={`page-content ${event.type === 'cover' ? 'page-cover' : ''}`}>
      <div className="page-emoji">{event.emoji}</div>
      <h2 className="page-title">{event.title}</h2>
      {event.date && <p className="page-date">{event.date}</p>}
      <p className="page-description">{event.description}</p>
      <div className={`page-number page-number-${side}`}>{event.id}</div>
    </div>
  )
}

export default function Book() {
  const total = weddingEvents.length
  // currentIndex is the index of the event shown on the right page
  const [currentIndex, setCurrentIndex] = useState(0)
  const [leftPage, setLeftPage] = useState(null)
  const [rightPage, setRightPage] = useState(weddingEvents[0])
  const [isAnimating, setIsAnimating] = useState(false)
  const [flipContent, setFlipContent] = useState(null) // { dir, page }

  const goNext = () => {
    if (isAnimating || currentIndex >= total - 1) return
    const flipping = rightPage
    const nextRight = weddingEvents[currentIndex + 1]
    setFlipContent({ dir: 'forward', page: flipping })
    setRightPage(nextRight)
    setIsAnimating(true)
    setTimeout(() => {
      setLeftPage(flipping)
      setCurrentIndex(i => i + 1)
      setIsAnimating(false)
      setFlipContent(null)
    }, 650)
  }

  const goPrev = () => {
    if (isAnimating || currentIndex <= 0) return
    const flipping = leftPage
    const prevLeft = currentIndex >= 2 ? weddingEvents[currentIndex - 2] : null
    setFlipContent({ dir: 'backward', page: flipping })
    setLeftPage(prevLeft)
    setIsAnimating(true)
    setTimeout(() => {
      setRightPage(flipping)
      setCurrentIndex(i => i - 1)
      setIsAnimating(false)
      setFlipContent(null)
    }, 650)
  }

  return (
    <div className="book-scene">
      <div className="book-wrapper">
        <div className="book-spread">
          {/* Left page */}
          <div className="book-page book-left-page">
            <PageContent event={leftPage} side="left" />
          </div>

          {/* Spine shadow */}
          <div className="book-spine" aria-hidden="true"></div>

          {/* Right page */}
          <div className="book-page book-right-page">
            <PageContent event={rightPage} side="right" />
          </div>

          {/* 3D flip overlay */}
          {isAnimating && flipContent && (
            <div className={`flip-page flip-${flipContent.dir}`}>
              <div className="flip-face flip-front">
                <PageContent
                  event={flipContent.page}
                  side={flipContent.dir === 'forward' ? 'right' : 'left'}
                />
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
          ◀ Previous
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
          Next ▶
        </button>
      </div>
    </div>
  )
}