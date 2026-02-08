import { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AppContext = createContext(null)

const DEFAULT_SETTINGS = {
  showCharacters: true,
  showPinyin: true,
  showTranslation: true,
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useLocalStorage('mandarin-settings', DEFAULT_SETTINGS)
  const [savedWords, setSavedWords] = useLocalStorage('mandarin-words', [])
  const [lastPlayedSongId, setLastPlayedSongId] = useLocalStorage('mandarin-last-song', null)

  const toggleSetting = useCallback((key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [setSettings])

  const saveWord = useCallback((word) => {
    setSavedWords((prev) => {
      const exists = prev.some(
        (w) => w.characters === word.characters && w.songId === word.songId
      )
      if (exists) return prev
      return [...prev, { ...word, savedAt: Date.now() }]
    })
  }, [setSavedWords])

  const removeWord = useCallback((characters, songId) => {
    setSavedWords((prev) =>
      prev.filter((w) => !(w.characters === characters && w.songId === songId))
    )
  }, [setSavedWords])

  const isWordSaved = useCallback((characters, songId) => {
    return savedWords.some(
      (w) => w.characters === characters && w.songId === songId
    )
  }, [savedWords])

  return (
    <AppContext.Provider
      value={{
        settings,
        toggleSetting,
        savedWords,
        saveWord,
        removeWord,
        isWordSaved,
        lastPlayedSongId,
        setLastPlayedSongId,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
