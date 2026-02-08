import { forwardRef, useCallback } from 'react'
import { getToneFromPinyin, getToneColor } from '../../utils/toneColors'
import './LyricLine.css'

function colorPinyinSyllables(pinyinStr) {
  const syllables = pinyinStr.split(/\s+/)
  return syllables.map((syllable, i) => {
    const tone = getToneFromPinyin(syllable)
    return (
      <span key={i} style={{ color: getToneColor(tone) }}>
        {syllable}
      </span>
    )
  })
}

const LyricLine = forwardRef(function LyricLine(
  { line, isActive, isPast, settings, onWordTap, songId },
  ref
) {
  const stateClass = isActive
    ? 'lyric-line--active'
    : isPast
      ? 'lyric-line--past'
      : 'lyric-line--future'

  const handleWordClick = useCallback(
    (word) => {
      if (onWordTap) onWordTap(word)
    },
    [onWordTap]
  )

  const showPinyin = settings.showPinyin
  const showCharacters = settings.showCharacters
  const showTranslation = settings.showTranslation

  // If nothing is visible, still render characters as fallback
  const showFallback = !showPinyin && !showCharacters && !showTranslation

  return (
    <div ref={ref} className={`lyric-line ${stateClass}`}>
      {/* Pinyin row */}
      {showPinyin && (
        <div className="lyric-pinyin">
          {line.words.map((word, i) => (
            <span key={i} className="lyric-pinyin-word">
              {colorPinyinSyllables(word.pinyin)}
            </span>
          ))}
        </div>
      )}

      {/* Characters row */}
      {(showCharacters || showFallback) && (
        <div className="lyric-characters">
          {line.words.map((word, i) => (
            <span
              key={i}
              className="lyric-word"
              role="button"
              tabIndex={0}
              onClick={() => handleWordClick(word)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleWordClick(word)
                }
              }}
            >
              {word.characters}
            </span>
          ))}
        </div>
      )}

      {/* Translation row */}
      {showTranslation && (
        <div className="lyric-translation">{line.translation}</div>
      )}
    </div>
  )
})

export default LyricLine
