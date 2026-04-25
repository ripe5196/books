import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import '../styles/Gallery.css'

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
const cloudinarySources = {
  Lives: {
    folder: import.meta.env.VITE_CLOUDINARY_FOLDER_US || 'us',
  },
  Engagement: {
    folder: import.meta.env.VITE_CLOUDINARY_FOLDER_YES || 'the yes',
  },
  Wedding: {
    folder: import.meta.env.VITE_CLOUDINARY_FOLDER_FOREVER || 'forever',
  },
  School: {
    folder: import.meta.env.VITE_CLOUDINARY_FOLDER_THROWBACK || 'throwback',
  },
}

const optimizeCloudinaryUrl = (url) =>
  url.replace(/\/(image|video)\/upload\//, '/$1/upload/f_auto,q_auto/')

const toCloudinaryVariant = (url, transform) =>
  url.replace(/\/(image|video)\/upload\//, '/$1/upload/' + transform + '/')

const toVideoPoster = (url) =>
  url.replace('/video/upload/', '/video/upload/so_0,f_jpg,q_auto,c_limit,w_700/')

const cloudinaryListUrl = ({ folder, tag, limit = 60 }) => {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  if (folder) params.set('folder', folder)
  if (tag) params.set('tag', tag)
  return `/api/cloudinary/images?${params.toString()}`
}

const mapResourcesToPhotos = (category, resources) =>
  resources.map((resource, index) => ({
    id: `${category}-${resource.public_id || index}`,
    category,
    publicId: resource.public_id || '',
    type: resource.resource_type === 'video' ? 'video' : 'image',
    url: optimizeCloudinaryUrl(resource.url || ''),
    thumbnailUrl: resource.resource_type === 'video'
      ? toVideoPoster(resource.url || '')
      : toCloudinaryVariant(resource.url || '', 'f_auto,q_auto:eco,dpr_auto,c_limit,w_700'),
  })).filter((photo) => photo.url)

async function fetchPhotosForCategory(category, source) {
  const tryUrl = async (url) => {
    try {
      const response = await fetch(url)
      if (!response.ok) return { photos: [], listUrl: url }
      const data = await response.json()
      const resources = Array.isArray(data?.images) ? data.images : []
      return {
        photos: mapResourcesToPhotos(category, resources),
        listUrl: url,
        diagnostics: data?.diagnostics,
      }
    } catch {
      return { photos: [], listUrl: url }
    }
  }

  const primary = cloudinaryListUrl({ folder: source.folder })
  const { photos, listUrl, diagnostics } = await tryUrl(primary)
  return { category, photos, listUrl, diagnostics }
}

const CATEGORY_DEFINITIONS = [
  { id: 'all', key: null },
  { id: 'lives', key: 'Lives' },
  { id: 'engagement', key: 'Engagement' },
  { id: 'wedding', key: 'Wedding' },
  { id: 'school', key: 'School' },
]

const TAB_ID_TO_PHOTO_BUCKET = {
  lives: 'Lives',
  engagement: 'Engagement',
  wedding: 'Wedding',
  school: 'School',
}

export default function Gallery() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState(null)
  const [activeCategoryId, setActiveCategoryId] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [galleryError, setGalleryError] = useState('')
  const [dynamicCategoryPhotos, setDynamicCategoryPhotos] = useState({
    Lives: [],
    Engagement: [],
    Wedding: [],
    School: [],
  })

  useEffect(() => {
    if (!cloudName) {
      setDynamicCategoryPhotos({ Lives: [], Engagement: [], Wedding: [], School: [] })
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setGalleryError('')
    Promise.all(
      Object.entries(cloudinarySources).map(([category, source]) =>
        fetchPhotosForCategory(category, source),
      ),
    ).then((results) => {
      const nextState = { Lives: [], Engagement: [], Wedding: [], School: [] }
      results.forEach(({ category, photos, listUrl, diagnostics }) => {
        if (photos.length === 0 && listUrl) {
          console.warn(`No images returned for ${category}. Check Cloudinary folder/tag config for request: ${listUrl}`)
        }
        if (diagnostics?.cloudinaryErrors?.[0]?.status === 420) {
          setGalleryError('Cloudinary API đang bị rate limit (420). Vui lòng đợi 1-2 phút rồi tải lại trang.')
        }
        nextState[category] = photos
      })
      setDynamicCategoryPhotos(nextState)
      setIsLoading(false)
    })
  }, [])

  const photosByCategory = useMemo(() => ({
    Lives: dynamicCategoryPhotos.Lives.map((base, i) => ({
      ...base,
      ...(t.gallery.photos[i] || {
        title: `${t.gallery.title} ${i + 1}`,
        caption: t.gallery.subtitle,
      }),
    })),
    Engagement: dynamicCategoryPhotos.Engagement.map((base, i) => ({
      ...base,
      ...(t.gallery.photos[i] || {
        title: `${t.gallery.title} ${i + 1}`,
        caption: t.gallery.subtitle,
      }),
    })),
    Wedding: dynamicCategoryPhotos.Wedding.map((base, i) => ({
      ...base,
      ...(t.gallery.photos[i] || {
        title: `${t.gallery.title} ${i + 1}`,
        caption: t.gallery.subtitle,
      }),
    })),
    School: dynamicCategoryPhotos.School.map((base, i) => ({
      ...base,
      ...(t.gallery.photos[i] || {
        title: `${t.gallery.title} ${i + 1}`,
        caption: t.gallery.subtitle,
      }),
    })),
  }), [dynamicCategoryPhotos, t])

  const galleryCategories = useMemo(() => (
    CATEGORY_DEFINITIONS.map((category, index) => ({
      ...category,
      label: t.gallery.categories[index] || t.gallery.categories[0] || 'All',
    }))
  ), [t.gallery.categories])

  const categoryKey =
    activeCategoryId === 'all' ? null : TAB_ID_TO_PHOTO_BUCKET[activeCategoryId] ?? null

  const filteredPhotos = useMemo(() => {
    if (categoryKey === null) {
      return [
        ...photosByCategory.Lives,
        ...photosByCategory.Engagement,
        ...photosByCategory.Wedding,
        ...photosByCategory.School,
      ]
    }
    const bucket = photosByCategory[categoryKey] || []
    return bucket.filter((photo) => photo.category === categoryKey)
  }, [categoryKey, photosByCategory])

  useEffect(() => {
    if (activeCategoryId === 'all') return
    if (!TAB_ID_TO_PHOTO_BUCKET[activeCategoryId]) {
      setActiveCategoryId('all')
    }
  }, [activeCategoryId])

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2 className="gallery-title">{t.gallery.title}</h2>
        <p className="gallery-subtitle">{t.gallery.subtitle}</p>
        <div className="gallery-divider" />
      </div>

      <div className="gallery-categories">
        {galleryCategories.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${activeCategoryId === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategoryId(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {!isLoading && filteredPhotos.length === 0 && (
          <p className="gallery-empty-state">
            {galleryError || t.gallery.emptyState}
          </p>
        )}
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="gallery-item"
            onClick={() => setSelectedImage(photo)}
          >
            {photo.type === 'video' ? (
              <video
                src={photo.url}
                poster={photo.thumbnailUrl}
                preload="metadata"
                muted
                playsInline
              />
            ) : (
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={photo.title}
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="gallery-overlay">
              <h3>{photo.title}</h3>
              <p className="gallery-overlay-caption">{photo.caption}</p>
              <span className="gallery-category-tag">{photo.category}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedImage(null)}>✕</button>
            {selectedImage.type === 'video' ? (
              <video src={selectedImage.url} controls autoPlay playsInline />
            ) : (
              <img src={selectedImage.url} alt={selectedImage.title} />
            )}
            <div className="lightbox-info">
              <h2>{selectedImage.title}</h2>
              <p>{selectedImage.caption}</p>
              <span className="lightbox-category">{selectedImage.category}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
