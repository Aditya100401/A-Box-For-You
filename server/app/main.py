import hashlib
import json
import os
import re
import secrets
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .db import connect, init_db
from .schemas import (
    BoxContent,
    BoxSummary,
    CreatedBox,
    DecodeResult,
    Pick,
    RecipientBox,
    Session,
    SessionPatch,
    Upload,
)

_DEFAULT_UPLOADS = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR = Path(os.environ.get("BOX_UPLOAD_DIR", _DEFAULT_UPLOADS))
MAX_UPLOAD_BYTES = 8 * 1024 * 1024
UPLOAD_NAME_RE = re.compile(r"^[A-Za-z0-9_-]{16,48}\.(png|jpg|gif|webp)$")

# Extension and content type come from sniffing the bytes, never from what the
# client claims. SVG is deliberately absent: it can carry script.
IMAGE_TYPES = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "gif": "image/gif",
    "webp": "image/webp",
}


def sniff_image(head: bytes) -> str | None:
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if head.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if head.startswith((b"GIF87a", b"GIF89a")):
        return "gif"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp"
    return None


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

ALLOWED_ORIGINS = os.environ.get("BOX_ALLOWED_ORIGINS", "http://localhost:5173").split(",")


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
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


def load_box(box_id: str) -> tuple[str, BoxContent]:
    with connect() as conn:
        row = conn.execute(
            "SELECT curator_token, content FROM boxes WHERE id = ?", (box_id,)
        ).fetchone()
    if row is None:
        raise HTTPException(404, "No box lives at that link.")
    return row["curator_token"], BoxContent.model_validate_json(row["content"])


def require_curator(box_id: str, token: str) -> BoxContent:
    curator_token, content = load_box(box_id)
    if not secrets.compare_digest(curator_token, token):
        raise HTTPException(403, "That curator token doesn't open this box.")
    return content


def read_session(conn, box_id: str, content: BoxContent) -> Session:
    row = conn.execute(
        "SELECT untied, seen, pick_index, pick_code, picked_at FROM sessions WHERE box_id = ?",
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
            code=row["pick_code"],
            picked_at=row["picked_at"],
        )
    return Session(untied=bool(row["untied"]), seen=json.loads(row["seen"]), pick=pick)


@app.post("/api/boxes", response_model=CreatedBox)
def create_box(content: BoxContent, token: str | None = Query(None)) -> CreatedBox:
    """Curators reuse one token across boxes so `/api/curator/boxes` can list their log."""
    if token is not None and len(token) < 20:
        raise HTTPException(400, "Curator token is too short to be a secret.")
    box_id = secrets.token_urlsafe(9)
    curator_token = token or secrets.token_urlsafe(24)
    with connect() as conn:
        conn.execute(
            "INSERT INTO boxes (id, curator_token, content) VALUES (?, ?, ?)",
            (box_id, curator_token, content.model_dump_json()),
        )
    return CreatedBox(id=box_id, curator_token=curator_token)


@app.put("/api/boxes/{box_id}", response_model=CreatedBox)
def update_box(box_id: str, content: BoxContent, token: str = Query(...)) -> CreatedBox:
    require_curator(box_id, token)
    with connect() as conn:
        conn.execute(
            "UPDATE boxes SET content = ?, updated_at = datetime('now') WHERE id = ?",
            (content.model_dump_json(), box_id),
        )
    return CreatedBox(id=box_id, curator_token=token)


@app.get("/api/boxes/{box_id}", response_model=RecipientBox)
def get_box_for_recipient(box_id: str) -> RecipientBox:
    """Gift names never travel to her browser — only the teasers she's meant to see."""
    _, content = load_box(box_id)
    data = content.model_dump()
    data["gifts"] = [{"hint": g.hint} for g in content.gifts if g.name]
    return RecipientBox.model_validate(data)


@app.get("/api/boxes/{box_id}/full", response_model=BoxContent)
def get_box_for_curator(box_id: str, token: str = Query(...)) -> BoxContent:
    return require_curator(box_id, token)


@app.get("/api/boxes/{box_id}/session", response_model=Session)
def get_session(box_id: str) -> Session:
    _, content = load_box(box_id)
    with connect() as conn:
        return read_session(conn, box_id, content)


@app.patch("/api/boxes/{box_id}/session", response_model=Session)
def patch_session(box_id: str, patch: SessionPatch) -> Session:
    """Progress is stored against the box, so any device she opens it on resumes here."""
    _, content = load_box(box_id)
    with connect() as conn:
        conn.execute("INSERT OR IGNORE INTO sessions (box_id) VALUES (?)", (box_id,))
        if patch.untied is not None:
            conn.execute(
                "UPDATE sessions SET untied = untied | ?, updated_at = datetime('now')"
                " WHERE box_id = ?",
                (int(patch.untied), box_id),
            )
        if patch.seen is not None:
            current = json.loads(
                conn.execute("SELECT seen FROM sessions WHERE box_id = ?", (box_id,)).fetchone()[0]
            )
            merged = current + [k for k in patch.seen if k not in current]
            conn.execute(
                "UPDATE sessions SET seen = ?, updated_at = datetime('now') WHERE box_id = ?",
                (json.dumps(merged), box_id),
            )
        return read_session(conn, box_id, content)


@app.post("/api/boxes/{box_id}/shake", response_model=Session)
def shake(box_id: str) -> Session:
    """One shake per box, ever — locked server-side so no amount of reopening re-rolls it."""
    _, content = load_box(box_id)
    gifts = [g for g in content.gifts if g.name]
    if not gifts:
        raise HTTPException(409, "This box has no gifts to draw from.")
    with connect() as conn:
        conn.execute("BEGIN IMMEDIATE")
        try:
            conn.execute("INSERT OR IGNORE INTO sessions (box_id) VALUES (?)", (box_id,))
            row = conn.execute(
                "SELECT pick_index FROM sessions WHERE box_id = ?", (box_id,)
            ).fetchone()
            if row["pick_index"] is None:
                index = secrets.randbelow(len(gifts))
                conn.execute(
                    "UPDATE sessions SET pick_index = ?, pick_code = ?,"
                    " picked_at = datetime('now'), updated_at = datetime('now')"
                    " WHERE box_id = ?",
                    (index, codeword(box_id, index), box_id),
                )
            conn.execute("COMMIT")
        except Exception:
            conn.execute("ROLLBACK")
            raise
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

    name = f"{secrets.token_urlsafe(18).replace('-', '_')}.{kind}"
    (UPLOAD_DIR / name).write_bytes(data)
    return Upload(url=f"/api/uploads/{name}")


@app.get("/api/uploads/{name}")
def serve_upload(name: str) -> FileResponse:
    if not UPLOAD_NAME_RE.match(name):
        raise HTTPException(404, "No such image.")
    path = (UPLOAD_DIR / name).resolve()
    if path.parent != UPLOAD_DIR.resolve() or not path.is_file():
        raise HTTPException(404, "No such image.")
    return FileResponse(
        path,
        media_type=IMAGE_TYPES[name.rsplit(".", 1)[1]],
        headers={
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; sandbox",
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    )


@app.get("/api/curator/boxes", response_model=list[BoxSummary])
def list_curator_boxes(token: str = Query(...)) -> list[BoxSummary]:
    with connect() as conn:
        rows = conn.execute(
            "SELECT id, content, created_at FROM boxes WHERE curator_token = ?"
            " ORDER BY created_at DESC",
            (token,),
        ).fetchall()
        summaries = []
        for row in rows:
            content = BoxContent.model_validate_json(row["content"])
            session = read_session(conn, row["id"], content)
            summaries.append(
                BoxSummary(
                    id=row["id"],
                    to=content.to,
                    created_at=row["created_at"],
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
