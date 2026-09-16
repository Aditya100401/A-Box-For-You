import { renderToStaticMarkup } from 'react-dom/server'
import { Bouquet } from '../components/Bouquet'
import { Cassette } from '../components/Cassette'
import { Charm } from '../components/Charm'
import { DrawingReplay } from '../components/DrawingBoard'
import { Stamp } from '../components/Stamp'
import { Sticker } from '../components/Sticker'
import type { Pick, RecipientBox } from './api'
import { ordinal } from './ordinal'

/** Photos have to travel inside the file, so each one becomes a data URI. */
async function inlinePhotos(box: RecipientBox): Promise<RecipientBox> {
  const photos = await Promise.all(
    box.photos.map(async (photo) => {
      if (!photo.url) return photo
      try {
        const blob = await (await fetch(photo.url)).blob()
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
        return { ...photo, url: data }
      } catch {
        return { ...photo, url: '' }
      }
    }),
  )
  return { ...box, photos }
}

/** Lift the live stylesheet out of the page so the saved file looks the same. */
function collectCss(): string {
  let css = ''
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) css += rule.cssText + '\n'
    } catch {
      // A cross-origin sheet (the web fonts) can't be read; the <link> covers it.
    }
  }
  return css
}

function Keepsake({ box, pick }: { box: RecipientBox; pick: Pick | null }) {
  const cards = box.cards.filter((c) => c.title || c.message)
  const tracks = box.tape.filter((t) => t.title || t.url)
  const photos = box.photos.filter((p) => p.url || p.caption)
  const drawings = box.drawings.filter((d) => d.strokes.length)
  const to = box.to || 'you'
  const sender = box.sender || 'me'

  return (
    <div className="room">
      <div className="room__head">
        <div className="eyebrow">
          For {to}, from {sender}
        </div>
        <h1 className="display room__title">
          {box.age ? `Happy ${ordinal(box.age)}, ${to}` : `Happy birthday, ${to}`}
        </h1>
        <div className="note">Yours to keep. Nothing here needs the internet.</div>
      </div>

      {cards.map((card, i) => (
        <section className="keep__section" key={i}>
          <div className="postcard-wrap">
            <div className="postcard">
              {card.stamp && (
                <span className="postcard__stamp">
                  <Stamp id={card.stamp} width={62} />
                </span>
              )}
              <div className="eyebrow eyebrow--accent">
                Card {i + 1} of {cards.length}
              </div>
              <div className="serif" style={{ fontSize: 27, lineHeight: 1.25 }}>
                {card.title}
              </div>
              <div className="postcard__body">{card.message}</div>
              {card.stickers.map((sticker, j) => (
                <span
                  key={sticker}
                  className={`postcard__sticker postcard__sticker--${
                    sticker === 'washi' ? 'washi' : j
                  }`}
                >
                  <Sticker id={sticker} size={sticker === 'washi' ? 34 : 58} />
                </span>
              ))}
            </div>
            {card.charms.length > 0 && (
              <div className="charms">
                {card.charms.map((charm) => (
                  <Charm key={charm} id={charm} />
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      {box.flowers.length > 0 && (
        <section className="keep__section">
          <Bouquet flowers={box.flowers} note={box.flower_note} />
        </section>
      )}

      {tracks.length > 0 && (
        <section className="keep__section">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <Cassette
              styleId={box.tape_style}
              label={box.tape_label || `SIDE A — FOR ${to.toUpperCase()}`}
              subtitle={box.age ? `${box.age} songs, ${box.age} years` : `${tracks.length} songs`}
            />
          </div>
          <div className="tracklist">
            {tracks.map((track, i) => (
              <a
                className="track"
                key={i}
                href={track.url || undefined}
                target="_blank"
                rel="noreferrer"
                style={{ borderBottom: '1px solid var(--line-soft)' }}
              >
                <span className="track__no">{String(i + 1).padStart(2, '0')}</span>
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span className="track__title">{track.title || 'Untitled'}</span>
                  <span className="track__artist">{track.artist}</span>
                  {track.why && <span className="why keep__why">{track.why}</span>}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {photos.length > 0 && (
        <section className="keep__section">
          <div className="photos">
            {photos.map((photo, i) => (
              <div className="polaroid" key={i}>
                <div
                  className={photo.url ? 'polaroid__frame' : 'polaroid__frame polaroid__frame--empty'}
                  style={photo.url ? { backgroundImage: `url("${photo.url}")` } : undefined}
                />
                <div className="polaroid__caption">{photo.caption}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {drawings.map((drawing, i) => (
        <section className="keep__section" key={i}>
          <div className="doodle-frame">
            <DrawingReplay drawing={drawing} animate={false} />
            {drawing.caption && <div className="polaroid__caption">{drawing.caption}</div>}
          </div>
        </section>
      ))}

      {box.letter && (
        <section className="keep__section">
          <div className="letter">
            <div className="eyebrow eyebrow--accent">Read last</div>
            <div className="letter__text">{box.letter}</div>
            <div className="letter__sign">— {sender}</div>
          </div>
        </section>
      )}

      {pick && (
        <section className="keep__section" style={{ textAlign: 'center' }}>
          <div className="eyebrow">The ball had spoken</div>
          <div className="serif" style={{ fontSize: 26, marginTop: 10 }}>
            {pick.name}
          </div>
        </section>
      )}
    </div>
  )
}

const EXTRA_CSS = `
  body { padding: 0 0 80px; }
  .keep__section { max-width: 720px; margin: 0 auto 56px; }
  .keep__why { font-size: 15px; margin-top: 8px; border-left-width: 2px; }
  .track { text-decoration: none; border-bottom: 1px solid var(--line-soft); }
  .charm { cursor: default; }
  .keep__footer { text-align: center; font: 400 12px/1.6 var(--sans); color: var(--muted); }
`

export async function buildKeepsake(box: RecipientBox, pick: Pick | null): Promise<Blob> {
  const withPhotos = await inlinePhotos(box)
  const body = renderToStaticMarkup(<Keepsake box={withPhotos} pick={pick} />)
  const name = withPhotos.to || 'you'

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>A box for ${name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Karla:wght@400;500;600&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet">
<style>${collectCss()}${EXTRA_CSS}</style>
</head>
<body>
${body}
<div class="keep__footer">Saved from A Box For You. This copy is yours alone — nothing here talks to a server.</div>
</body>
</html>`

  return new Blob([html], { type: 'text/html;charset=utf-8' })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
