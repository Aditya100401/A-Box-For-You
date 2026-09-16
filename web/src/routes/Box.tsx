import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { BallPanel } from '../components/BallPanel'
import { Charm } from '../components/Charm'
import { DrawingReplay } from '../components/DrawingBoard'
import { Stamp } from '../components/Stamp'
import { Sticker } from '../components/Sticker'
import { Bouquet } from '../components/Bouquet'
import { Cassette } from '../components/Cassette'
import { Flower } from '../components/Flower'
import { GiftBoxArt, Petals } from '../components/GiftBoxArt'
import { TapePanel } from '../components/TapePanel'
import { api, type Gift, type Pick, type RecipientBox, type Session } from '../lib/api'
import { curatorToken } from '../lib/storage'

type Phase = 'closed' | 'untying' | 'room'

const EMPTY_SESSION: Session = { untied: false, seen: [], pick: null }

const PANEL_LABELS: Record<string, string> = {
  cards: 'Postcards',
  flowers: 'The bouquet',
  tape: 'Side A',
  photos: 'Photographs',
  drawing: 'Drawn by hand',
  ball: 'The magic 8-ball',
  letter: 'A letter',
}

export function Box() {
  const { id } = useParams<{ id: string }>()
  const [search] = useSearchParams()
  const preview = search.get('preview') === '1'

  const [box, setBox] = useState<RecipientBox | null>(null)
  const [secretGifts, setSecretGifts] = useState<Gift[]>([])
  const [session, setSession] = useState<Session>(EMPTY_SESSION)
  const [phase, setPhase] = useState<Phase>('closed')
  const [panel, setPanel] = useState<string | null>(null)
  const [card, setCard] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let live = true
    const load = async () => {
      if (preview) {
        // The curator owns this box, so the preview can show real gift names —
        // but it never touches the stored session, or her one shake would be spent.
        const full = await api.getFullBox(id, curatorToken())
        if (!live) return
        setSecretGifts(full.gifts.filter((g) => g.name))
        setBox({ ...full, gifts: full.gifts.filter((g) => g.name).map((g) => ({ hint: g.hint })) })
        setSession(EMPTY_SESSION)
        setPhase('closed')
        return
      }
      const [b, s] = await Promise.all([api.getBox(id), api.getSession(id)])
      if (!live) return
      setBox(b)
      setSession(s)
      setPhase(s.untied ? 'room' : 'closed')
    }
    load().catch((err) => live && setError(err instanceof Error ? err.message : 'Box not found.'))
    return () => {
      live = false
    }
  }, [id, preview])

  const cards = useMemo(
    () => (box?.cards ?? []).filter((c) => c.title || c.message),
    [box],
  )
  const tracks = useMemo(() => (box?.tape ?? []).filter((t) => t.title || t.url), [box])
  const photos = useMemo(() => (box?.photos ?? []).filter((p) => p.url || p.caption), [box])
  const drawings = useMemo(() => (box?.drawings ?? []).filter((d) => d.strokes.length), [box])
  const flowers = box?.flowers ?? []
  const gifts = box?.gifts ?? []

  const items = useMemo(() => {
    const present: string[] = []
    if (cards.length) present.push('cards')
    if (flowers.length) present.push('flowers')
    if (tracks.length) present.push('tape')
    if (photos.length) present.push('photos')
    if (drawings.length) present.push('drawing')
    if (gifts.length) present.push('ball')
    return present
  }, [cards.length, flowers.length, tracks.length, photos.length, drawings.length, gifts.length])

  const letterReady = items.every((k) => session.seen.includes(k))

  const openPanel = useCallback(
    (key: string) => {
      setPanel(key)
      if (session.seen.includes(key)) return
      const seen = [...session.seen, key]
      setSession((s) => ({ ...s, seen }))
      if (!preview && id) {
        api.patchSession(id, { seen }).then(setSession).catch(() => {})
      }
    },
    [id, preview, session.seen],
  )

  function untie() {
    setPhase('untying')
    if (!preview && id) {
      api.patchSession(id, { untied: true }).then(setSession).catch(() => {})
    }
    setTimeout(() => setPhase('room'), 2400)
  }

  async function shake() {
    if (preview) {
      const index = Math.floor(Math.random() * Math.max(1, secretGifts.length))
      const fake: Pick = {
        index,
        name: secretGifts[index]?.name ?? 'a mystery',
        code: 'PREVIEW',
        picked_at: '',
      }
      setSession((s) => ({ ...s, pick: fake }))
      return
    }
    if (!id) return
    setSession(await api.shake(id))
  }

  if (error) {
    return (
      <div className="stage">
        <div className="eyebrow">Nothing here</div>
        <h1 className="display stage__title">{error}</h1>
        <Link to="/" className="btn btn--ghost">
          Pack one of your own
        </Link>
      </div>
    )
  }

  if (!box) {
    return (
      <div className="stage">
        <div className="eyebrow">Untying the paper…</div>
      </div>
    )
  }

  const to = box.to || 'you'
  const sender = box.sender || 'me'
  const deliveryLine = `For ${to}, from ${sender}`

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {preview && (
        <div className="back-link">
          <Link to="/make" className="btn btn--ghost btn--small" style={{ borderBottom: 'none' }}>
            ← Back to packing
          </Link>
        </div>
      )}

      {phase === 'closed' && (
        <div className="stage fade">
          <div className="eyebrow">{deliveryLine}</div>
          <h1 className="display stage__title">Something arrived for you.</h1>
          <GiftBoxArt phase="closed" />
          <button className="btn pulse" onClick={untie}>
            Pull the ribbon
          </button>
        </div>
      )}

      {phase === 'untying' && (
        <div className="stage">
          <div style={{ position: 'relative' }}>
            <GiftBoxArt phase="untying" />
            <Petals />
          </div>
        </div>
      )}

      {phase === 'room' && (
        <div className="room">
          <div className="room__head">
            <div className="eyebrow">{deliveryLine}</div>
            <h1 className="display room__title">
              {box.age ? `Happy ${box.age}th, ${to}` : `Happy birthday, ${to}`}
            </h1>
            <div style={{ font: '400 15px/1.6 var(--sans)', color: 'oklch(0.45 0.02 60)' }}>
              Take them out one at a time.{' '}
              {session.seen.length
                ? `${session.seen.length} of ${items.length + 1} opened.`
                : 'Nothing has been unwrapped yet.'}
            </div>
          </div>

          <div className="tiles">
            {cards.length > 0 && (
              <Tile
                name="The postcards"
                meta={`${cards.length} ${cards.length === 1 ? 'card' : 'cards'} to read`}
                seen={session.seen.includes('cards')}
                onClick={() => openPanel('cards')}
              >
                <div style={{ position: 'relative', width: 180, height: 96 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: 14 + i * 13,
                        top: 16 - i * 6,
                        width: 140,
                        height: 90,
                        background: ['oklch(0.94 0.02 85)', 'oklch(0.97 0.014 85)', 'oklch(0.985 0.01 85)'][i],
                        border: `1px solid ${i === 2 ? 'oklch(0.84 0.03 20)' : 'oklch(0.86 0.02 85)'}`,
                        transform: `rotate(${[-7, 3, 0][i]}deg)`,
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: 10,
                        boxSizing: 'border-box',
                      }}
                    >
                      {i === 2 && (
                        <span
                          style={{
                            font: '400 11px/1 var(--mono)',
                            letterSpacing: '0.1em',
                            color: 'var(--accent)',
                          }}
                        >
                          POSTCARDS
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Tile>
            )}

            {flowers.length > 0 && (
              <Tile
                name="The bouquet"
                meta={`${flowers.length} stems, still fresh`}
                seen={session.seen.includes('flowers')}
                onClick={() => openPanel('flowers')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 96, overflow: 'hidden' }}>
                  {flowers.slice(0, 3).map((f, i) => (
                    <Flower key={i} name={f} scale={0.4} curve={i % 2 ? 6 : -6} />
                  ))}
                </div>
              </Tile>
            )}

            {tracks.length > 0 && (
              <Tile
                name="The mixtape"
                meta={`${tracks.length} songs${box.age ? ' — one for each year' : ''}`}
                seen={session.seen.includes('tape')}
                onClick={() => openPanel('tape')}
              >
                <Cassette width={178} styleId={box.tape_style} label="SIDE A" />
              </Tile>
            )}

            {photos.length > 0 && (
              <Tile
                name="The photographs"
                meta={`${photos.length} ${photos.length === 1 ? 'photograph' : 'photographs'}`}
                seen={session.seen.includes('photos')}
                onClick={() => openPanel('photos')}
              >
                <div style={{ position: 'relative', width: 180, height: 96 }}>
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: 20 + i * 72,
                        top: 8 + i * 4,
                        width: 78,
                        height: 84,
                        background: 'oklch(0.985 0.01 85)',
                        border: '1px solid oklch(0.86 0.02 85)',
                        transform: `rotate(${i ? 5 : -6}deg)`,
                        padding: '6px 6px 16px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: photos[i]?.url
                            ? `url("${photos[i].url}") center/cover`
                            : 'repeating-linear-gradient(45deg, oklch(0.9 0.02 85) 0 4px, oklch(0.94 0.015 85) 4px 8px)',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Tile>
            )}

            {drawings.length > 0 && (
              <Tile
                name={drawings.length === 1 ? 'The drawing' : 'The drawings'}
                meta={`${drawings.length} ${drawings.length === 1 ? 'thing' : 'things'} drawn for you`}
                seen={session.seen.includes('drawing')}
                onClick={() => openPanel('drawing')}
              >
                <div className="tile__doodle">
                  <DrawingReplay drawing={drawings[0]} animate={false} />
                </div>
              </Tile>
            )}

            {gifts.length > 0 && (
              <Tile
                name="Your gift, by fate"
                meta={session.pick ? 'Already decided' : `${gifts.length} possible futures`}
                seen={session.seen.includes('ball')}
                onClick={() => openPanel('ball')}
              >
                <div
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: '50%',
                    background: 'oklch(0.24 0.02 60)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow:
                      'inset -10px -12px 24px oklch(0.15 0.02 60), inset 8px 8px 18px oklch(0.4 0.02 60 / 0.6)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'var(--bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      font: "400 22px/1 var(--serif)",
                    }}
                  >
                    8
                  </div>
                </div>
              </Tile>
            )}

            {box.letter && (
              <Tile
                name="The letter"
                meta={letterReady ? 'Sealed, but you may open it' : 'Open everything else first'}
                seen={session.seen.includes('letter')}
                disabled={!letterReady}
                letter
                onClick={() => letterReady && openPanel('letter')}
              >
                <div
                  style={{
                    width: 150,
                    height: 92,
                    background: 'oklch(0.985 0.01 85)',
                    border: '1px solid oklch(0.86 0.02 85)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: '0 0 auto 0',
                      height: 46,
                      borderBottom: '1px solid oklch(0.88 0.02 85)',
                      background: 'oklch(0.96 0.014 85)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: 59,
                      top: 30,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      font: "400 13px/1 var(--serif)",
                      color: 'oklch(0.97 0.012 85)',
                    }}
                  >
                    {(sender[0] || 'x').toUpperCase()}
                  </div>
                </div>
              </Tile>
            )}
          </div>
        </div>
      )}

      {panel && (
        <div className="scrim" onClick={() => setPanel(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet__bar">
              <span className="eyebrow">{PANEL_LABELS[panel]}</span>
              <button className="btn btn--icon" onClick={() => setPanel(null)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="sheet__body">
              {panel === 'cards' && (
                <div className="center-stack">
                  {(() => {
                    const shown = cards[Math.min(card, cards.length - 1)]
                    const stickers = shown?.stickers ?? []
                    const charms = shown?.charms ?? []
                    return (
                      <div className="postcard-wrap" key={card}>
                        <div className="postcard">
                          {shown?.stamp && (
                            <span className="postcard__stamp">
                              <Stamp id={shown.stamp} width={62} />
                            </span>
                          )}
                          <div className="eyebrow eyebrow--accent">
                            Card {Math.min(card, cards.length - 1) + 1} of {cards.length}
                          </div>
                          <div className="serif" style={{ fontSize: 27, lineHeight: 1.25 }}>
                            {shown?.title}
                          </div>
                          <div className="postcard__body">{shown?.message}</div>

                          {stickers.map((sticker, i) => (
                            <span
                              key={sticker}
                              className={`postcard__sticker postcard__sticker--${
                                sticker === 'washi' ? 'washi' : i
                              }`}
                              aria-hidden
                            >
                              <Sticker id={sticker} size={sticker === 'washi' ? 34 : 58} />
                            </span>
                          ))}
                        </div>

                        {charms.length > 0 && (
                          <div className="charms">
                            {charms.map((charmId) => (
                              <Charm key={charmId} id={charmId} />
                            ))}
                          </div>
                        )}
                        {charms.length > 0 && <div className="note">Give one a flick.</div>}
                      </div>
                    )
                  })()}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn btn--ghost btn--small"
                      onClick={() => setCard((c) => (c - 1 + cards.length) % cards.length)}
                    >
                      ←
                    </button>
                    <button
                      className="btn btn--ghost btn--small"
                      onClick={() => setCard((c) => (c + 1) % cards.length)}
                    >
                      Next card →
                    </button>
                  </div>
                </div>
              )}

              {panel === 'flowers' && <Bouquet flowers={flowers} note={box.flower_note} />}

              {panel === 'tape' && (
                <TapePanel
                  tracks={tracks}
                  to={to}
                  age={box.age}
                  styleId={box.tape_style}
                  customLabel={box.tape_label}
                />
              )}

              {panel === 'photos' && (
                <div className="photos">
                  {photos.map((p, i) => (
                    <div className="polaroid" key={i}>
                      <div
                        className={p.url ? 'polaroid__frame' : 'polaroid__frame polaroid__frame--empty'}
                        style={p.url ? { backgroundImage: `url("${p.url}")` } : undefined}
                      >
                        {!p.url && (
                          <span
                            style={{
                              font: '400 10px/1.4 var(--mono)',
                              letterSpacing: '0.08em',
                              color: 'var(--muted)',
                              textAlign: 'center',
                              padding: 8,
                            }}
                          >
                            photo goes here
                          </span>
                        )}
                      </div>
                      <div className="polaroid__caption">{p.caption}</div>
                    </div>
                  ))}
                </div>
              )}

              {panel === 'drawing' && (
                <div className="center-stack">
                  {drawings.map((drawing, i) => (
                    <div className="doodle-frame" key={i}>
                      <DrawingReplay drawing={drawing} />
                      {drawing.caption && <div className="polaroid__caption">{drawing.caption}</div>}
                    </div>
                  ))}
                </div>
              )}

              {panel === 'ball' && (
                <BallPanel
                  teasers={gifts.map((g) => g.hint)}
                  pick={session.pick}
                  sender={sender}
                  boxId={id ?? ''}
                  preview={preview}
                  onShake={shake}
                />
              )}

              {panel === 'letter' && (
                <div className="letter">
                  <div className="eyebrow eyebrow--accent">Read last</div>
                  <div className="letter__text">{box.letter}</div>
                  <div className="letter__sign">— {sender}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Tile({
  name,
  meta,
  seen,
  disabled,
  letter,
  onClick,
  children,
}: {
  name: string
  meta: string
  seen: boolean
  disabled?: boolean
  letter?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      className={`tile${letter ? ' tile--letter' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      <div className="tile__art">
        {children}
        {seen && <span className="tile__seen">OPENED</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span className="tile__name">{name}</span>
        <span className="tile__meta">{meta}</span>
      </div>
    </button>
  )
}
