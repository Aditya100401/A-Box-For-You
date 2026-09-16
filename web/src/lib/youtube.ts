import { useEffect, useRef, useState } from 'react'

type Player = {
  loadVideoById: (id: string) => void
  playVideo: () => void
  destroy: () => void
}

type YT = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string
      width?: string | number
      height?: string | number
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: () => void
        onStateChange?: (e: { data: number }) => void
      }
    },
  ) => Player
  PlayerState: { PLAYING: number }
}

declare global {
  interface Window {
    YT?: YT
    onYouTubeIframeAPIReady?: () => void
  }
}

const API_SRC = 'https://www.youtube.com/iframe_api'
let apiPromise: Promise<YT> | null = null

function loadApi(): Promise<YT> {
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT)
      return
    }
    window.onYouTubeIframeAPIReady = () => resolve(window.YT!)
    const script = document.createElement('script')
    script.src = API_SRC
    script.async = true
    document.body.appendChild(script)
  })
  return apiPromise
}

const PATTERNS = [
  /youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})/,
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{11})/,
  /music\.youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})/,
]

/** Any YouTube link shape → the bare video id. */
export function toYouTubeId(url: string): string | null {
  const trimmed = String(url).trim()
  if (!trimmed) return null
  for (const pattern of PATTERNS) {
    const match = trimmed.match(pattern)
    if (match) return match[1]
  }
  return /^[A-Za-z0-9_-]{11}$/.test(trimmed) ? trimmed : null
}

/**
 * Drives one embedded player and reports whether audio is *actually* running,
 * so the tape reels only turn when a song is genuinely playing.
 */
export function useYouTubePlayer(videoId: string | null) {
  const mountRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const [playing, setPlaying] = useState(false)

  const hasVideo = videoId !== null

  useEffect(() => {
    if (!hasVideo || !mountRef.current || playerRef.current) return
    let cancelled = false
    const host = document.createElement('div')
    mountRef.current.appendChild(host)

    loadApi().then((yt) => {
      if (cancelled) return
      playerRef.current = new yt.Player(host, {
        videoId: videoId!,
        width: '100%',
        height: 220,
        playerVars: { rel: 0, playsinline: 1, autoplay: 1 },
        events: {
          // Creation follows her click on a track, so this usually satisfies
          // autoplay policy; if the browser refuses, she just presses play.
          onReady: () => playerRef.current?.playVideo(),
          onStateChange: (e) => setPlaying(e.data === yt.PlayerState.PLAYING),
        },
      })
    })

    return () => {
      cancelled = true
      playerRef.current?.destroy()
      playerRef.current = null
      setPlaying(false)
    }
    // The player is created once and re-pointed with loadVideoById below; tearing
    // it down per track would remount the iframe and restart the API handshake.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVideo])

  useEffect(() => {
    if (videoId && playerRef.current) playerRef.current.loadVideoById(videoId)
  }, [videoId])

  return { mountRef, playing }
}
