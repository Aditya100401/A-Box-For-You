import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GiftBoxArt } from '../components/GiftBoxArt'
import { api } from '../lib/api'
import { DEMO } from '../lib/demo'
import { curatorToken } from '../lib/storage'

const STEPS = [
  {
    no: '01',
    title: 'Fill the box',
    body: "Write the cards, pick the flowers, paste your YouTube links, list the gifts you're willing to buy.",
  },
  {
    no: '02',
    title: 'Send the link',
    body: 'One short link, theirs alone. Gift names never travel to their browser — only the teasers.',
  },
  {
    no: '03',
    title: 'They untie it',
    body: 'The ribbon comes undone, petals fall, the tape plays. Laptop, then phone — it resumes where they left off.',
  },
  {
    no: '04',
    title: 'You get the answer',
    body: 'One shake, locked forever. It lands in your log, and they can send the codeword too.',
  },
]

export function Home() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [result, setResult] = useState('')
  const [loadingDemo, setLoadingDemo] = useState(false)

  async function openDemo() {
    setLoadingDemo(true)
    try {
      const box = await api.createBox(DEMO)
      navigate(`/b/${box.id}`)
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Could not build the example.')
      setLoadingDemo(false)
    }
  }

  async function decode() {
    if (!code.trim()) return
    try {
      const found = await api.decode(code, curatorToken())
      setResult(`${found.to} drew: ${found.gift}`)
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Could not decode that.')
    }
  }

  return (
    <div className="fade">
      <div className="wrap">
        <div className="topbar">
          <div className="serif" style={{ fontSize: 19 }}>
            A Box For You
          </div>
          <div className="eyebrow">free · no sign-up</div>
        </div>

        <div className="hero">
          <div className="hero__copy rise">
            <h1 className="display hero__title">Pack a little box.</h1>
            <div className="row">
              <button className="btn" onClick={() => navigate('/make')}>
                Start packing →
              </button>
              <button className="btn btn--ghost" onClick={openDemo} disabled={loadingDemo}>
                {loadingDemo ? 'Wrapping…' : 'See an example box'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }} className="rise">
            <GiftBoxArt phase="closed" size={300} />
          </div>
        </div>

        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.no}>
              <div className="eyebrow eyebrow--accent">{s.no}</div>
              <div className="step__title">{s.title}</div>
              <div className="step__body">{s.body}</div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ marginTop: 56, maxWidth: 520 }}>
          <div className="eyebrow">Did they send you a codeword?</div>
          <div className="row">
            <input
              className="input"
              style={{
                flex: '1 1 180px',
                fontFamily: 'var(--mono)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && decode()}
              placeholder="e.g. 4-JUNIPER"
            />
            <button className="btn btn--ghost btn--small" onClick={decode}>
              Decode
            </button>
          </div>
          {result && (
            <div
              className="serif"
              style={{
                fontSize: 20,
                color: 'var(--accent)',
                borderTop: '1px dashed oklch(0.84 0.03 85)',
                paddingTop: 14,
              }}
            >
              {result}
            </div>
          )}
          <div className="note">
            Codewords decode against the boxes you've packed. <Link to="/log">See your log →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
