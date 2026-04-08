import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import '../styles/Gallery.css'

const photoUrls = [
  { id: 1, url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=500&fit=crop', category: 'Lives' },
  { id: 2, url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop', category: 'School' },
  { id: 3, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=500&fit=crop', category: 'Engagement' },
  { id: 4, url: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=500&h=500&fit=crop', category: 'Wedding' },
  { id: 5, url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&h=500&fit=crop', category: 'Wedding' },
  { id: 6, url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500&h=500&fit=crop', category: 'Wedding' },
  { id: 7, url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500&h=500&fit=crop', category: 'Engagement' },
  { id: 8, url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&h=500&fit=crop', category: 'School' },
  { id: 9, url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=500&fit=crop', category: 'Lives' },
]

// Map category index (from translations) to the photo category key used for filtering.
// Index 0 = All, 1 = Lives, 2 = Engagement, 3 = Wedding, 4 = School
const CATEGORY_KEYS = [null, 'Lives', 'Engagement', 'Wedding', 'School']

export default function Gallery() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState(null)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)

  const photos = photoUrls.map((base, i) => ({
    ...base,
    ...t.gallery.photos[i],
  }))

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
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="gallery-item"
            onClick={() => setSelectedImage(photo)}
          >
            <img src={photo.url} alt={photo.title} />
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
            <img src={selectedImage.url} alt={selectedImage.title} />
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