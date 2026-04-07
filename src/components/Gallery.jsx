import { useState } from 'react'
import '../styles/Gallery.css'

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null)
  
  const photos = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=500&fit=crop',
      title: 'Engagement',
      caption: 'The moment we got engaged'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1606216174052-50fdfba2f239?w=500&h=500&fit=crop',
      title: 'Wedding Dress',
      caption: 'Finding the perfect dress'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=500&fit=crop',
      title: 'Ceremony',
      caption: 'Our special moment'
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1606216174052-50fdfba2f239?w=500&h=500&fit=crop',
      title: 'Reception',
      caption: 'Dancing the night away'
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=500&fit=crop',
      title: 'Sunset',
      caption: 'Golden hour moments'
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1606216174052-50fdfba2f239?w=500&h=500&fit=crop',
      title: 'Just Us',
      caption: 'Forever starts now'
    }
  ]

  return (
    <div className="gallery-container">
      <div className="gallery-grid">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="gallery-item"
            onClick={() => setSelectedImage(photo)}
          >
            <img src={photo.url} alt={photo.title} />
            <div className="gallery-overlay">
              <h3>{photo.title}</h3>
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}