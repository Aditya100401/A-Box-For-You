import { useState } from 'react'
import type { Pick } from '../lib/api'

export function BallPanel({
  teasers,
  pick,
  sender,
  boxId,
  preview,
  onShake,
}: {
  teasers: string[]
  pick: Pick | null
  sender: string
  boxId: string
  preview: boolean
  onShake: () => Promise<void>
}) {
  const [shaking, setShaking] = useState(false)
  const [copied, setCopied] = useState('')
  const [error, setError] = useState('')

  async function shake() {
    if (shaking || pick) return
    setShaking(true)
    setError('')
    const settled = new Promise((r) => setTimeout(r, 1500))
    try {
      await Promise.all([onShake(), settled])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The ball would not answer.')
    } finally {
      setShaking(false)
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2200)
  }

  const revealUrl = `${location.origin}/r/${boxId}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', textAlign: 'center' }}>
      <div style={{ font: '400 15px/1.65 var(--sans)', color: 'var(--ink-soft)', maxWidth: '44ch' }}>
        {pick
          ? 'You shook it once. That is all anyone gets.'
          : `There are ${teasers.length} gifts inside this ball and exactly one of them is yours. ${
              sender || 'They'
            } will not be told which until you tell them.`}
      </div>

      <div className={shaking ? 'ball ball--shaking' : 'ball'}>
        <div className="ball__window">
          {pick ? (
            <span className="ball__answer">{pick.name}</span>
          ) : (
            <span className="ball__eight">8</span>
          )}
        </div>
      </div>

      {!pick && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <button className="btn" onClick={shake} disabled={shaking}>
            {shaking ? 'Shaking…' : 'Shake the ball'}
          </button>
          {teasers.length > 0 && (
            <div className="teasers">
              {teasers.map((hint, i) => (
                <span className="teaser" key={i}>
                  {hint || 'a mystery'}
                </span>
              ))}
            </div>
          )}
          <div className="note">One shake only. The ball does not take requests.</div>
          {error && <div className="error">{error}</div>}
        </div>
      )}

      {pick && (
        <div
          className="rise"
          style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', width: '100%', maxWidth: 480 }}
        >
          <div className="serif" style={{ fontSize: 26, lineHeight: 1.25 }}>
            Fate says: {pick.name}
          </div>
          {preview ? (
            <div className="note">
              This is a preview, so nothing was locked in. Their real shake happens once, on their link.
            </div>
          ) : (
            <>
              <div className="note">
                Send {sender || 'them'} this codeword and it's on its way.
              </div>
              <div className="codeword">{pick.code}</div>
              <div className="row" style={{ justifyContent: 'center' }}>
                <button
                  className="btn btn--small"
                  onClick={() =>
                    copy(`The 8-ball has spoken. My codeword is ${pick.code} — go look it up.`, 'msg')
                  }
                >
                  {copied === 'msg' ? 'Copied ✓' : 'Copy the message'}
                </button>
                <button
                  className="btn btn--ghost btn--small"
                  onClick={() => copy(revealUrl, 'link')}
                >
                  {copied === 'link' ? 'Copied ✓' : 'Copy reveal link'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
