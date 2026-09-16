import { useState } from 'react'
import type { Track } from '../lib/api'
import { toYouTubeId, useYouTubePlayer } from '../lib/youtube'
import { Cassette } from './Cassette'

export function TapePanel({
  tracks,
  to,
  age,
  styleId,
  customLabel,
}: {
  tracks: Track[]
  to: string
  age: number
  styleId?: string
  customLabel?: string
}) {
  const [current, setCurrent] = useState<number | null>(null)
  const track = current === null ? null : tracks[current]
  const videoId = track ? toYouTubeId(track.url) : null
  const { mountRef, playing } = useYouTubePlayer(videoId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Cassette
          spinning={playing}
          styleId={styleId}
          label={customLabel || `SIDE A — FOR ${to.toUpperCase()}`}
          subtitle={age ? `${age} songs, ${age} years` : `${tracks.length} songs`}
        />
      </div>

      <div ref={mountRef} />

      {track && !videoId && (
        <div className="note">No link on this one — {track.title} is here in spirit.</div>
      )}

      {track?.why && <div className="why">{track.why}</div>}

      <div className="tracklist">
        {tracks.map((t, i) => (
          <button
            key={i}
            className={`track${current === i ? ' track--on' : ''}`}
            onClick={() => setCurrent(i)}
          >
            <span className="track__no">{String(i + 1).padStart(2, '0')}</span>
            <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span className="track__title">{t.title || 'Untitled'}</span>
              <span className="track__artist">{t.artist}</span>
            </span>
            {current === i && <span className="track__cue">{playing ? 'playing' : 'cued'}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
