import { useState, useEffect, useRef, useCallback } from 'react'

export function useLyricSync(lyrics, playerRef) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef(null)

  const findCurrentLine = useCallback((time) => {
    if (!lyrics || lyrics.length === 0) return -1

    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (time >= lyrics[i].startTime) {
        return i
      }
    }
    return -1
  }, [lyrics])

  const startPolling = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const time = playerRef.current.getCurrentTime()
        setCurrentTime(time)
        setCurrentIndex(findCurrentLine(time))
      }
    }, 200)
  }, [playerRef, findCurrentLine])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const onPlayerStateChange = useCallback((state) => {
    // YouTube states: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering
    if (state === 1) {
      setIsPlaying(true)
      startPolling()
    } else {
      setIsPlaying(false)
      stopPolling()
    }
  }, [startPolling, stopPolling])

  useEffect(() => {
    return stopPolling
  }, [stopPolling])

  return {
    currentIndex,
    currentTime,
    isPlaying,
    onPlayerStateChange,
  }
}
