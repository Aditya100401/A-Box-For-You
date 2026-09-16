import hashlib
import json
import os
import re
import secrets
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .db import BOXES, GIFT_LOG, SESSIONS, connect, init_db, iso
from .schemas import (
    BoxContent,
    BoxSummary,
    CreatedBox,
    DecodeResult,
    LoggedGift,
    Pick,
    RecipientBox,
    Session,
    SessionPatch,
    Upload,
)
from .storage import IMAGE_TYPES, delete_images, get_image, put_image, sniff_image

WORDS = [
    "tulip",
    "magnolia",
    "cedar",
    "lantern",
    "peony",
    "harbor",
    "willow",
    "ember",
    "sparrow",
    "clover",
    "juniper",
    "orchid",
    "meadow",
    "beacon",
    "poppy",
    "thistle",
    "anchor",
    "fern",
    "cricket",
    "aster",
    "linden",
    "sorrel",
    "bramble",
    "plover",
]

# How long a box survives after the ribbon is pulled, and the backstop for one
# that is packed and then never opened at all.
LIFESPAN_HOURS = 24
UNOPENED_DAYS = 30

MAX_UPLOAD_BYTES = 8 * 1024 * 1024
UPLOAD_KEY_RE = re.compile(r"^[A-Za-z0-9_-]{16,48}\.(png|jpg|gif|webp)$")
ALLOWED_ORIGINS = os.environ.get("BOX_ALLOWED_ORIGINS", "http://localhost:5173").split(",")


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="A Box For You", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)


def codeword(box_id: str, index: int) -> str:
    """A short, sayable codeword — unique per (box, gift), still `4-JUNIPER` shaped."""
    digest = hashlib.sha256(f"{box_id}:{index}".encode()).digest()
    return f"{index + 1}-{WORDS[digest[0] % len(WORDS)].upper()}"


def photo_keys(content: BoxContent) -> list[str]:
    prefix = "/api/uploads/"
    return [p.url[len(prefix) :] for p in content.photos if p.url.startswith(prefix)]


def forget_box(conn, box_id: str, curator_token: str, content: BoxContent) -> None:
    """
    Take the box off the server entirely. The drawn gift is copied to the
    curator's log first, because they still have to go and buy the thing —
    the name of the person it was for is not copied with it.
    """
    row = conn.execute(
        f"SELECT pick_index, pick_code FROM {SESSIONS} WHERE box_id = %s", (box_id,)
    ).fetchone()
    if row and row["pick_index"] is not None:
        gifts = [g for g in content.gifts if g.name]
        index = row["pick_index"]
        if index < len(gifts):
            conn.execute(
                f"INSERT INTO {GIFT_LOG} (curator_token, gift, code) VALUES (%s, %s, %s)",
                (curator_token, gifts[index].name, row["pick_code"] or ""),
            )
    conn.execute(f"DELETE FROM {BOXES} WHERE id = %s", (box_id,))
    delete_images(photo_keys(content))


def purge_expired(conn) -> int:
    """
    Lazy housekeeping: anything past its hour goes on the next request that
    happens by, so no scheduler is needed for this to be reliable.
    """
    rows = conn.execute(
        f"SELECT id, curator_token, content FROM {BOXES}"
        f" WHERE (expires_at IS NOT NULL AND expires_at < now())"
        f"    OR (expires_at IS NULL AND created_at < now() - interval '{UNOPENED_DAYS} days')"
        " LIMIT 50"
    ).fetchall()
    for row in rows:
        forget_box(conn, row["id"], row["curator_token"], BoxContent.model_validate(row["content"]))
    return len(rows)


def load_box(conn, box_id: str) -> tuple[str, BoxContent]:
    row = conn.execute(
        f"SELECT curator_token, content FROM {BOXES} WHERE id = %s", (box_id,)
    ).fetchone()
    if row is None:
        raise HTTPException(404, "No box lives at that link.")
    return row["curator_token"], BoxContent.model_validate(row["content"])


def require_curator(conn, box_id: str, token: str) -> BoxContent:
    curator_token, content = load_box(conn, box_id)
    if not secrets.compare_digest(curator_token, token):
        raise HTTPException(403, "That curator token doesn't open this box.")
    return content


def read_session(conn, box_id: str, content: BoxContent) -> Session:
    row = conn.execute(
        f"SELECT untied, seen, pick_index, pick_code, picked_at FROM {SESSIONS} WHERE box_id = %s",
        (box_id,),
    ).fetchone()
    if row is None:
        return Session()
    pick = None
    if row["pick_index"] is not None:
        gifts = [g for g in content.gifts if g.name]
        index = row["pick_index"]
        pick = Pick(
            index=index,
            name=gifts[index].name if index < len(gifts) else "",
            code=row["pick_code"] or "",
            picked_at=iso(row["picked_at"]),
        )
    expires = conn.execute(f"SELECT expires_at FROM {BOXES} WHERE id = %s", (box_id,)).fetchone()
    return Session(
        untied=row["untied"],
        seen=row["seen"],
        pick=pick,
        expires_at=iso(expires["expires_at"]) if expires else "",
    )


@app.get("/api/health")
def health() -> dict[str, bool]:
    with connect() as conn:
        conn.execute("SELECT 1")
    return {"ok": True}


@app.post("/api/boxes", response_model=CreatedBox)
def create_box(content: BoxContent, token: str | None = Query(None)) -> CreatedBox:
    """Curators reuse one token across boxes so `/api/curator/boxes` can list their log."""
    if token is not None and len(token) < 20:
        raise HTTPException(400, "Curator token is too short to be a secret.")
    box_id = secrets.token_urlsafe(9)
    curator_token = token or secrets.token_urlsafe(24)
    with connect() as conn:
        conn.execute(
            f"INSERT INTO {BOXES} (id, curator_token, content) VALUES (%s, %s, %s)",
            (box_id, curator_token, content.model_dump_json()),
        )
    return CreatedBox(id=box_id, curator_token=curator_token)


@app.put("/api/boxes/{box_id}", response_model=CreatedBox)
def update_box(box_id: str, content: BoxContent, token: str = Query(...)) -> CreatedBox:
    with connect() as conn:
        require_curator(conn, box_id, token)
        conn.execute(
            f"UPDATE {BOXES} SET content = %s, updated_at = now() WHERE id = %s",
            (content.model_dump_json(), box_id),
        )
    return CreatedBox(id=box_id, curator_token=token)


@app.get("/api/boxes/{box_id}", response_model=RecipientBox)
def get_box_for_recipient(box_id: str) -> RecipientBox:
    """Gift names never travel to their browser — only the teasers they're meant to see."""
    with connect() as conn:
        purge_expired(conn)
        _, content = load_box(conn, box_id)
    data = content.model_dump()
    data["gifts"] = [{"hint": g.hint} for g in content.gifts if g.name]
    return RecipientBox.model_validate(data)


@app.get("/api/boxes/{box_id}/full", response_model=BoxContent)
def get_box_for_curator(box_id: str, token: str = Query(...)) -> BoxContent:
    with connect() as conn:
        return require_curator(conn, box_id, token)


@app.get("/api/boxes/{box_id}/session", response_model=Session)
def get_session(box_id: str) -> Session:
    with connect() as conn:
        _, content = load_box(conn, box_id)
        return read_session(conn, box_id, content)


@app.patch("/api/boxes/{box_id}/session", response_model=Session)
def patch_session(box_id: str, patch: SessionPatch) -> Session:
    """Progress is stored against the box, so any device it is opened on resumes here."""
    with connect() as conn:
        _, content = load_box(conn, box_id)
        conn.execute(
            f"INSERT INTO {SESSIONS} (box_id) VALUES (%s) ON CONFLICT DO NOTHING", (box_id,)
        )
        with conn.transaction():
            # Lock the row so two devices reporting progress can't clobber each other.
            current = conn.execute(
                f"SELECT seen FROM {SESSIONS} WHERE box_id = %s FOR UPDATE", (box_id,)
            ).fetchone()
            if patch.untied:
                conn.execute(
                    f"UPDATE {SESSIONS} SET untied = true, updated_at = now() WHERE box_id = %s",
                    (box_id,),
                )
                # First pull of the ribbon starts the countdown; later ones don't
                # extend it, so the deadline they were shown is the real one.
                conn.execute(
                    f"UPDATE {BOXES}"
                    f"   SET expires_at = now() + interval '{LIFESPAN_HOURS} hours'"
                    " WHERE id = %s AND expires_at IS NULL",
                    (box_id,),
                )
            if patch.seen is not None:
                seen = current["seen"]
                merged = seen + [k for k in patch.seen if k not in seen]
                conn.execute(
                    f"UPDATE {SESSIONS} SET seen = %s, updated_at = now() WHERE box_id = %s",
                    (json.dumps(merged), box_id),
                )
        return read_session(conn, box_id, content)


@app.post("/api/boxes/{box_id}/shake", response_model=Session)
def shake(box_id: str) -> Session:
    """One shake per box, ever — locked server-side so no amount of reopening re-rolls it."""
    with connect() as conn:
        _, content = load_box(conn, box_id)
        gifts = [g for g in content.gifts if g.name]
        if not gifts:
            raise HTTPException(409, "This box has no gifts to draw from.")

        conn.execute(
            f"INSERT INTO {SESSIONS} (box_id) VALUES (%s) ON CONFLICT DO NOTHING", (box_id,)
        )
        index = secrets.randbelow(len(gifts))
        # Only the first shake matches `pick_index IS NULL`; every later one updates
        # no rows and falls through to whatever fate already decided.
        conn.execute(
            f"UPDATE {SESSIONS}"
            "   SET pick_index = %s, pick_code = %s, picked_at = now(), updated_at = now()"
            " WHERE box_id = %s AND pick_index IS NULL",
            (index, codeword(box_id, index), box_id),
        )
        return read_session(conn, box_id, content)


@app.post("/api/uploads", response_model=Upload)
async def upload_image(file: UploadFile) -> Upload:
    """Accepts a real image file, so nobody has to paste a URL."""
    data = b""
    while chunk := await file.read(64 * 1024):
        data += chunk
        if len(data) > MAX_UPLOAD_BYTES:
            raise HTTPException(413, "That image is larger than 8MB.")
    if not data:
        raise HTTPException(400, "That file was empty.")

    kind = sniff_image(data[:16])
    if kind is None:
        raise HTTPException(415, "That doesn't look like a PNG, JPEG, GIF or WebP.")

    key = f"{secrets.token_urlsafe(18).replace('-', '_')}.{kind}"
    put_image(key, data, IMAGE_TYPES[kind])
    return Upload(url=f"/api/uploads/{key}")


@app.get("/api/uploads/{key}")
def serve_upload(key: str) -> Response:
    if not UPLOAD_KEY_RE.match(key):
        raise HTTPException(404, "No such image.")
    data = get_image(key)
    if data is None:
        raise HTTPException(404, "No such image.")
    return Response(
        content=data,
        media_type=IMAGE_TYPES[key.rsplit(".", 1)[1]],
        headers={
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; sandbox",
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    )


@app.delete("/api/boxes/{box_id}")
def forget(box_id: str) -> dict[str, bool]:
    """
    Called once the recipient has the box saved on their own machine. Whoever
    holds the link may end it — the link is the key to the box either way.
    """
    with connect() as conn:
        curator_token, content = load_box(conn, box_id)
        forget_box(conn, box_id, curator_token, content)
    return {"forgotten": True}


@app.get("/api/curator/archive", response_model=list[LoggedGift])
def curator_archive(token: str = Query(...)) -> list[LoggedGift]:
    with connect() as conn:
        rows = conn.execute(
            f"SELECT gift, code, drawn_at FROM {GIFT_LOG} WHERE curator_token = %s"
            " ORDER BY drawn_at DESC",
            (token,),
        ).fetchall()
    return [LoggedGift(gift=r["gift"], code=r["code"], drawn_at=iso(r["drawn_at"])) for r in rows]


@app.get("/api/curator/boxes", response_model=list[BoxSummary])
def list_curator_boxes(token: str = Query(...)) -> list[BoxSummary]:
    with connect() as conn:
        rows = conn.execute(
            f"SELECT id, content, created_at FROM {BOXES} WHERE curator_token = %s"
            " ORDER BY created_at DESC",
            (token,),
        ).fetchall()
        summaries = []
        for row in rows:
            content = BoxContent.model_validate(row["content"])
            session = read_session(conn, row["id"], content)
            summaries.append(
                BoxSummary(
                    id=row["id"],
                    to=content.to,
                    created_at=iso(row["created_at"]),
                    untied=session.untied,
                    pick=session.pick,
                )
            )
    return summaries


@app.get("/api/curator/decode", response_model=DecodeResult)
def decode(code: str = Query(...), token: str = Query(...)) -> DecodeResult:
    wanted = code.strip().upper()
    for summary in list_curator_boxes(token):
        if summary.pick and summary.pick.code == wanted:
            return DecodeResult(box_id=summary.id, to=summary.to, gift=summary.pick.name)
    raise HTTPException(404, "That codeword doesn't match any box you've packed.")
