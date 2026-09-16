# A Box For You

Pack a little box for someone — postcards, a bouquet, a mixtape with one song for
every year, photographs, drawings, a sealed letter, and a magic 8-ball they shake
to choose their own gift. Send it as a link. You find out what they picked.

## How it works

Two sides, one link.

**The curator** fills a box: postcards (each with a stamp, stickers and hanging
charms), a bouquet, a YouTube mixtape that auto-sizes to their age, photos, freehand
drawings, a gift list, and a letter. Publishing gives a short link to send.

**The recipient** pulls a ribbon, watches the lid lift, and unwraps the box one
item at a time. The letter stays sealed until everything else is open. They shake
the 8-ball exactly once, and the result is locked forever.

Three things are deliberate:

- **Gift names never reach their browser.** The recipient endpoint returns only
  the teasers; the real names are revealed after fate decides.
- **Progress lives on the server, not in a browser.** They can start on a laptop
  and finish on a phone and land exactly where they left off — and no amount of
  clearing storage or switching devices lets them re-roll the 8-ball.
- **The box does not live on the server for long.** See below.

## The box is temporary on purpose

A box waits indefinitely to be opened, so it can be packed weeks before the
birthday. The moment the ribbon is pulled, a 24-hour clock starts.

Within those 24 hours the recipient can **download the box**: one self-contained
HTML file holding the postcards, the bouquet, the tape, the photographs, the
drawings and the letter, with every image inlined. It opens in any browser,
offline, forever. Saving it deletes the box and its photographs from the server,
so the link stops working everywhere.

If nobody saves it, the same deletion happens automatically at the 24-hour mark —
swept up lazily by the next request, so no scheduler is needed. A box that is
never opened at all is kept for 30 days and then removed.

The only thing that outlives a box is a single row in the curator's log: the
gift that was drawn and its codeword, so they can still go and buy it. The
recipient's name, messages, photographs and drawings are not kept.

## Running it

Two processes. The frontend proxies `/api` to the backend.

Copy `server/.env.example` to `server/.env` and fill in the Neon and R2
credentials first; the app reads that file automatically.

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

## Deploying

Both halves ship as one Vercel project using [Services](https://vercel.com/docs/services),
so they share a domain and there is no CORS to configure. `vercel.json` declares
them:

- `web/` — the Vite build, with an `index.html` fallback so client-side routes
  like `/b/abc123` resolve. Routing into a service is final on Vercel, so without
  that fallback every deep link 404s.
- `server/` — FastAPI, entered at `app.main:app`. Services receive the original
  request path, so the `/api/...` routes need no prefix rewriting.

Set these in the Vercel project's environment variables, for Production and
Preview both: `DATABASE_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `R2_BUCKET`. They are the same names as
`server/.env.example`.

Vercel's Git integration deploys `main` to production and every other branch to
a preview URL. GitHub Actions only runs the checks — the deploy credentials live
in Vercel, so there is one copy of each secret rather than two.

## Layout

```
server/         FastAPI + Postgres (Neon) + object storage (Cloudflare R2)
  app/db.py       schema, connections, table names
  app/main.py     routes: boxes, sessions, the shake, uploads, expiry, curator log
  app/schemas.py  the box and everything in it
  app/storage.py  image sniffing and the R2 bucket
  tests/          API behaviour, including the one-shake and expiry rules
web/            React + Vite
  src/routes/     Home, Curator, Box (recipient), Reveal, Log
  src/components/ the box, flowers, cassette, charms, stamps, drawing board
  src/lib/        api client, YouTube player, keepsake export, catalogues
```

## Notes

- Photos are uploaded, shrunk in the browser first, and served back with
  `nosniff`. Only real PNG/JPEG/GIF/WebP bytes are accepted — never SVG, which
  can carry script. They live in R2 and are deleted with their box.
- Table names are schema-qualified rather than reached through `search_path`.
  Neon's pooled endpoint shares one server connection between clients, so a
  session-level `SET` leaks into other people's queries.
- Drawings are stored as vector strokes, not images, so they stay crisp and
  replay themselves stroke by stroke when they are opened.
- The mixtape uses YouTube rather than Spotify, whose embeds only play
  thirty-second previews unless the listener is signed in. The tape reels turn
  only while the player reports real playback.
- There are no accounts. A curator is identified by a secret token held in their
  browser, which `/log` lets them copy to another device.
