export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }

  const payload = req.body || {}
  const password = String(payload.password || '')
  const adminPassword = process.env.SITE_ACCESS_PASSWORD || process.env.TIMELINE_WRITE_TOKEN || ''

  if (!adminPassword) {
    res.status(500).json({ error: 'SITE_ACCESS_PASSWORD is not configured.' })
    return
  }

  res.status(200).json({ authorized: password === adminPassword })
}
