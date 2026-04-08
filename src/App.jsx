import { useState } from 'react'
import Book from './components/Book'
import Timeline from './components/Timeline'
import Gallery from './components/Gallery'
import HiddenMessage from './components/HiddenMessage'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('book')
  const [showMessage, setShowMessage] = useState(false)

  return (
    <div className="app">
      <header className="header">
        <h1>💕 Our Wedding Journey 💕</h1>
        <p>A story of love, moments, and memories</p>
      </header>

      <nav className="nav-tabs">
        <button
          className={`tab-button ${activeTab === 'book' ? 'active' : ''}`}
          onClick={() => setActiveTab('book')}
        >
          📖 Book
        </button>
        <button
          className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          📅 Timeline
        </button>
        <button
          className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          🖼️ Gallery
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'book' && <Book />}
        {activeTab === 'timeline' && <Timeline />}
        {activeTab === 'gallery' && <Gallery />}
      </main>

      <footer className="footer">
        <p>
          Made with ❤️ to celebrate our love story{' '}
          <button
            className="footer-love-btn"
            onClick={() => setShowMessage(true)}
            aria-label="A hidden message"
            title="A hidden message 💌"
          >
            💌
          </button>
        </p>
      </footer>

      {showMessage && <HiddenMessage onClose={() => setShowMessage(false)} />}
    </div>
  )
}

export default App