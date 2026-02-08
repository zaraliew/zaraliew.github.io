import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getSongById } from '../../data/songs';
import { getToneFromPinyin } from '../../utils/toneColors';
import './WordBank.css';

export default function WordBank() {
  const { savedWords, removeWord } = useApp();
  const navigate = useNavigate();

  const groupedWords = useMemo(() => {
    const groups = {};
    savedWords.forEach((word) => {
      const key = word.songId;
      if (!groups[key]) {
        const song = getSongById(key);
        groups[key] = {
          songId: key,
          title: song ? song.title : 'Unknown Song',
          words: [],
        };
      }
      groups[key].words.push(word);
    });
    return Object.values(groups);
  }, [savedWords]);

  const primaryTone = (pinyin) => {
    const first = pinyin.split(/\s+/)[0];
    return getToneFromPinyin(first);
  };

  return (
    <div className="wordbank">
      <header className="wordbank-header">
        <button className="wordbank-back" onClick={() => navigate('/')} aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="wordbank-title">Word Bank</h1>
        {savedWords.length > 0 && (
          <span className="wordbank-count">{savedWords.length}</span>
        )}
      </header>

      {savedWords.length === 0 ? (
        <div className="wordbank-empty">
          <div className="wordbank-empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <line x1="9" y1="10" x2="15" y2="10" />
            </svg>
          </div>
          <p className="wordbank-empty-title">Your Word Bank is empty</p>
          <p className="wordbank-empty-subtitle">
            Tap words while exploring songs to save them here for review.
          </p>
          <Link to="/" className="wordbank-empty-link">
            Explore Songs
          </Link>
        </div>
      ) : (
        <div className="wordbank-content">
          {groupedWords.map((group) => (
            <section key={group.songId} className="wordbank-group">
              <h2 className="wordbank-group-title">{group.title}</h2>
              <div className="wordbank-group-list">
                {group.words.map((word) => {
                  const tone = primaryTone(word.pinyin);
                  return (
                    <div className="word-card" key={`${word.songId}-${word.characters}`}>
                      <span className="word-card-characters">{word.characters}</span>
                      <div className="word-card-details">
                        <span
                          className="word-card-pinyin"
                          style={{ color: `var(--tone-${tone})` }}
                        >
                          {word.pinyin}
                        </span>
                        <span className="word-card-meaning">{word.meaning}</span>
                      </div>
                      <button
                        className="word-card-remove"
                        onClick={() => removeWord(word.characters, word.songId)}
                        aria-label={`Remove ${word.characters}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <Link to="/wordbank/flashcards" className="flashcard-link">
            Practice with Flashcards
          </Link>
        </div>
      )}
    </div>
  );
}
