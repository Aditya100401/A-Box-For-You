import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'

export function Reveal() {
  const { id } = useParams<{ id: string }>()
  const [who, setWho] = useState('She')
  const [gift, setGift] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    Promise.all([api.getBox(id), api.getSession(id)])
      .then(([box, session]) => {
        setWho(box.to || 'She')
        if (session.pick) setGift(session.pick.name)
        else setError('She hasn’t shaken the ball yet.')
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Nothing to reveal.'))
  }, [id])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 22px',
      }}
    >
      <div
        className="rise"
        style={{
          maxWidth: 520,
          width: '100%',
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          padding: '40px 34px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          textAlign: 'center',
        }}
      >
        <div className="eyebrow">{gift ? 'The ball has spoken' : 'Not yet'}</div>
        <div className="display" style={{ fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.15 }}>
          {gift ? `${who} drew:` : error}
        </div>
        {gift && (
          <>
            <div
              className="serif"
              style={{
                fontSize: 'clamp(24px, 4vw, 32px)',
                lineHeight: 1.3,
                color: 'oklch(0.5 0.13 15)',
                borderTop: '1px dashed oklch(0.84 0.03 85)',
                borderBottom: '1px dashed oklch(0.84 0.03 85)',
                padding: '22px 0',
              }}
            >
              {gift}
            </div>
            <div className="note">Time to go order it.</div>
          </>
        )}
        <Link to="/" className="btn btn--ghost btn--small" style={{ alignSelf: 'center', borderBottom: 'none' }}>
          Pack another box
        </Link>
      </div>
    </div>
  )
}
