import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getSongById } from '../../data/songs';
import { getToneFromPinyin } from '../../utils/toneColors';
import './Flashcard.css';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MODES = {
  CHAR_TO_MEANING: 'char-to-meaning',
  MEANING_TO_CHAR: 'meaning-to-char',
};

export default function Flashcard() {
  const { savedWords } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState(MODES.CHAR_TO_MEANING);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState([]);

  const words = useMemo(() => {
    if (!isShuffled) return savedWords;
    return shuffledOrder.length === savedWords.length
      ? shuffledOrder
      : savedWords;
  }, [savedWords, isShuffled, shuffledOrder]);

  const currentWord = words[currentIndex];

  const handleShuffle = useCallback(() => {
    if (isShuffled) {
      setIsShuffled(false);
      setShuffledOrder([]);
    } else {
      setShuffledOrder(shuffle(savedWords));
      setIsShuffled(true);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [isShuffled, savedWords]);

  const handleFlip = () => setIsFlipped((f) => !f);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const handleModeToggle = (newMode) => {
    setMode(newMode);
    setIsFlipped(false);
  };

  if (savedWords.length === 0) {
    return (
      <div className="flashcard-page">
        <header className="flashcard-header">
          <button className="flashcard-back" onClick={() => navigate('/wordbank')} aria-label="Back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="flashcard-header-title">Flashcards</span>
        </header>
        <div className="flashcard-empty">
          <p>No words to review yet.</p>
          <p className="flashcard-empty-hint">Save some words from songs first!</p>
        </div>
      </div>
    );
  }

  const song = currentWord ? getSongById(currentWord.songId) : null;
  const toneNum = currentWord ? getToneFromPinyin(currentWord.pinyin.split(/\s+/)[0]) : 1;

  const front =
    mode === MODES.CHAR_TO_MEANING
      ? { primary: currentWord?.characters, label: 'Characters', isChinese: true }
      : { primary: currentWord?.meaning, label: 'Meaning', isChinese: false };

  const back =
    mode === MODES.CHAR_TO_MEANING
      ? {
          pinyin: currentWord?.pinyin,
          meaning: currentWord?.meaning,
          characters: null,
          songTitle: song?.title,
        }
      : {
          pinyin: currentWord?.pinyin,
          meaning: null,
          characters: currentWord?.characters,
          songTitle: song?.title,
        };

  return (
    <div className="flashcard-page">
      <header className="flashcard-header">
        <button className="flashcard-back" onClick={() => navigate('/wordbank')} aria-label="Back to Word Bank">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="flashcard-header-title">Flashcards</span>
        <button
          className="flashcard-shuffle"
          onClick={handleShuffle}
          aria-label={isShuffled ? 'Unshuffle' : 'Shuffle'}
          data-active={isShuffled}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
        </button>
      </header>

      {/* Mode toggle */}
      <div className="flashcard-mode-toggle">
        <button
          className={`flashcard-mode-btn ${mode === MODES.CHAR_TO_MEANING ? 'flashcard-mode-btn--active' : ''}`}
          onClick={() => handleModeToggle(MODES.CHAR_TO_MEANING)}
        >
          字 &rarr; Eng
        </button>
        <button
          className={`flashcard-mode-btn ${mode === MODES.MEANING_TO_CHAR ? 'flashcard-mode-btn--active' : ''}`}
          onClick={() => handleModeToggle(MODES.MEANING_TO_CHAR)}
        >
          Eng &rarr; 字
        </button>
      </div>

      {/* Card */}
      <div className="flashcard-container" onClick={handleFlip} role="button" tabIndex={0} aria-label="Tap to flip card" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFlip(); }}>
        <div className={`flashcard ${isFlipped ? 'flashcard--flipped' : ''}`}>
          <div className="flashcard-front">
            <span className="flashcard-front-label">{front.label}</span>
            <span className={`flashcard-front-primary ${front.isChinese ? 'flashcard-front-primary--chinese' : ''}`}>
              {front.primary}
            </span>
            <span className="flashcard-front-hint">Tap to reveal</span>
          </div>
          <div className="flashcard-back">
            {back.characters && (
              <span className="flashcard-back-characters">{back.characters}</span>
            )}
            <span className="flashcard-back-pinyin" style={{ color: `var(--tone-${toneNum})` }}>
              {back.pinyin}
            </span>
            {back.meaning && (
              <span className="flashcard-back-meaning">{back.meaning}</span>
            )}
            {back.songTitle && (
              <span className="flashcard-back-song">from "{back.songTitle}"</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <p className="flashcard-progress">
        {currentIndex + 1} / {words.length}
      </p>

      {/* Navigation */}
      <div className="flashcard-nav">
        <button className="flashcard-nav-btn" onClick={handlePrev} disabled={currentIndex === 0}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Previous
        </button>
        <button className="flashcard-nav-btn" onClick={handleNext} disabled={currentIndex === words.length - 1}>
          Next
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
