import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type BoxSummary } from '../lib/api'
import { adoptCuratorToken, curatorToken } from '../lib/storage'

export function Log() {
  const [boxes, setBoxes] = useState<BoxSummary[]>([])
  const [error, setError] = useState('')
  const [claim, setClaim] = useState('')
  const token = curatorToken()

  useEffect(() => {
    api
      .history(token)
      .then(setBoxes)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your log.'))
  }, [token])

  return (
    <div className="wrap fade">
      <div className="topbar">
        <div className="serif" style={{ fontSize: 19 }}>
          Boxes you've packed
        </div>
        <Link to="/" style={{ borderBottom: 'none' }} className="btn btn--ghost btn--small">
          ← Home
        </Link>
      </div>

      {error && <div className="error">{error}</div>}

      {!error && boxes.length === 0 && (
        <div className="panel" style={{ maxWidth: 520 }}>
          <div className="serif" style={{ fontSize: 24 }}>
            Nothing packed yet.
          </div>
          <div className="note">
            When you send a box, it shows up here — along with whatever the 8-ball gave her.
          </div>
          <Link to="/make" className="btn" style={{ alignSelf: 'flex-start', borderBottom: 'none' }}>
            Start packing →
          </Link>
        </div>
      )}

      {boxes.length > 0 && (
        <div className="history">
          {boxes.map((box) => (
            <div className="history__row" key={box.id}>
              <div>
                <div className="serif" style={{ fontSize: 22 }}>
                  {box.to || 'Unnamed box'}
                </div>
                <div className="note">
                  {box.created_at} · {box.untied ? 'opened' : 'not opened yet'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {box.pick ? (
                  <>
                    <div className="history__gift">{box.pick.name}</div>
                    <div className="eyebrow">{box.pick.code}</div>
                  </>
                ) : (
                  <div className="note">Ball not shaken</div>
                )}
                <Link to={`/b/${box.id}`} className="note" style={{ display: 'inline-block', marginTop: 6 }}>
                  open her link
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="panel" style={{ marginTop: 40, maxWidth: 520 }}>
        <div className="eyebrow">Packing from another device?</div>
        <div className="note">
          This log lives behind one secret key, not an account. Paste this key on your phone to see
          the same list there.
        </div>
        <input className="input input--mono" value={token} readOnly onFocus={(e) => e.target.select()} />
        <div className="row">
          <input
            className="input input--mono"
            style={{ flex: '1 1 200px' }}
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Paste a key from your other device"
          />
          <button
            className="btn btn--ghost btn--small"
            onClick={() => {
              if (claim.trim().length < 20) {
                setError('That key looks too short.')
                return
              }
              adoptCuratorToken(claim.trim())
              location.reload()
            }}
          >
            Use this key
          </button>
        </div>
      </div>
    </div>
  )
}
