const normalizeRedisUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('redis://') || url.startsWith('rediss://')) return url
  return `redis://default@${url}`
}

const isRedisRestUrl = (url) => url.startsWith('http://') || url.startsWith('https://')

export default async function handler(_req, res) {
  const redisUrl = normalizeRedisUrl(process.env.REDIS_URL)
  const hasCloudinary =
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET)

  let redisConnected = false
  if (redisUrl) {
    try {
      if (isRedisRestUrl(redisUrl)) {
        redisConnected = true
      } else {
        const { createClient } = await import('redis')
        const client = createClient({ url: redisUrl })
        await client.connect()
        redisConnected = client.isOpen
        await client.quit()
      }
    } catch {
      redisConnected = false
    }
  }

  res.status(200).json({
    ok: true,
    services: {
      cloudinaryConfigured: hasCloudinary,
      redisConfigured: Boolean(redisUrl),
      redisConnected,
    },
  })
}
