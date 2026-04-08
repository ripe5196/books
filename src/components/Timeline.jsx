import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import '../styles/Timeline.css'

const baseDates = [
  { id: 1, date: '2018-06-15', emoji: '👀' },
  { id: 2, date: '2018-07-20', emoji: '☕' },
  { id: 3, date: '2022-12-24', emoji: '💍' },
  { id: 4, date: '2024-06-15', emoji: '👰' },
]

export default function Timeline() {
  const { t } = useLanguage()

  const baseEvents = baseDates.map((base, i) => ({
    ...base,
    ...t.timeline.events[i],
  }))

  const [userEvents, setUserEvents] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    emoji: '💕'
  })

  const allEvents = [...baseEvents, ...userEvents].sort((a, b) => new Date(a.date) - new Date(b.date))

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
      setUserEvents(prev => [...prev, newEvent])
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
        {allEvents.map((event) => (
          <div key={event.id} className="timeline-item">
            <div className="timeline-marker">
              <span className="timeline-emoji">{event.emoji}</span>
            </div>
            <div className="timeline-content">
              <h3>{event.title}</h3>
              <p className="timeline-date">{new Date(event.date).toLocaleDateString(t.timeline.locale, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="timeline-description">{event.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="timeline-form">
        <h2>{t.timeline.addMemoryTitle}</h2>
        <form onSubmit={handleAddEvent}>
          <div className="form-group">
            <label htmlFor="title">{t.timeline.eventTitleLabel}</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={t.timeline.eventTitlePlaceholder}
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">{t.timeline.dateLabel}</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">{t.timeline.descriptionLabel}</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t.timeline.descriptionPlaceholder}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="emoji">{t.timeline.emojiLabel}</label>
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

          <button type="submit" className="submit-btn">{t.timeline.submitBtn}</button>
        </form>
      </div>
    </div>
  )
}