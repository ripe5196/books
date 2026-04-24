import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import '../styles/Timeline.css'

const FALLBACK_EMOJIS = ['👀', '☕', '💍', '👰', '🌸', '🥂', '🌙', '✨', '💞']

const parseDateLabelToTimestamp = (dateLabel) => {
  if (!dateLabel) return Number.POSITIVE_INFINITY
  const raw = String(dateLabel).trim()
  if (!raw) return Number.POSITIVE_INFINITY

  const rangeStart = raw.split('→')[0].trim()

  // ISO-like: yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(rangeStart)) {
    const ts = new Date(rangeStart).getTime()
    return Number.isNaN(ts) ? Number.POSITIVE_INFINITY : ts
  }

  // dd/mm/yyyy
  const ddmmyyyy = rangeStart.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy
    const ts = new Date(Number(y), Number(m) - 1, Number(d)).getTime()
    return Number.isNaN(ts) ? Number.POSITIVE_INFINITY : ts
  }

  // mm/yyyy
  const mmyyyy = rangeStart.match(/^(\d{1,2})\/(\d{4})$/)
  if (mmyyyy) {
    const [, m, y] = mmyyyy
    const ts = new Date(Number(y), Number(m) - 1, 1).getTime()
    return Number.isNaN(ts) ? Number.POSITIVE_INFINITY : ts
  }

  // yyyy
  const yyyy = rangeStart.match(/^(\d{4})$/)
  if (yyyy) {
    const ts = new Date(Number(yyyy[1]), 0, 1).getTime()
    return Number.isNaN(ts) ? Number.POSITIVE_INFINITY : ts
  }

  const fallbackTs = new Date(rangeStart).getTime()
  return Number.isNaN(fallbackTs) ? Number.POSITIVE_INFINITY : fallbackTs
}

const formatTimelineDate = (dateLabel, locale) => {
  if (!dateLabel) return ''
  const raw = String(dateLabel).trim()
  if (!raw) return ''

  const ts = parseDateLabelToTimestamp(raw)
  if (!Number.isFinite(ts)) return raw

  const hasRange = raw.includes('→')
  const isIso = /^\d{4}-\d{2}-\d{2}$/.test(raw)
  if (hasRange || !isIso) return raw

  return new Date(ts).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Timeline({ presetWriteToken = '', hideWriteTokenInput = false }) {
  const { language, t } = useLanguage()

  const baseEvents = (t.book.events || []).map((bookEvent, i) => ({
    id: `book-${i + 1}`,
    title: bookEvent.title,
    description: bookEvent.description,
    date: bookEvent.date || '',
    emoji: bookEvent.emoji || FALLBACK_EMOJIS[i % FALLBACK_EMOJIS.length],
    source: 'book',
    order: i,
  }))

  const [userEvents, setUserEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [writeToken, setWriteToken] = useState(presetWriteToken)
  const [editingEventId, setEditingEventId] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    emoji: '💕'
  })

  useEffect(() => {
    let cancelled = false
    const loadUserEvents = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')
        const response = await fetch('/api/timeline/events')
        if (!response.ok) {
          if (!cancelled) {
            setErrorMessage(language === 'vi' ? 'Không thể tải timeline từ server.' : 'Unable to load timeline from server.')
          }
          return
        }
        const data = await response.json()
        if (!cancelled && Array.isArray(data?.events)) {
          setUserEvents(data.events)
        }
      } catch {
        if (!cancelled) {
          setErrorMessage(language === 'vi' ? 'Không thể kết nối server timeline.' : 'Unable to connect to timeline server.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    loadUserEvents()
    return () => { cancelled = true }
  }, [language])

  useEffect(() => {
    if (presetWriteToken) {
      setWriteToken(presetWriteToken)
    }
  }, [presetWriteToken])

  const allEvents = useMemo(() => {
    const merged = [...baseEvents, ...userEvents]
    return merged.sort((a, b) => {
      const timeA = parseDateLabelToTimestamp(a.date)
      const timeB = parseDateLabelToTimestamp(b.date)
      if (timeA !== timeB) return timeA - timeB

      // Keep book-defined order stable when dates are equal/empty.
      const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER
      const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER
      if (orderA !== orderB) return orderA - orderB

      return String(a.id).localeCompare(String(b.id))
    })
  }, [baseEvents, userEvents])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      description: '',
      emoji: '💕',
    })
    setEditingEventId(null)
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.date || isSaving) return

    setIsSaving(true)
    setErrorMessage('')
    try {
      const method = editingEventId ? 'PUT' : 'POST'
      const response = await fetch('/api/timeline/events', {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(writeToken ? { 'x-timeline-token': writeToken } : {}),
        },
        body: JSON.stringify(editingEventId ? { ...formData, id: editingEventId } : formData),
      })
      if (!response.ok) {
        if (response.status === 401) {
          setErrorMessage(language === 'vi' ? 'Sai token ghi dữ liệu.' : 'Invalid write token.')
        } else {
          setErrorMessage(language === 'vi' ? 'Không thể lưu timeline.' : 'Unable to save timeline event.')
        }
        return
      }

      const data = await response.json()
      if (data?.event) {
        setUserEvents((prev) => {
          if (editingEventId) {
            return prev.map((item) => String(item.id) === String(editingEventId) ? data.event : item)
          }
          return [...prev, data.event]
        })
      }
      resetForm()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEvent = async (id) => {
    if (isSaving) return
    setIsSaving(true)
    setErrorMessage('')
    try {
      const response = await fetch(`/api/timeline/events?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: writeToken ? { 'x-timeline-token': writeToken } : {},
      })
      if (!response.ok) {
        if (response.status === 401) {
          setErrorMessage(language === 'vi' ? 'Sai token ghi dữ liệu.' : 'Invalid write token.')
        } else {
          setErrorMessage(language === 'vi' ? 'Không thể xoá timeline.' : 'Unable to delete timeline event.')
        }
        return
      }
      setUserEvents((prev) => prev.filter((event) => String(event.id) !== String(id)))
      if (String(editingEventId) === String(id)) resetForm()
    } finally {
      setIsSaving(false)
    }
  }

  const startEditEvent = (event) => {
    setEditingEventId(event.id)
    setFormData({
      title: event.title || '',
      date: /^\d{4}-\d{2}-\d{2}$/.test(event.date || '') ? event.date : '',
      description: event.description || '',
      emoji: event.emoji || '💕',
    })
  }

  return (
    <div className="timeline-container">
      <div className="timeline">
        {isLoading && (
          <>
            <div className="timeline-item timeline-item-skeleton">
              <div className="timeline-content timeline-skeleton-card" />
            </div>
            <div className="timeline-item timeline-item-skeleton">
              <div className="timeline-content timeline-skeleton-card" />
            </div>
          </>
        )}
        {allEvents.map((event) => (
          <div key={event.id} className="timeline-item">
            <div className="timeline-marker">
              <span className="timeline-emoji">{event.emoji}</span>
            </div>
            <div className="timeline-content">
              <h3>{event.title}</h3>
              <p className="timeline-date">{formatTimelineDate(event.date, t.timeline.locale)}</p>
              <p className="timeline-description">{event.description}</p>
              {event.source === 'user' && (
                <div className="timeline-actions">
                  <button type="button" className="timeline-action-btn" onClick={() => startEditEvent(event)}>
                    {language === 'vi' ? 'Sửa' : 'Edit'}
                  </button>
                  <button type="button" className="timeline-action-btn danger" onClick={() => handleDeleteEvent(event.id)}>
                    {language === 'vi' ? 'Xoá' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="timeline-form">
        <h2>{t.timeline.addMemoryTitle}</h2>
        <form onSubmit={handleAddEvent}>
          {!hideWriteTokenInput && (
            <div className="form-group">
              <label htmlFor="writeToken">{language === 'vi' ? 'Token ghi dữ liệu (nếu bật bảo vệ)' : 'Write token (if protection enabled)'}</label>
              <input
                type="password"
                id="writeToken"
                name="writeToken"
                value={writeToken}
                onChange={(e) => setWriteToken(e.target.value)}
                placeholder={language === 'vi' ? 'Nhập token' : 'Enter token'}
              />
            </div>
          )}
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
              placeholder={language === 'vi' ? 'Chọn emoji' : 'Choose an emoji'}
              maxLength="2"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSaving}>
            {isSaving
              ? (language === 'vi' ? 'Đang lưu...' : 'Saving...')
              : editingEventId
                ? (language === 'vi' ? 'Cập nhật kỷ niệm' : 'Update memory')
                : t.timeline.submitBtn}
          </button>
          {editingEventId && (
            <button type="button" className="submit-btn ghost" onClick={resetForm}>
              {language === 'vi' ? 'Huỷ chỉnh sửa' : 'Cancel edit'}
            </button>
          )}
          {errorMessage && <p className="timeline-error">{errorMessage}</p>}
        </form>
      </div>
    </div>
  )
}