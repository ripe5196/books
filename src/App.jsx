import { useEffect, useMemo, useRef, useState } from 'react'
import Book from './components/Book'
import Timeline from './components/Timeline'
import Gallery from './components/Gallery'
import HiddenMessage from './components/HiddenMessage'
import { useLanguage } from './context/LanguageContext'
import './App.css'

const YOUTUBE_TRACKS = [
  { id: 'iKzRIweSBLA', title: 'Perfect (Official Audio) - Ed Sheeran' },
  { id: 'lp-EO5I60KA', title: 'Thinking Out Loud (Official Audio) - Ed Sheeran' },
  { id: '450p7goxZqg', title: 'All of Me (Official Audio) - John Legend' },
  { id: 'rtOvBOTyX00', title: 'A Thousand Years (Official Audio) - Christina Perri' },
  { id: 'MI2uJ3q9i0E', title: 'Beautiful in White (Official Audio) - Shane Filan' },
  { id: 'ShZ978fBl6Y', title: 'You Are The Reason (Official Audio) - Calum Scott' },
  { id: 'GxldQ9eX2wo', title: 'Until I Found You (Official Audio) - Stephen Sanchez' },
  { id: '-BjZmE2gtdo', title: 'Lover (Official Audio) - Taylor Swift' },
  { id: 'xjE5D9cHiOk', title: 'I Choose You (Audio) - Sara Bareilles' },
  { id: '0put0_a--Ng', title: 'Make You Feel My Love (Audio) - Adele' },
  { id: '7Bwwo7ctG10', title: 'Endless Love (Audio) - Lionel Richie & Diana Ross' },
  { id: 'SPUJIbXN0WY', title: 'Everything (Audio) - Michael Buble' },
  { id: 'WQnAxOQxQIU', title: 'Truly Madly Deeply (Audio) - Savage Garden' },
  { id: 'hwZNL7QVJjE', title: 'Stand By Me (Audio) - Ben E. King' },
  { id: 'LjhCEhWiKXk', title: 'Just The Way You Are (Audio) - Bruno Mars' },
  { id: '0yW7w8F2TVA', title: 'Say You Wont Let Go (Audio) - James Arthur' },
  { id: 'EkHTsc9PU2A', title: 'Im Yours (Audio) - Jason Mraz' },
  { id: 'kPa7bsKwL-c', title: 'Marry You (Audio) - Bruno Mars' },
  { id: 'AJtDXIazrMo', title: 'Love Me Like You Do (Audio) - Ellie Goulding' },
  { id: 'nSDgHBxUbVQ', title: 'Photograph (Audio) - Ed Sheeran' },
  { id: 'xypzmu5mMPY', title: 'Hon Ca Yeu (Audio) - Duc Phuc' },
  { id: 'J9NQFACZYEU', title: 'Em Dong Y (Audio) - Duc Phuc' },
  { id: 'ZnQXkq9y5h8', title: 'Nam Lay Tay Anh (Audio) - Tuan Hung' },
  { id: '6w1p0cQ1x6Q', title: 'Mot Nha (Audio) - Da LAB' },
  { id: '9q3tWn6rGqA', title: 'Cuoi Nhau Di (Audio) - Bui Anh Tuan' },
  { id: '5nP8y1y1P8Q', title: 'Ngay Chung Doi (Audio) - Van Mai Huong' },
  { id: 'NvZcQq9sW2E', title: 'Hen Mot Mai (Audio) - Bui Anh Tuan' },
  { id: 'Zq1o9X6k9QY', title: 'Yes I Do (Audio) - OnlyC' },
  { id: '7VhRzQm9Gq8', title: 'Lam Vo Anh Nhe (Audio) - Chi Dan' },
  { id: 'k7Lh2F5J2kA', title: 'Anh Nang Cua Anh (Audio) - Duc Phuc' },
  { id: 'FN7ALfpGxiI', title: 'Noi Nay Co Anh (Audio) - Son Tung M-TP' },
  { id: '9F3vZ9bH7J0', title: 'Ta La Cua Nhau (Audio) - Dong Nhi' },
  { id: 'Y2E71oe0aSM', title: '10,000 Hours (Official Audio) - Dan + Shay, Justin Bieber' },
  { id: 'oOaXQv_0tQ4', title: 'Speechless (Audio) - Dan + Shay' },
  { id: '1U1UqF7l0N4', title: 'From The Ground Up (Audio) - Dan + Shay' },
  { id: 'Ba4nPx0g3gE', title: 'Yours (Audio) - Russell Dickerson' },
  { id: 'O1-4u9W-bns', title: 'I Wont Give Up (Audio) - Jason Mraz' },
  { id: 'FK3Qm8C6s9g', title: 'You Make It Real (Audio) - James Morrison' },
  { id: 's6TtwR2Dbjg', title: 'Heaven (Audio) - Bryan Adams' },
  { id: 'Y0pdQU87dc8', title: 'Everything I Do (Audio) - Bryan Adams' },
  { id: 'qiiyq2xrSI0', title: 'Unchained Melody (Audio) - The Righteous Brothers' },
  { id: 'S-cbOl96RFM', title: 'At Last (Audio) - Etta James' },
  { id: 'h9ZGKALMMuc', title: 'The Way You Look Tonight (Audio) - Frank Sinatra' },
  { id: 'f_HmF84G7ZY', title: 'L-O-V-E (Audio) - Nat King Cole' },
  { id: 'jz9N5p6pA1o', title: 'When I Fall In Love (Audio) - Nat King Cole' },
  { id: 'FHG2oizTlpY', title: 'My Heart Will Go On (Audio) - Celine Dion' },
  { id: 'Nq8TasNsgKw', title: 'Because You Loved Me (Audio) - Celine Dion' },
  { id: 'jjnmICxvoVY', title: 'I Knew I Loved You (Audio) - Savage Garden' },
  { id: '8uI7dQYh9pE', title: 'Nothings Gonna Change My Love For You (Audio) - George Benson' },
  { id: 'Ju8Hr50Ckwk', title: 'If I Aint Got You (Audio) - Alicia Keys' },
  { id: 'rywUS-ohqeE', title: 'No One (Audio) - Alicia Keys' },
  { id: '8xg3vE8Ie_E', title: 'Love Story (Audio) - Taylor Swift' },
  { id: 'KnW5H1r8T0Q', title: 'Co Em Cho (Audio) - Min ft Mr A' },
  { id: '9y2W9V0h7mM', title: 'Mai Mai Ben Nhau (Audio) - Noo Phuoc Thinh' },
  { id: '2n0cPZz2p9M', title: 'Yeu Mot Nguoi Co Le (Audio) - Lou Hoang' },
  { id: 'lx2c7cK6hSg', title: 'Cau Hon (Audio) - Van Mai Huong' },
  { id: 'eu2pBpQolKE', title: 'Nang Tho (Audio) - Hoang Dung' },
  { id: '0m8b9l8fXbU', title: 'Bai Nay Khong De Di Dien (Audio) - Anh Tu' },
  { id: '2yXK8kKkXqM', title: 'Em Yeu Anh Nhieu Lam (Audio) - Hua Kim Tuyen' },
  { id: 'lv9cQh9d8gE', title: 'Chi Can La Yeu (Audio) - Ha Anh Tuan' },
]

function App() {
  const [activeTab, setActiveTab] = useState('book')
  const [showAccessGate, setShowAccessGate] = useState(true)
  const [accessPassword, setAccessPassword] = useState('')
  const [isFullAccess, setIsFullAccess] = useState(false)
  const [accessError, setAccessError] = useState('')
  const [isCheckingAccess, setIsCheckingAccess] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [trackHistory, setTrackHistory] = useState([0])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const controlsRef = useRef(null)
  const playerHostRef = useRef(null)
  const playerRef = useRef(null)
  const isPlayerReadyRef = useRef(false)
  const pendingPlayRef = useRef(false)
  const trackHistoryRef = useRef([0])
  const historyIndexRef = useRef(0)
  const { language, toggleLanguage, t } = useLanguage()

  const currentTrack = useMemo(() => YOUTUBE_TRACKS[trackIndex], [trackIndex])

  const getRandomTrackIndex = (current, total) => {
    if (total <= 1) return current
    let randomIndex = current
    while (randomIndex === current) {
      randomIndex = Math.floor(Math.random() * total)
    }
    return randomIndex
  }

  useEffect(() => {
    trackHistoryRef.current = trackHistory
    historyIndexRef.current = historyIndex
  }, [trackHistory, historyIndex])

  const goToNextSong = () => {
    setHasUserInteracted(true)
    pendingPlayRef.current = true

    const currentIdx = trackIndex
    const nextTrackIndex = getRandomTrackIndex(currentIdx, YOUTUBE_TRACKS.length)
    const trimmedHistory = trackHistoryRef.current.slice(0, historyIndexRef.current + 1)
    const nextHistory = [...trimmedHistory, nextTrackIndex]
    const nextHistoryIndex = nextHistory.length - 1

    trackHistoryRef.current = nextHistory
    historyIndexRef.current = nextHistoryIndex
    setTrackHistory(nextHistory)
    setHistoryIndex(nextHistoryIndex)
    setTrackIndex(nextTrackIndex)
  }

  const goToPreviousSong = () => {
    setHasUserInteracted(true)
    pendingPlayRef.current = true

    const currentHistory = trackHistoryRef.current
    const currentHistoryIndex = historyIndexRef.current

    if (currentHistoryIndex > 0) {
      const previousHistoryIndex = currentHistoryIndex - 1
      historyIndexRef.current = previousHistoryIndex
      setHistoryIndex(previousHistoryIndex)
      setTrackIndex(currentHistory[previousHistoryIndex])
      return
    }

    // At first item, jump to latest played.
    const latestHistoryIndex = currentHistory.length - 1
    historyIndexRef.current = latestHistoryIndex
    setHistoryIndex(latestHistoryIndex)
    setTrackIndex(currentHistory[latestHistoryIndex])
  }

  const toggleMusic = () => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true)
      setMusicEnabled(true)
      pendingPlayRef.current = true
      return
    }
    if (!musicEnabled) {
      pendingPlayRef.current = true
    }
    setMusicEnabled((prev) => !prev)
  }

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event) => {
      if (!controlsRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  useEffect(() => {
    let cancelled = false

    const loadYouTubeApi = async () => {
      if (window.YT?.Player) return
      await new Promise((resolve) => {
        const existing = document.getElementById('youtube-iframe-api')
        if (existing) {
          const previous = window.onYouTubeIframeAPIReady
          window.onYouTubeIframeAPIReady = () => {
            previous?.()
            resolve()
          }
          return
        }

        const script = document.createElement('script')
        script.id = 'youtube-iframe-api'
        script.src = 'https://www.youtube.com/iframe_api'
        const previous = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => {
          previous?.()
          resolve()
        }
        document.body.appendChild(script)
      })
    }

    const initPlayer = async () => {
      await loadYouTubeApi()
      if (cancelled || !playerHostRef.current || !window.YT?.Player) return

      playerRef.current = new window.YT.Player(playerHostRef.current, {
        videoId: currentTrack.id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return
            isPlayerReadyRef.current = true
            event.target.setVolume(40)
            if (pendingPlayRef.current || (musicEnabled && hasUserInteracted)) {
              pendingPlayRef.current = false
              event.target.playVideo()
            } else {
              event.target.cueVideoById(currentTrack.id)
            }
          },
        },
      })
    }

    initPlayer()

    return () => {
      cancelled = true
      isPlayerReadyRef.current = false
      if (playerRef.current?.destroy) playerRef.current.destroy()
      playerRef.current = null
    }
  }, [])

  useEffect(() => {
    const player = playerRef.current
    if (!player || !isPlayerReadyRef.current) return

    if (musicEnabled && hasUserInteracted) {
      player.loadVideoById(currentTrack.id)
      pendingPlayRef.current = false
      return
    }

    player.cueVideoById(currentTrack.id)
  }, [trackIndex])

  useEffect(() => {
    const player = playerRef.current
    if (!player || !isPlayerReadyRef.current) return

    if (musicEnabled && hasUserInteracted) {
      player.playVideo()
      return
    }

    player.pauseVideo()
  }, [musicEnabled, hasUserInteracted])

  useEffect(() => {
    if (!isFullAccess && activeTab === 'timeline') {
      setActiveTab('book')
    }
  }, [isFullAccess, activeTab])

  const handleAccessSubmit = async () => {
    setIsCheckingAccess(true)
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: accessPassword }),
      })
      const data = await response.json()
      if (response.ok && data?.authorized) {
        setIsFullAccess(true)
        setShowAccessGate(false)
        setAccessError('')
        return
      }
      setIsFullAccess(false)
      setAccessError(language === 'vi' ? 'Mật khẩu không đúng. Bạn đang ở chế độ khách.' : 'Password is incorrect. You are in guest mode.')
      setShowAccessGate(false)
    } catch {
      setIsFullAccess(false)
      setAccessError(language === 'vi' ? 'Không thể xác thực. Bạn đang ở chế độ khách.' : 'Unable to verify. You are in guest mode.')
      setShowAccessGate(false)
    } finally {
      setIsCheckingAccess(false)
    }
  }

  const continueAsGuest = () => {
    setIsFullAccess(false)
    setShowAccessGate(false)
    setAccessError('')
  }

  return (
    <div className="app">
      {showAccessGate && (
        <div className="access-gate-overlay">
          <div className="access-gate-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{language === 'vi' ? 'Nhập mật khẩu quản trị' : 'Enter admin password'}</h2>
            <p>
              {language === 'vi'
                ? 'Nhập đúng mật khẩu để mở full quyền. Sai hoặc bỏ qua sẽ ở chế độ khách (chỉ đọc Book/Gallery, nghe nhạc).'
                : 'Enter the correct password for full access. Wrong password or skip will continue as guest (Book/Gallery/music only).'}
            </p>
            <input
              type="password"
              value={accessPassword}
              onChange={(e) => setAccessPassword(e.target.value)}
              placeholder={language === 'vi' ? 'Nhập mật khẩu' : 'Enter password'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAccessSubmit()
              }}
            />
            <div className="access-gate-actions">
              <button type="button" className="access-btn primary" onClick={handleAccessSubmit}>
                {isCheckingAccess
                  ? (language === 'vi' ? 'Đang kiểm tra...' : 'Checking...')
                  : (language === 'vi' ? 'Xác nhận' : 'Confirm')}
              </button>
              <button type="button" className="access-btn" onClick={continueAsGuest}>
                {language === 'vi' ? 'Vào chế độ khách' : 'Continue as guest'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        {isFullAccess && (
          <button
            className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            {t.nav.timeline}
          </button>
        )}
        <button
          className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          {t.nav.gallery}
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'book' && <Book />}
        {activeTab === 'timeline' && isFullAccess && (
          <Timeline presetWriteToken={accessPassword} hideWriteTokenInput />
        )}
        {activeTab === 'gallery' && <Gallery />}
      </main>

      {!showAccessGate && accessError && <div className="guest-notice">{accessError}</div>}

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

      <div className="youtube-audio-host" aria-hidden="true">
        <div ref={playerHostRef} className="youtube-player-frame" />
      </div>

      <div
        ref={controlsRef}
        className={`floating-controls ${menuOpen ? 'open' : ''}`}
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <button
          className="bear-toggle-btn floating-favorite-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={language === 'en' ? 'Open quick actions' : 'Mở thao tác nhanh'}
          title={language === 'en' ? 'Open quick actions' : 'Mở thao tác nhanh'}
        >
          🧸
        </button>

        <button
          className="music-prev-btn floating-favorite-btn"
          onClick={goToPreviousSong}
          aria-label={t.music.prevLabel}
          title={t.music.prevTitle}
        >
          ⏮
        </button>

        <button
          className="music-next-btn floating-favorite-btn"
          onClick={goToNextSong}
          aria-label={t.music.nextLabel}
          title={t.music.nextTitle}
        >
          ⏭
        </button>

        <button
          className="music-toggle-btn floating-favorite-btn"
          onClick={toggleMusic}
          aria-label={musicEnabled ? t.music.disableLabel : t.music.enableLabel}
          title={
            !hasUserInteracted
              ? (language === 'en' ? 'Click to start music' : 'Nhấn để bắt đầu nhạc')
              : musicEnabled
                ? t.music.disableTitle
                : t.music.enableTitle
          }
        >
          {musicEnabled ? '🎵' : '🔇'}
        </button>

        <button
          className="lang-toggle-btn floating-favorite-btn"
          onClick={toggleLanguage}
          aria-label="Toggle language"
          title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
        >
          {language === 'en' ? '🇻🇳' : '🇺🇸'}
        </button>
      </div>
    </div>
  )
}

export default App