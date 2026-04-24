import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import '../styles/Gallery.css'

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'duhxn8dxo'
const cloudinaryFolders = {
  Lives: import.meta.env.VITE_CLOUDINARY_FOLDER_US || 'us',
  Engagement: import.meta.env.VITE_CLOUDINARY_FOLDER_YES || 'the-yes',
  Wedding: import.meta.env.VITE_CLOUDINARY_FOLDER_FOREVER || 'forever',
  School: import.meta.env.VITE_CLOUDINARY_FOLDER_THROWBACK || 'throwback',
}
const cloudinaryTags = {
  Lives: import.meta.env.VITE_CLOUDINARY_TAG_US || 'us',
  Engagement: import.meta.env.VITE_CLOUDINARY_TAG_YES || 'the-yes',
  Wedding: import.meta.env.VITE_CLOUDINARY_TAG_FOREVER || 'forever',
  School: import.meta.env.VITE_CLOUDINARY_TAG_THROWBACK || 'throwback',
}

const optimizeCloudinaryUrl = (url) =>
  url.replace(/\/(image|video)\/upload\//, '/$1/upload/f_auto,q_auto/')

const toCloudinaryVariant = (url, transform) =>
  url.replace(/\/(image|video)\/upload\//, '/$1/upload/' + transform + '/')

const toVideoPoster = (url) =>
  url.replace('/video/upload/', '/video/upload/so_0,f_jpg,q_auto,c_limit,w_700/')

// Map category index (from translations) to the photo category key used for filtering.
// Index 0 = All, 1 = Lives, 2 = Engagement, 3 = Wedding, 4 = School
const CATEGORY_KEYS = [null, 'Lives', 'Engagement', 'Wedding', 'School']

export default function Gallery() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState(null)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [dynamicCategoryPhotos, setDynamicCategoryPhotos] = useState({
    Lives: [],
    Engagement: [],
    Wedding: [],
    School: [],
  })

  useEffect(() => {
    const folderRequests = Object.entries(cloudinaryFolders).map(([category, folder]) => ({
      category,
      url: `/api/cloudinary/images?folder=${encodeURIComponent(folder)}&tag=${encodeURIComponent(cloudinaryTags[category])}&limit=60`,
    }))

    setIsLoading(true)
    Promise.all(
      folderRequests.map(async ({ category, url }) => {
        try {
          const response = await fetch(url)
          if (!response.ok) return { category, photos: [] }
          const data = await response.json()
          const resources = Array.isArray(data?.images) ? data.images : []
          const photos = resources.map((resource, index) => ({
            id: `${category}-${resource.public_id || index}`,
            category,
            type: resource.resource_type === 'video' ? 'video' : 'image',
            url: optimizeCloudinaryUrl(resource.url || ''),
            thumbnailUrl: resource.resource_type === 'video'
              ? toVideoPoster(resource.url || '')
              : toCloudinaryVariant(resource.url || '', 'f_auto,q_auto:eco,dpr_auto,c_limit,w_700'),
          })).filter((photo) => photo.url)
          return { category, photos, listUrl: url }
        } catch {
          return { category, photos: [] }
        }
      }),
    ).then((results) => {
      const nextState = { Lives: [], Engagement: [], Wedding: [], School: [] }
      results.forEach(({ category, photos, listUrl }) => {
        if (photos.length === 0 && listUrl) {
          console.warn(`No images returned for ${category}. Check Cloudinary folder/tag config for request: ${listUrl}`)
        }
        nextState[category] = photos
      })
      setDynamicCategoryPhotos(nextState)
      setIsLoading(false)
    })
  }, [])

  const photos = useMemo(() => {
    const mergedPhotos = [
      ...dynamicCategoryPhotos.Lives,
      ...dynamicCategoryPhotos.Engagement,
      ...dynamicCategoryPhotos.Wedding,
      ...dynamicCategoryPhotos.School,
    ]

    return mergedPhotos.map((base, i) => ({
      ...base,
      ...(t.gallery.photos[i] || {
        title: `${t.gallery.title} ${i + 1}`,
        caption: t.gallery.subtitle,
      }),
    }))
  }, [dynamicCategoryPhotos, t])

  const categoryKey = CATEGORY_KEYS[activeCategoryIndex]
  const filteredPhotos = categoryKey === null
    ? photos
    : photos.filter((p) => p.category === categoryKey)

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2 className="gallery-title">{t.gallery.title}</h2>
        <p className="gallery-subtitle">{t.gallery.subtitle}</p>
        <div className="gallery-divider" />
      </div>

      <div className="gallery-categories">
        {t.gallery.categories.map((cat, index) => (
          <button
            key={cat}
            className={`category-btn ${activeCategoryIndex === index ? 'active' : ''}`}
            onClick={() => setActiveCategoryIndex(index)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {!isLoading && filteredPhotos.length === 0 && (
          <p className="gallery-empty-state">
            {t.gallery.emptyState}
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