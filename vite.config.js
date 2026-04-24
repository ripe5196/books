import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createClient } from 'redis'

const cloudinaryCache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000
const timelineMemoryStore = []
const TIMELINE_KEY = 'wedding:timeline:userEvents'
let redisClient = null

const parseJsonBody = (req) => new Promise((resolve, reject) => {
  let body = ''
  req.on('data', (chunk) => {
    body += String(chunk)
  })
  req.on('end', () => {
    if (!body) {
      resolve({})
      return
    }
    try {
      resolve(JSON.parse(body))
    } catch (error) {
      reject(error)
    }
  })
  req.on('error', reject)
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
  const socketUrl = getRedisSocketUrl(url, token)
  if (!socketUrl) return null
  if (!redisClient) {
    redisClient = createClient({ url: socketUrl })
    redisClient.on('error', () => {})
  }
  if (!redisClient.isOpen) {
    await redisClient.connect()
  }
  return redisClient
}

const redisGetEvents = async (url, token) => {
  if (!isRedisRestUrl(url)) {
    const client = await getRedisClient(url, token)
    const raw = client ? await client.get(TIMELINE_KEY) : null
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
    if (client) {
      await client.set(TIMELINE_KEY, JSON.stringify(events))
    }
    return
  }

  const payload = encodeURIComponent(JSON.stringify(events))
  await fetch(`${url}/set/${encodeURIComponent(TIMELINE_KEY)}/${payload}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'auth-verify-api',
        configureServer(server) {
          server.middlewares.use('/api/auth/verify', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method not allowed.' }))
              return
            }

            const payload = await parseJsonBody(req)
            const password = String(payload.password || '')
            const adminPassword =
              env.SITE_ACCESS_PASSWORD ||
              process.env.SITE_ACCESS_PASSWORD ||
              env.TIMELINE_WRITE_TOKEN ||
              process.env.TIMELINE_WRITE_TOKEN ||
              ''

            if (!adminPassword) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'SITE_ACCESS_PASSWORD is not configured.' }))
              return
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ authorized: password === adminPassword }))
          })
        },
      },
      {
        name: 'health-api',
        configureServer(server) {
          server.middlewares.use('/api/health', async (_req, res) => {
            const redisUrl = normalizeRedisUrl(env.REDIS_URL || process.env.REDIS_URL)
            const hasCloudinary =
              Boolean(env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME) &&
              Boolean(env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY) &&
              Boolean(env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET)

            let redisConnected = false
            if (redisUrl) {
              try {
                if (isRedisRestUrl(redisUrl)) {
                  redisConnected = true
                } else {
                  const client = await getRedisClient(redisUrl, env.REDIS_TOKEN || process.env.REDIS_TOKEN)
                  redisConnected = Boolean(client?.isOpen)
                }
              } catch {
                redisConnected = false
              }
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              ok: true,
              services: {
                cloudinaryConfigured: hasCloudinary,
                redisConfigured: Boolean(redisUrl),
                redisConnected,
              },
            }))
          })
        },
      },
      {
        name: 'timeline-events-api',
        configureServer(server) {
          server.middlewares.use('/api/timeline/events', async (req, res) => {
            res.setHeader('Content-Type', 'application/json')
            const redisUrl = normalizeRedisUrl(env.REDIS_URL || process.env.REDIS_URL)
            const redisToken = env.REDIS_TOKEN || process.env.REDIS_TOKEN
            const writeToken = env.TIMELINE_WRITE_TOKEN || process.env.TIMELINE_WRITE_TOKEN

            try {
              if (req.method === 'GET') {
                const events = redisUrl
                  ? await redisGetEvents(redisUrl, redisToken)
                  : timelineMemoryStore
                res.statusCode = 200
                res.end(JSON.stringify({ events }))
                return
              }

              if (req.method === 'POST') {
                if (writeToken) {
                  const requestToken = req.headers['x-timeline-token']
                  if (requestToken !== writeToken) {
                    res.statusCode = 401
                    res.end(JSON.stringify({ error: 'Unauthorized write token.' }))
                    return
                  }
                }

                const payload = await parseJsonBody(req)
                if (!payload?.title || !payload?.date) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ error: 'Missing required fields: title, date.' }))
                  return
                }

                const events = redisUrl
                  ? await redisGetEvents(redisUrl, redisToken)
                  : timelineMemoryStore
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
                if (redisUrl) {
                  await redisSetEvents(redisUrl, redisToken, next)
                } else {
                  timelineMemoryStore.splice(0, timelineMemoryStore.length, ...next)
                }
                res.statusCode = 201
                res.end(JSON.stringify({ event: newEvent, events: next }))
                return
              }

              if (req.method === 'PUT') {
                if (writeToken) {
                  const requestToken = req.headers['x-timeline-token']
                  if (requestToken !== writeToken) {
                    res.statusCode = 401
                    res.end(JSON.stringify({ error: 'Unauthorized write token.' }))
                    return
                  }
                }

                const payload = await parseJsonBody(req)
                if (!payload?.id || !payload?.title || !payload?.date) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ error: 'Missing required fields: id, title, date.' }))
                  return
                }

                const events = redisUrl
                  ? await redisGetEvents(redisUrl, redisToken)
                  : timelineMemoryStore
                const index = events.findIndex((event) => String(event.id) === String(payload.id))
                if (index < 0) {
                  res.statusCode = 404
                  res.end(JSON.stringify({ error: 'Event not found.' }))
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

                if (redisUrl) {
                  await redisSetEvents(redisUrl, redisToken, next)
                } else {
                  timelineMemoryStore.splice(0, timelineMemoryStore.length, ...next)
                }

                res.statusCode = 200
                res.end(JSON.stringify({ event: updated, events: next }))
                return
              }

              if (req.method === 'DELETE') {
                if (writeToken) {
                  const requestToken = req.headers['x-timeline-token']
                  if (requestToken !== writeToken) {
                    res.statusCode = 401
                    res.end(JSON.stringify({ error: 'Unauthorized write token.' }))
                    return
                  }
                }

                const requestUrl = new URL(req.url || '', 'http://localhost')
                const id = requestUrl.searchParams.get('id')
                if (!id) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ error: 'Missing required query parameter: id.' }))
                  return
                }

                const events = redisUrl
                  ? await redisGetEvents(redisUrl, redisToken)
                  : timelineMemoryStore
                const next = events.filter((event) => String(event.id) !== String(id))

                if (redisUrl) {
                  await redisSetEvents(redisUrl, redisToken, next)
                } else {
                  timelineMemoryStore.splice(0, timelineMemoryStore.length, ...next)
                }

                res.statusCode = 200
                res.end(JSON.stringify({ events: next }))
                return
              }

              res.statusCode = 405
              res.end(JSON.stringify({ error: 'Method not allowed.' }))
            } catch (error) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown server error.' }))
            }
          })
        },
      },
      {
        name: 'cloudinary-images-api',
        configureServer(server) {
          server.middlewares.use('/api/cloudinary/images', async (req, res) => {
            const requestUrl = new URL(req.url || '', 'http://localhost')
            const folder = requestUrl.searchParams.get('folder')
            const tag = requestUrl.searchParams.get('tag')
            const limit = Math.min(Number(requestUrl.searchParams.get('limit') || 60), 200)
            const cloud = env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
            const apiKey = env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY
            const apiSecret = env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET

            if (!folder && !tag) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Missing "folder" or "tag" query parameter.' }))
              return
            }

            if (!cloud || !apiKey || !apiSecret) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                error: 'Missing Cloudinary server credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.',
              }))
              return
            }

            const cacheKey = JSON.stringify({ folder: folder || '', tag: tag || '', limit })
            const now = Date.now()
            const cached = cloudinaryCache.get(cacheKey)
            if (cached && now - cached.timestamp < CACHE_TTL_MS) {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ images: cached.images, cached: true }))
              return
            }

            const authHeader = { Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}` }
            const fetchResources = async (endpoint, resourceType) => {
              const response = await fetch(endpoint, {
                headers: authHeader,
              })
              if (!response.ok) {
                return []
              }
              const data = await response.json()
              return Array.isArray(data.resources)
                ? data.resources.map((resource) => ({
                  public_id: resource.public_id,
                  url: resource.secure_url || resource.url || '',
                  resource_type: resource.resource_type || resourceType,
                  created_at: resource.created_at || '',
                })).filter((item) => item.url)
                : []
            }

            try {
              let media = []
              const resourceTypes = ['image', 'video']

              for (const resourceType of resourceTypes) {
                let resources = []

                if (folder) {
                  const byAssetFolderEndpoint = `https://api.cloudinary.com/v1_1/${cloud}/resources/by_asset_folder?asset_folder=${encodeURIComponent(folder)}&resource_type=${resourceType}&max_results=${limit}`
                  resources = await fetchResources(byAssetFolderEndpoint, resourceType)
                }

                if (resources.length === 0 && folder) {
                  const normalizedPrefix = folder.endsWith('/') ? folder : `${folder}/`
                  const byPrefixEndpoint = `https://api.cloudinary.com/v1_1/${cloud}/resources/${resourceType}/upload?prefix=${encodeURIComponent(normalizedPrefix)}&max_results=${limit}`
                  resources = await fetchResources(byPrefixEndpoint, resourceType)
                }

                if (resources.length === 0 && tag) {
                  const byTagEndpoint = `https://api.cloudinary.com/v1_1/${cloud}/resources/${resourceType}/tags/${encodeURIComponent(tag)}?max_results=${limit}`
                  resources = await fetchResources(byTagEndpoint, resourceType)
                }

                media = media.concat(resources)
              }

              media.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
              cloudinaryCache.set(cacheKey, { images: media, timestamp: now })

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ images: media }))
            } catch (error) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown server error.' }))
            }
          })
        },
      },
    ],
  }
})
