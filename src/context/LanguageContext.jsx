import { createContext, useContext, useState } from 'react'
import en from '../i18n/en'
import vi from '../i18n/vi'

const translations = { en, vi }

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en')

  const t = translations[language]

  const toggleLanguage = () => setLanguage(lang => lang === 'en' ? 'vi' : 'en')

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
