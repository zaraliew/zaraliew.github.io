import { useCallback, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { getToneColor } from '../../utils/toneColors'
import './WordDetail.css'

function colorPinyinWithTones(pinyinStr, tones) {
  const syllables = pinyinStr.split(/\s+/)
  return syllables.map((syllable, i) => {
    const tone = tones && tones[i] != null ? tones[i] : 5
    return (
      <span key={i} style={{ color: getToneColor(tone) }}>
        {syllable}
      </span>
    )
  })
}

export default function WordDetail({ word, songId, onClose }) {
  const { isWordSaved, saveWord, removeWord } = useApp()

  const saved = isWordSaved(word.characters, songId)

  const handleSave = useCallback(() => {
    if (saved) {
      removeWord(word.characters, songId)
    } else {
      saveWord({
        characters: word.characters,
        pinyin: word.pinyin,
        meaning: word.meaning,
        songId,
      })
    }
  }, [saved, word, songId, saveWord, removeWord])

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const toneLabel = word.tones
    ? word.tones.map((t) => (t === 5 ? '·' : t)).join(' ')
    : null

  return (
    <div className="word-detail-overlay" onClick={handleOverlayClick}>
      <div className="word-detail" role="dialog" aria-label={`Word: ${word.characters}`}>
        <button
          className="word-detail-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="word-detail-characters">{word.characters}</div>

        <div className="word-detail-pinyin">
          {colorPinyinWithTones(word.pinyin, word.tones)}
        </div>

        {toneLabel && (
          <div className="word-detail-tones">
            Tone{word.tones.length > 1 ? 's' : ''}: {toneLabel}
          </div>
        )}

        <div className="word-detail-meaning">{word.meaning}</div>

        <button
          className={`word-detail-save-btn${saved ? ' word-detail-save-btn--saved' : ''}`}
          onClick={handleSave}
        >
          {saved ? (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="word-detail-save-icon">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              Saved to Word Bank
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="word-detail-save-icon">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
              Save to Word Bank
            </>
          )}
        </button>
      </div>
    </div>
  )
}
