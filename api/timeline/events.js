const TIMELINE_KEY = 'wedding:timeline:userEvents'
let redisClient = null
const WRITE_TOKEN = process.env.TIMELINE_WRITE_TOKEN || ''

const getRedisConfig = () => ({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
})

const normalizeRedisUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('redis://') || url.startsWith('rediss://')) return url
  return `redis://default@${url}`
}

const isRedisRestUrl = (url) => url.startsWith('http://') || url.startsWith('https://')

const getRedisSocketUrl = (url, token) => {
  if (!url) return ''
  if (url.startsWith('redis://') || url.startsWith('rediss://')) {
    if (!token) return url
    try {
      const parsed = new URL(url)
      if (!parsed.password) parsed.password = token
      if (!parsed.username) parsed.username = 'default'
      return parsed.toString()
    } catch {
      return url
    }
  }
  const passwordPart = token ? `:${encodeURIComponent(token)}@` : ''
  return `redis://default${passwordPart}${url}`
}

const getRedisClient = async (url, token) => {
  if (!redisClient) {
    const { createClient } = await import('redis')
    redisClient = createClient({ url: getRedisSocketUrl(url, token) })
    redisClient.on('error', () => {})
  }
  if (!redisClient.isOpen) {
    await redisClient.connect()
  }
  return redisClient
}

const getMemoryStore = () => {
  if (!globalThis.__timelineEventsStore) {
    globalThis.__timelineEventsStore = []
  }
  return globalThis.__timelineEventsStore
}

const redisGetEvents = async (url, token) => {
  if (!isRedisRestUrl(url)) {
    const client = await getRedisClient(url, token)
    const raw = await client.get(TIMELINE_KEY)
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const response = await fetch(`${url}/get/${encodeURIComponent(TIMELINE_KEY)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) return []
  const data = await response.json()
  const raw = data?.result
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const redisSetEvents = async (url, token, events) => {
  if (!isRedisRestUrl(url)) {
    const client = await getRedisClient(url, token)
    await client.set(TIMELINE_KEY, JSON.stringify(events))
    return
  }

  const payload = encodeURIComponent(JSON.stringify(events))
  await fetch(`${url}/set/${encodeURIComponent(TIMELINE_KEY)}/${payload}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

const loadEvents = async () => {
  const { url: rawUrl, token } = getRedisConfig()
  const url = normalizeRedisUrl(rawUrl)
  if (url) {
    return redisGetEvents(url, token)
  }
  return getMemoryStore()
}

const saveEvents = async (events) => {
  const { url: rawUrl, token } = getRedisConfig()
  const url = normalizeRedisUrl(rawUrl)
  if (url) {
    await redisSetEvents(url, token, events)
    return
  }
  globalThis.__timelineEventsStore = events
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const events = await loadEvents()
      res.status(200).json({ events })
      return
    }

    if (req.method === 'POST') {
      if (WRITE_TOKEN) {
        const requestToken = req.headers['x-timeline-token']
        if (requestToken !== WRITE_TOKEN) {
          res.status(401).json({ error: 'Unauthorized write token.' })
          return
        }
      }

      const payload = req.body || {}
      if (!payload?.title || !payload?.date) {
        res.status(400).json({ error: 'Missing required fields: title, date.' })
        return
      }

      const events = await loadEvents()
      const newEvent = {
        id: `user-${Date.now()}`,
        title: String(payload.title),
        date: String(payload.date),
        description: String(payload.description || ''),
        emoji: String(payload.emoji || '💕'),
        source: 'user',
        order: Number.MAX_SAFE_INTEGER,
      }
      const next = [...events, newEvent]
      await saveEvents(next)
      res.status(201).json({ event: newEvent, events: next })
      return
    }

    if (req.method === 'PUT') {
      if (WRITE_TOKEN) {
        const requestToken = req.headers['x-timeline-token']
        if (requestToken !== WRITE_TOKEN) {
          res.status(401).json({ error: 'Unauthorized write token.' })
          return
        }
      }

      const payload = req.body || {}
      if (!payload?.id || !payload?.title || !payload?.date) {
        res.status(400).json({ error: 'Missing required fields: id, title, date.' })
        return
      }

      const events = await loadEvents()
      const index = events.findIndex((event) => String(event.id) === String(payload.id))
      if (index < 0) {
        res.status(404).json({ error: 'Event not found.' })
        return
      }

      const updated = {
        ...events[index],
        title: String(payload.title),
        date: String(payload.date),
        description: String(payload.description || ''),
        emoji: String(payload.emoji || '💕'),
      }
      const next = [...events]
      next[index] = updated
      await saveEvents(next)
      res.status(200).json({ event: updated, events: next })
      return
    }

    if (req.method === 'DELETE') {
      if (WRITE_TOKEN) {
        const requestToken = req.headers['x-timeline-token']
        if (requestToken !== WRITE_TOKEN) {
          res.status(401).json({ error: 'Unauthorized write token.' })
          return
        }
      }

      const id = req.query?.id
      if (!id) {
        res.status(400).json({ error: 'Missing required query parameter: id.' })
        return
      }

      const events = await loadEvents()
      const next = events.filter((event) => String(event.id) !== String(id))
      await saveEvents(next)
      res.status(200).json({ events: next })
      return
    }

    res.status(405).json({ error: 'Method not allowed.' })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown server error.' })
  }
}
