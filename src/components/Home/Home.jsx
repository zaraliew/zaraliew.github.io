import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import songs from '../../data/songs'
import './Home.css'

const LEVELS = [
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
]

function SongCard({ song, variant = 'compact' }) {
  const isLarge = variant === 'large'
  const isRecommended = variant === 'recommended'

  const cardClass = [
    'song-card',
    isLarge && 'song-card-large',
    isRecommended && 'song-card-recommended',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link
      to={`/song/${song.id}`}
      className={cardClass}
      style={{
        background: `linear-gradient(135deg, ${song.gradient[0]}, ${song.gradient[1]})`,
      }}
    >
      {isLarge ? (
        <>
          <div className="song-card-info">
            <div className="song-card-title">{song.title}</div>
            <div className="song-card-artist">{song.artist}</div>
            <div className="song-card-meta">
              <span className={`difficulty-badge ${song.difficulty}`}>
                {song.difficulty}
              </span>
              <span className="vocab-tag">{song.vocabLevel}</span>
            </div>
          </div>
          <span className="song-card-play-hint" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </>
      ) : (
        <>
          <div className="song-card-title">{song.title}</div>
          <div className="song-card-artist">{song.artist}</div>
          <div className="song-card-meta">
            <span className={`difficulty-badge ${song.difficulty}`}>
              {song.difficulty}
            </span>
            <span className="vocab-tag">{song.vocabLevel}</span>
          </div>
        </>
      )}
    </Link>
  )
}

export default function Home() {
  const { lastPlayedSongId, savedWords } = useApp()

  const continueSong = lastPlayedSongId
    ? songs.find((s) => s.id === lastPlayedSongId)
    : null

  const songsByLevel = LEVELS.map(({ key, label }) => ({
    key,
    label,
    songs: songs.filter((s) => s.difficulty === key),
  })).filter((group) => group.songs.length > 0)

  return (
    <div className="home">
      {/* ── Header ──────────────────────────────── */}
      <header className="home-header">
        <h1 className="home-app-name">
          <span className="note" aria-hidden="true">&#9835;</span>
          Mandiàn
        </h1>
        <p className="home-subtitle">Learn Mandarin through songs</p>

        {savedWords.length > 0 && (
          <div className="home-stats">
            <span className="home-stat">
              <strong>{savedWords.length}</strong> saved word{savedWords.length !== 1 ? 's' : ''}
            </span>
            <span className="home-stat">
              <strong>{songs.length}</strong> song{songs.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </header>

      {/* ── Continue listening ──────────────────── */}
      {continueSong && (
        <section className="home-continue">
          <div className="home-continue-label">Continue listening</div>
          <SongCard song={continueSong} variant="large" />
        </section>
      )}

      {/* ── Recommended for you ────────────────── */}
      <section className="home-section">
        <h2 className="home-section-title">Recommended for you</h2>
        <div className="home-recommended">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} variant="recommended" />
          ))}
        </div>
      </section>

      {/* ── By Level ───────────────────────────── */}
      <section className="home-section">
        <h2 className="home-section-title">By Level</h2>
        {songsByLevel.map((group) => (
          <div key={group.key} className="home-level-group">
            <div className="home-level-label">{group.label}</div>
            <div className="home-scroll">
              {group.songs.map((song) => (
                <SongCard key={song.id} song={song} variant="compact" />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
