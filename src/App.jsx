import { useState } from 'react'
import Book from './components/Book'
import Timeline from './components/Timeline'
import Gallery from './components/Gallery'
import HiddenMessage from './components/HiddenMessage'
import { useLanguage } from './context/LanguageContext'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('book')
  const [showMessage, setShowMessage] = useState(false)
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <div className="app">
      <header className="header">
        <div className="header-text">
          <h1>{t.header.title}</h1>
          <p>{t.header.subtitle}</p>
        </div>
      </header>

      <nav className="nav-tabs">
        <button
          className={`tab-button ${activeTab === 'book' ? 'active' : ''}`}
          onClick={() => setActiveTab('book')}
        >
          {t.nav.book}
        </button>
        <button
          className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          {t.nav.timeline}
        </button>
        <button
          className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          {t.nav.gallery}
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'book' && <Book />}
        {activeTab === 'timeline' && <Timeline />}
        {activeTab === 'gallery' && <Gallery />}
      </main>

      <footer className="footer">
        <p>
          {t.footer.madeWith}{' '}
          <button
            className="footer-love-btn"
            onClick={() => setShowMessage(true)}
            aria-label={t.footer.hiddenMessageLabel}
            title={t.footer.hiddenMessageTitle}
          >
            💌
          </button>
        </p>
      </footer>

      {showMessage && <HiddenMessage onClose={() => setShowMessage(false)} />}

      <button
        className="lang-toggle-btn"
        onClick={toggleLanguage}
        aria-label="Toggle language"
        title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
      >
        {language === 'en' ? '🇻🇳' : '🇺🇸'}
      </button>
    </div>
  )
}

export default App