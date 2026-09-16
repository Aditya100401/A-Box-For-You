import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Cassette } from '../components/Cassette'
import { FLOWER_NAMES, FlowerSwatch } from '../components/Flower'
import { Stamp } from '../components/Stamp'
import { Sticker } from '../components/Sticker'
import { DrawingBoard } from '../components/DrawingBoard'
import {
  api,
  blankCard,
  blankDrawing,
  emptyBox,
  type BoxContent,
  type Card,
  type Drawing,
  type Track,
} from '../lib/api'
import { uploadImage } from '../lib/upload'
import { CHARMS, STAMPS, STICKERS } from '../lib/embellishments'
import { TAPE_STYLES } from '../lib/tapeStyles'
import { curatorToken, loadDraft, saveDraft } from '../lib/storage'

const blankTrack: Track = { title: '', artist: '', url: '', why: '' }
const MAX_CHARMS = 3

function padTape(tape: Track[], n: number): Track[] {
  const out = tape.slice(0, n)
  while (out.length < n) out.push({ ...blankTrack })
  return out
}

export function Curator() {
  const navigate = useNavigate()
  const [content, setContent] = useState<BoxContent>(() => loadDraft() ?? emptyBox())
  const [boxId, setBoxId] = useState<string | null>(null)
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState<number | null>(null)

  useEffect(() => {
    saveDraft(content)
  }, [content])

  const age = Math.max(1, Math.min(100, content.age || 1))
  const tape = padTape(content.tape, age)
  const filled = tape.filter((t) => t.title || t.url).length

  function patch(next: Partial<BoxContent>) {
    setContent((c) => ({ ...c, ...next }))
    setLink('')
  }

  function setCard(i: number, next: Partial<Card>) {
    const cards = content.cards.slice()
    cards[i] = { ...cards[i], ...next }
    patch({ cards })
  }

  function toggleIn(list: string[], value: string, limit?: number): string[] {
    if (list.includes(value)) return list.filter((v) => v !== value)
    if (limit && list.length >= limit) return list
    return [...list, value]
  }

  function setTrack(i: number, next: Partial<Track>) {
    const copy = tape.slice()
    copy[i] = { ...copy[i], ...next }
    patch({ tape: copy })
  }

  async function publish(): Promise<string | null> {
    setBusy(true)
    setError('')
    try {
      const token = curatorToken()
      const saved = boxId
        ? await api.updateBox(boxId, token, content)
        : await api.createBox({ ...content, tape }, token)
      setBoxId(saved.id)
      return saved.id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the box.')
      return null
    } finally {
      setBusy(false)
    }
  }

  async function makeLink() {
    const id = await publish()
    if (id) setLink(`${location.origin}/b/${id}`)
  }

  async function preview() {
    const id = await publish()
    if (id) navigate(`/b/${id}?preview=1`)
  }

  function copyLink() {
    navigator.clipboard?.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const summary = `${content.to ? `For ${content.to}` : 'Unnamed box'} · ${
    content.cards.filter((c) => c.title || c.message).length
  } cards · ${filled} songs · ${content.gifts.filter((g) => g.name).length} gifts`

  return (
    <div className="fade">
      <div className="wrap wrap--narrow" style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 14,
            borderBottom: '1px solid oklch(0.86 0.02 85)',
            paddingBottom: 18,
          }}
        >
          <div>
            <div className="eyebrow">Curator — only you see this page</div>
            <h1 className="display" style={{ fontSize: 'clamp(30px, 5vw, 44px)', marginTop: 10 }}>
              Pack the box
            </h1>
          </div>
          <Link to="/" className="btn btn--ghost btn--small" style={{ borderBottom: 'none' }}>
            ← Home
          </Link>
        </div>

        <section className="panel">
          <div className="section-head">
            <span className="section-head__no">01</span>
            <span className="section-head__title">Who it's for</span>
          </div>
          <div className="grid-fields">
            <label className="field">
              <span>HER NAME</span>
              <input
                className="input"
                value={content.to}
                onChange={(e) => patch({ to: e.target.value })}
                placeholder="Maya"
              />
            </label>
            <label className="field">
              <span>FROM</span>
              <input
                className="input"
                value={content.sender}
                onChange={(e) => patch({ sender: e.target.value })}
                placeholder="Sam"
              />
            </label>
            <label className="field">
              <span>AGE SHE'S TURNING</span>
              <input
                className="input"
                type="number"
                min={1}
                max={100}
                value={content.age}
                onChange={(e) => {
                  const next = Math.max(1, Math.min(100, Number(e.target.value) || 1))
                  patch({ age: next, tape: padTape(content.tape, next) })
                }}
              />
            </label>
          </div>
          <div className="note">
            The mixtape below will hold one song for every year — {age} {age === 1 ? 'song' : 'songs'}.
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <span className="section-head__no">02</span>
            <span className="section-head__title">Postcards</span>
          </div>
          {content.cards.map((card, i) => (
            <div className="card-row" key={i}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  className="input"
                  style={{ flex: 1, minWidth: 0 }}
                  value={card.title}
                  onChange={(e) => setCard(i, { title: e.target.value })}
                  placeholder="Front of the card — e.g. Open when you miss me"
                />
                <button
                  className="btn btn--icon"
                  aria-label="Remove postcard"
                  onClick={() => {
                    const cards = content.cards.filter((_, j) => j !== i)
                    patch({ cards: cards.length ? cards : [blankCard()] })
                  }}
                >
                  ×
                </button>
              </div>
              <textarea
                className="input textarea"
                rows={3}
                value={card.message}
                onChange={(e) => setCard(i, { message: e.target.value })}
                placeholder="What the card says on the back…"
              />

              <div className="trim">
                <div className="trim__row">
                  <span className="eyebrow">Stamp</span>
                  <div className="trim__options">
                    {STAMPS.map((stamp) => (
                      <button
                        key={stamp.id}
                        className={card.stamp === stamp.id ? 'swatch swatch--on' : 'swatch'}
                        title={stamp.name}
                        onClick={() => setCard(i, { stamp: card.stamp === stamp.id ? '' : stamp.id })}
                      >
                        <Stamp id={stamp.id} width={26} cardBg="oklch(0.99 0.008 85)" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="trim__row">
                  <span className="eyebrow">Stickers</span>
                  <div className="trim__options">
                    {STICKERS.map((sticker) => (
                      <button
                        key={sticker.id}
                        className={card.stickers.includes(sticker.id) ? 'swatch swatch--on' : 'swatch'}
                        title={sticker.name}
                        onClick={() => setCard(i, { stickers: toggleIn(card.stickers, sticker.id) })}
                      >
                        <Sticker id={sticker.id} size={26} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="trim__row">
                  <span className="eyebrow">Charms · up to {MAX_CHARMS}</span>
                  <div className="trim__options trim__options--wrap">
                    {CHARMS.map((charm) => (
                      <button
                        key={charm.id}
                        className={card.charms.includes(charm.id) ? 'chip chip--on' : 'chip'}
                        title={`${charm.origin} — ${charm.meaning}`}
                        onClick={() => setCard(i, { charms: toggleIn(card.charms, charm.id, MAX_CHARMS) })}
                      >
                        {charm.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            className="btn btn--dashed"
            onClick={() => patch({ cards: [...content.cards, blankCard()] })}
          >
            + Another postcard
          </button>
        </section>

        <section className="panel">
          <div className="section-head">
            <span className="section-head__no">03</span>
            <span className="section-head__title">The bouquet</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {FLOWER_NAMES.map((name) => {
              const on = content.flowers.includes(name)
              return (
                <button
                  key={name}
                  className={on ? 'chip chip--on' : 'chip'}
                  onClick={() =>
                    patch({
                      flowers: on
                        ? content.flowers.filter((f) => f !== name)
                        : [...content.flowers, name],
                    })
                  }
                >
                  <FlowerSwatch name={name} />
                  {name}
                </button>
              )
            })}
          </div>
          <input
            className="input"
            value={content.flower_note}
            onChange={(e) => patch({ flower_note: e.target.value })}
            placeholder="The little card tucked in the stems…"
          />
        </section>

        <section className="panel">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div className="section-head">
              <span className="section-head__no">04</span>
              <span className="section-head__title">The mixtape</span>
            </div>
            <span
              style={{
                font: '400 12px/1 var(--mono)',
                letterSpacing: '0.1em',
                color: 'var(--muted)',
              }}
            >
              {filled} of {age} filled
            </span>
          </div>
          <div className="note">
            Paste a YouTube link into each slot — full songs, not thirty-second previews. Empty
            slots are simply left off the tape.
          </div>

          <div className="stack">
            <span className="eyebrow">Tape design</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {TAPE_STYLES.map((style) => (
                <button
                  key={style.id}
                  className={content.tape_style === style.id ? 'chip chip--on' : 'chip'}
                  onClick={() => patch({ tape_style: style.id })}
                >
                  <span className="chip__dot" style={{ background: style.accent }} />
                  {style.name}
                </button>
              ))}
            </div>
            <input
              className="input"
              value={content.tape_label}
              onChange={(e) => patch({ tape_label: e.target.value })}
              placeholder={`Label on the tape — defaults to SIDE A — FOR ${
                content.to.toUpperCase() || 'HER'
              }`}
            />
            <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 2px' }}>
              <Cassette
                width={220}
                styleId={content.tape_style}
                label={content.tape_label || `SIDE A — FOR ${content.to.toUpperCase() || 'HER'}`}
                subtitle={`${age} songs, ${age} years`}
              />
            </div>
          </div>
          {tape.map((track, i) => (
            <div className="tape-row" key={i}>
              <div className="tape-row__no">{String(i + 1).padStart(2, '0')}</div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <input
                    className="input"
                    style={{ flex: '1 1 140px' }}
                    value={track.title}
                    onChange={(e) => setTrack(i, { title: e.target.value })}
                    placeholder="Song"
                  />
                  <input
                    className="input"
                    style={{ flex: '1 1 120px' }}
                    value={track.artist}
                    onChange={(e) => setTrack(i, { artist: e.target.value })}
                    placeholder="Artist"
                  />
                </div>
                <input
                  className="input input--mono"
                  value={track.url}
                  onChange={(e) => setTrack(i, { url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=…"
                />
                <input
                  className="input"
                  value={track.why}
                  onChange={(e) => setTrack(i, { why: e.target.value })}
                  placeholder="Why this song is hers…"
                />
              </div>
            </div>
          ))}
        </section>

        <section className="panel">
          <div className="section-head">
            <span className="section-head__no">05</span>
            <span className="section-head__title">Photo memories</span>
          </div>
          <div className="note">
            Pick a picture off this device — JPEG, PNG, GIF or WebP, up to 8MB. Big ones are
            shrunk before they're sent.
          </div>
          {content.photos.map((photo, i) => (
            <div className="photo-row" key={i}>
              <label className="photo-drop">
                {photo.url ? (
                  <img className="photo-drop__img" src={photo.url} alt="" />
                ) : (
                  <span className="photo-drop__empty">
                    {uploading === i ? 'Uploading…' : '+ Choose a photo'}
                  </span>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (!file) return
                    setUploading(i)
                    setError('')
                    try {
                      const url = await uploadImage(file)
                      const photos = content.photos.slice()
                      photos[i] = { ...photos[i], url }
                      patch({ photos })
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Upload failed.')
                    } finally {
                      setUploading(null)
                    }
                  }}
                />
              </label>
              <div className="photo-row__side">
                <input
                  className="input"
                  value={photo.caption}
                  onChange={(e) => {
                    const photos = content.photos.slice()
                    photos[i] = { ...photos[i], caption: e.target.value }
                    patch({ photos })
                  }}
                  placeholder="Caption"
                />
                <div className="row">
                  {photo.url && (
                    <button
                      className="btn btn--ghost btn--small"
                      onClick={() => {
                        const photos = content.photos.slice()
                        photos[i] = { ...photos[i], url: '' }
                        patch({ photos })
                      }}
                    >
                      Replace
                    </button>
                  )}
                  <button
                    className="btn btn--ghost btn--small"
                    onClick={() => {
                      const photos = content.photos.filter((_, j) => j !== i)
                      patch({ photos: photos.length ? photos : [{ url: '', caption: '' }] })
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            className="btn btn--dashed"
            onClick={() => patch({ photos: [...content.photos, { url: '', caption: '' }] })}
          >
            + Another photo
          </button>
        </section>

        <section className="panel">
          <div className="section-head">
            <span className="section-head__no">06</span>
            <span className="section-head__title">Draw her something</span>
          </div>
          <div className="note">
            A blank page and nothing to live up to. Each drawing travels in the box on its own.
          </div>
          {content.drawings.map((drawing, i) => (
            <div className="stack" key={i}>
              <DrawingBoard
                drawing={drawing}
                onChange={(next: Drawing) => {
                  const drawings = content.drawings.slice()
                  drawings[i] = next
                  patch({ drawings })
                }}
              />
              <div className="row">
                <input
                  className="input"
                  style={{ flex: '1 1 200px' }}
                  value={drawing.caption}
                  onChange={(e) => {
                    const drawings = content.drawings.slice()
                    drawings[i] = { ...drawings[i], caption: e.target.value }
                    patch({ drawings })
                  }}
                  placeholder="What is it? (optional)"
                />
                <button
                  className="btn btn--ghost btn--small"
                  onClick={() => patch({ drawings: content.drawings.filter((_, j) => j !== i) })}
                >
                  Remove drawing
                </button>
              </div>
            </div>
          ))}
          {content.drawings.length < 6 && (
            <button
              className="btn btn--dashed"
              onClick={() => patch({ drawings: [...content.drawings, blankDrawing()] })}
            >
              {content.drawings.length ? '+ Another drawing' : '+ Start a drawing'}
            </button>
          )}
        </section>

        <section className="panel">
          <div className="section-head">
            <span className="section-head__no">07</span>
            <span className="section-head__title">The 8-ball gift list</span>
          </div>
          <div className="note">
            Every gift you'd happily buy. She shakes once, fate decides, and you get told which one.
            Only the teasers ever reach her browser.
          </div>
          {content.gifts.map((gift, i) => (
            <div className="row" key={i}>
              <span
                style={{
                  flex: 'none',
                  width: 26,
                  font: '700 13px/1 var(--mono)',
                  color: 'oklch(0.6 0.02 60)',
                }}
              >
                {i + 1}
              </span>
              <input
                className="input"
                style={{ flex: '1 1 200px' }}
                value={gift.name}
                onChange={(e) => {
                  const gifts = content.gifts.slice()
                  gifts[i] = { ...gifts[i], name: e.target.value }
                  patch({ gifts })
                }}
                placeholder="A gift — e.g. the ceramics class"
              />
              <input
                className="input"
                style={{ flex: '1 1 140px' }}
                value={gift.hint}
                onChange={(e) => {
                  const gifts = content.gifts.slice()
                  gifts[i] = { ...gifts[i], hint: e.target.value }
                  patch({ gifts })
                }}
                placeholder="Teaser she sees"
              />
              <button
                className="btn btn--icon"
                aria-label="Remove gift"
                onClick={() => {
                  const gifts = content.gifts.filter((_, j) => j !== i)
                  patch({ gifts: gifts.length ? gifts : [{ name: '', hint: '' }] })
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            className="btn btn--dashed"
            onClick={() => patch({ gifts: [...content.gifts, { name: '', hint: '' }] })}
          >
            + Another gift
          </button>
        </section>

        <section className="panel">
          <div className="section-head">
            <span className="section-head__no">08</span>
            <span className="section-head__title">The letter, read last</span>
          </div>
          <textarea
            className="input textarea textarea--letter"
            rows={8}
            value={content.letter}
            onChange={(e) => patch({ letter: e.target.value })}
            placeholder="Dear…"
          />
        </section>
      </div>

      <div className="dock">
        <div className="dock__inner">
          <div style={{ font: '400 12px/1.5 var(--sans)', color: 'oklch(0.5 0.02 60)' }}>
            {error ? <span className="error">{error}</span> : summary}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn--ghost btn--small" onClick={preview} disabled={busy}>
              Preview as her
            </button>
            <button className="btn btn--small" onClick={makeLink} disabled={busy}>
              {busy ? 'Saving…' : boxId ? 'Update her box' : 'Get her link'}
            </button>
          </div>
        </div>
        {link && (
          <div className="dock__link">
            <input className="input input--mono" style={{ flex: '1 1 240px' }} value={link} readOnly />
            <button
              className="btn btn--small"
              style={{ borderColor: 'var(--accent)', background: 'transparent', color: 'var(--accent)' }}
              onClick={copyLink}
            >
              {copied ? 'Copied ✓' : 'Copy link'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
