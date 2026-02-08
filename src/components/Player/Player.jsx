import { useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { getSongById } from '../../data/songs'
import { useLyricSync } from '../../hooks/useLyricSync'
import YouTubePlayer from './YouTubePlayer'
import LyricsPanel from './LyricsPanel'
import LayerToggles from './LayerToggles'
import './Player.css'

export default function Player() {
  const { songId } = useParams()
  const { setLastPlayedSongId } = useApp()
  const playerRef = useRef(null)

  const song = getSongById(songId)
  const { currentIndex, currentTime, isPlaying, onPlayerStateChange } =
    useLyricSync(song?.lyrics ?? [], playerRef)

  useEffect(() => {
    if (song) {
      setLastPlayedSongId(song.id)
    }
  }, [song, setLastPlayedSongId])

  if (!song) {
    return (
      <div className="player player--not-found">
        <div className="player-not-found">
          <div className="player-not-found-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9 9l6 6M15 9l-6 6" />
            </svg>
          </div>
          <h2 className="player-not-found-title">Song not found</h2>
          <p className="player-not-found-text">
            The song you're looking for doesn't seem to exist.
          </p>
          <Link to="/" className="player-not-found-link">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="player">
      <div className="player-video">
        <Link to="/" className="player-back" aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <YouTubePlayer
          videoId={song.youtubeId}
          playerRef={playerRef}
          onStateChange={onPlayerStateChange}
        />
      </div>

      <div className="player-header">
        <span className="player-header-title">{song.title}</span>
        <span className="player-header-divider" aria-hidden="true">·</span>
        <span className="player-header-artist">{song.artist}</span>
      </div>

      <div className="player-lyrics-area">
        <LyricsPanel
          lyrics={song.lyrics}
          currentIndex={currentIndex}
          songId={song.id}
        />
        <LayerToggles />
      </div>
    </div>
  )
}
