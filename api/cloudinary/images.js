const cloudinaryCache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000

const getCloudinaryCredentials = () => ({
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
})

const mapResource = (resource, resourceType) => ({
  public_id: resource.public_id,
  url: resource.secure_url || resource.url || '',
  resource_type: resource.resource_type || resourceType,
  created_at: resource.created_at || '',
})

const fetchResources = async (endpoint, authHeader, resourceType) => {
  const response = await fetch(endpoint, { headers: authHeader })
  if (!response.ok) return []
  const data = await response.json()
  if (!Array.isArray(data.resources)) return []
  return data.resources.map((resource) => mapResource(resource, resourceType)).filter((item) => item.url)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }

  const { folder = '', tag = '', limit: rawLimit = '60' } = req.query || {}
  const limit = Math.min(Number(rawLimit) || 60, 200)

  if (!folder && !tag) {
    res.status(400).json({ error: 'Missing "folder" or "tag" query parameter.' })
    return
  }

  const { cloud, apiKey, apiSecret } = getCloudinaryCredentials()
  if (!cloud || !apiKey || !apiSecret) {
    res.status(500).json({
      error: 'Missing Cloudinary server credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.',
    })
    return
  }

  const cacheKey = JSON.stringify({ folder, tag, limit })
  const now = Date.now()
  const cached = cloudinaryCache.get(cacheKey)
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    res.status(200).json({ images: cached.images, cached: true })
    return
  }

  try {
    const authHeader = {
      Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
    }

    let media = []
    const resourceTypes = ['image', 'video']

    for (const resourceType of resourceTypes) {
      let resources = []

      if (folder) {
        const byAssetFolderEndpoint = `https://api.cloudinary.com/v1_1/${cloud}/resources/by_asset_folder?asset_folder=${encodeURIComponent(folder)}&resource_type=${resourceType}&max_results=${limit}`
        resources = await fetchResources(byAssetFolderEndpoint, authHeader, resourceType)
      }

      if (resources.length === 0 && folder) {
        const normalizedPrefix = folder.endsWith('/') ? folder : `${folder}/`
        const byPrefixEndpoint = `https://api.cloudinary.com/v1_1/${cloud}/resources/${resourceType}/upload?prefix=${encodeURIComponent(normalizedPrefix)}&max_results=${limit}`
        resources = await fetchResources(byPrefixEndpoint, authHeader, resourceType)
      }

      if (resources.length === 0 && tag) {
        const byTagEndpoint = `https://api.cloudinary.com/v1_1/${cloud}/resources/${resourceType}/tags/${encodeURIComponent(tag)}?max_results=${limit}`
        resources = await fetchResources(byTagEndpoint, authHeader, resourceType)
      }

      media = media.concat(resources)
    }

    media.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    cloudinaryCache.set(cacheKey, { images: media, timestamp: now })

    res.status(200).json({ images: media })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown server error.' })
  }
}
