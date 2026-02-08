import { useRef, useEffect, useState, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import LyricLine from './LyricLine'
import WordDetail from './WordDetail'
import './LyricsPanel.css'

export default function LyricsPanel({ lyrics, currentIndex, songId }) {
  const { settings } = useApp()
  const scrollRef = useRef(null)
  const lineRefs = useRef([])
  const [selectedWord, setSelectedWord] = useState(null)

  useEffect(() => {
    lineRefs.current = lineRefs.current.slice(0, lyrics.length)
  }, [lyrics.length])

  useEffect(() => {
    if (currentIndex < 0 || !lineRefs.current[currentIndex]) return

    const el = lineRefs.current[currentIndex]
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentIndex])

  const handleWordTap = useCallback((word) => {
    setSelectedWord(word)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedWord(null)
  }, [])

  return (
    <div className="lyrics-panel" ref={scrollRef}>
      <div className="lyrics-spacer" />

      {lyrics.map((line, index) => (
        <LyricLine
          key={`${songId}-${index}`}
          ref={(el) => { lineRefs.current[index] = el }}
          line={line}
          isActive={index === currentIndex}
          isPast={currentIndex >= 0 && index < currentIndex}
          settings={settings}
          onWordTap={handleWordTap}
          songId={songId}
        />
      ))}

      <div className="lyrics-spacer" />

      {selectedWord && (
        <WordDetail
          word={selectedWord}
          songId={songId}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  )
}
