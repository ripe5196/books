import { useState } from 'react'
import '../styles/Timeline.css'

export default function Timeline() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'First Meeting',
      date: '2018-06-15',
      description: 'The day our love story began',
      emoji: '👀'
    },
    {
      id: 2,
      title: 'First Date',
      date: '2018-07-20',
      description: 'Coffee turned into forever',
      emoji: '☕'
    },
    {
      id: 3,
      title: 'The Proposal',
      date: '2022-12-24',
      description: 'Will you marry me?',
      emoji: '💍'
    },
    {
      id: 4,
      title: 'Wedding Day',
      date: '2024-06-15',
      description: 'We said YES to forever',
      emoji: '👰'
    }
  ])

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    emoji: '💕'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddEvent = (e) => {
    e.preventDefault()
    if (formData.title && formData.date) {
      const newEvent = {
        id: Date.now(),
        ...formData
      }
      setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.date) - new Date(b.date)))
      setFormData({
        title: '',
        date: '',
        description: '',
        emoji: '💕'
      })
    }
  }

  return (
    <div className="timeline-container">
      <div className="timeline">
        {events.map((event) => (
          <div key={event.id} className="timeline-item">
            <div className="timeline-marker">
              <span className="timeline-emoji">{event.emoji}</span>
            </div>
            <div className="timeline-content">
              <h3>{event.title}</h3>
              <p className="timeline-date">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="timeline-description">{event.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="timeline-form">
        <h2>Add a New Memory</h2>
        <form onSubmit={handleAddEvent}>
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Anniversary Dinner"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Tell us about this moment..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="emoji">Emoji</label>
            <input
              type="text"
              id="emoji"
              name="emoji"
              value={formData.emoji}
              onChange={handleInputChange}
              placeholder="Choose an emoji"
              maxLength="2"
            />
          </div>

          <button type="submit" className="submit-btn">Add Memory ✨</button>
        </form>
      </div>
    </div>
  )
}