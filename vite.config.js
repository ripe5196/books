import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const cloudinaryCache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000
const timelineDataPath = path.resolve(process.cwd(), 'data', 'timeline-events.json')

const ensureTimelineDataFile = async () => {
  await fs.mkdir(path.dirname(timelineDataPath), { recursive: true })
  try {
    await fs.access(timelineDataPath)
  } catch {
    await fs.writeFile(timelineDataPath, '[]', 'utf-8')
  }
}

const readTimelineEvents = async () => {
  await ensureTimelineDataFile()
  const raw = await fs.readFile(timelineDataPath, 'utf-8')
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed : []
}

const writeTimelineEvents = async (events) => {
  await ensureTimelineDataFile()
  await fs.writeFile(timelineDataPath, JSON.stringify(events, null, 2), 'utf-8')
}

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'timeline-events-api',
        configureServer(server) {
          server.middlewares.use('/api/timeline/events', async (req, res) => {
            res.setHeader('Content-Type', 'application/json')

            try {
              if (req.method === 'GET') {
                const events = await readTimelineEvents()
                res.statusCode = 200
                res.end(JSON.stringify({ events }))
                return
              }

              if (req.method === 'POST') {
                const payload = await parseJsonBody(req)
                if (!payload?.title || !payload?.date) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ error: 'Missing required fields: title, date.' }))
                  return
                }

                const events = await readTimelineEvents()
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
                await writeTimelineEvents(next)
                res.statusCode = 201
                res.end(JSON.stringify({ event: newEvent, events: next }))
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
