# A Box For You

Pack a little box for someone — postcards, a bouquet, a mixtape with one song for
every year, photographs, drawings, a sealed letter, and a magic 8-ball she shakes
to choose her own gift. Send it as a link. You find out what she picked.

## How it works

Two sides, one link.

**The curator** fills a box: postcards (each with a stamp, stickers and hanging
charms), a bouquet, a YouTube mixtape that auto-sizes to her age, photos, freehand
drawings, a gift list, and a letter. Publishing gives a short link to send.

**The recipient** pulls a ribbon, watches the lid lift, and unwraps the box one
item at a time. The letter stays sealed until everything else is open. She shakes
the 8-ball exactly once, and the result is locked forever.

Two things are deliberate:

- **Gift names never reach her browser.** The recipient endpoint returns only the
  teasers; the real names are revealed after fate decides.
- **Her progress lives on the server, not in her browser.** She can start on a
  laptop and finish on a phone and land exactly where she left off — and no amount
  of clearing storage or switching devices lets her re-roll the 8-ball.

## Running it

Two processes. The frontend proxies `/api` to the backend.

```bash
# backend — http://127.0.0.1:8000
cd server
uv sync
PYTHONPATH=. uv run uvicorn app.main:app --reload --port 8000

# frontend — http://localhost:5173
cd web
npm install
npm run dev
```

## Checks

```bash
cd server && uv run ruff check . && uv run pytest -q
cd web && npx tsc --noEmit && npm run build
```

CI runs all of the above on every push and pull request.

## Layout

```
server/         FastAPI + SQLite
  app/db.py       schema and connections
  app/main.py     routes: boxes, sessions, the shake, uploads, curator log
  app/schemas.py  the box and everything in it
  tests/          API behaviour, including the one-shake rule
web/            React + Vite
  src/routes/     Home, Curator, Box (recipient), Reveal, Log
  src/components/ the box, flowers, cassette, charms, stamps, drawing board
  src/lib/        api client, YouTube player, tape and charm catalogues
```

## Notes

- Photos are uploaded, shrunk in the browser first, and served back with
  `nosniff`. Only real PNG/JPEG/GIF/WebP bytes are accepted — never SVG, which
  can carry script.
- Drawings are stored as vector strokes, not images, so they stay crisp and
  replay themselves stroke by stroke when she opens them.
- The mixtape uses YouTube rather than Spotify, whose embeds only play
  thirty-second previews unless the listener is signed in. The tape reels turn
  only while the player reports real playback.
- There are no accounts. A curator is identified by a secret token held in their
  browser, which `/log` lets them copy to another device.
