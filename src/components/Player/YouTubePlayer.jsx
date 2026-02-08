import { useEffect, useRef, useState, useCallback } from 'react'

let apiLoadPromise = null

function loadYouTubeAPI() {
  if (apiLoadPromise) return apiLoadPromise

  if (window.YT && window.YT.Player) {
    apiLoadPromise = Promise.resolve()
    return apiLoadPromise
  }

  apiLoadPromise = new Promise((resolve) => {
    const prevCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback()
      resolve()
    }

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.head.appendChild(script)
    }
  })

  return apiLoadPromise
}

export default function YouTubePlayer({ videoId, playerRef, onStateChange }) {
  const containerRef = useRef(null)
  const ytPlayerRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const onStateChangeRef = useRef(onStateChange)

  useEffect(() => {
    onStateChangeRef.current = onStateChange
  }, [onStateChange])

  const destroyPlayer = useCallback(() => {
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.destroy()
      } catch {
        // Player may already be destroyed
      }
      ytPlayerRef.current = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      await loadYouTubeAPI()
      if (cancelled || !containerRef.current) return

      destroyPlayer()

      const player = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          fs: 0,
          cc_load_policy: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            if (cancelled) return
            setIsReady(true)

            playerRef.current = {
              getCurrentTime: () => player.getCurrentTime(),
              getPlayerState: () => player.getPlayerState(),
            }
          },
          onStateChange: (event) => {
            if (onStateChangeRef.current) {
              onStateChangeRef.current(event.data)
            }
          },
        },
      })

      ytPlayerRef.current = player
    }

    init()

    return () => {
      cancelled = true
      destroyPlayer()
      if (playerRef.current) {
        playerRef.current = null
      }
    }
  }, [videoId, playerRef, destroyPlayer])

  return (
    <div className="youtube-player">
      {!isReady && (
        <div className="youtube-player-loading">
          <div className="youtube-player-spinner" />
        </div>
      )}
      <div
        ref={containerRef}
        className="youtube-player-embed"
        style={{ opacity: isReady ? 1 : 0 }}
      />
      <style>{`
        .youtube-player {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          background: #000;
        }
        .youtube-player iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        .youtube-player-embed {
          width: 100%;
          height: 100%;
          transition: opacity 0.3s ease;
        }
        .youtube-player-loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          z-index: 1;
        }
        .youtube-player-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(255, 255, 255, 0.15);
          border-top-color: var(--accent-purple);
          border-radius: 50%;
          animation: yt-spin 0.8s linear infinite;
        }
        @keyframes yt-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
