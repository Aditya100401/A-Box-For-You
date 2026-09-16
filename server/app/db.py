import os
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(os.environ.get("BOX_DB_PATH", Path(__file__).resolve().parent.parent / "boxes.db"))

SCHEMA = """
CREATE TABLE IF NOT EXISTS boxes (
    id            TEXT PRIMARY KEY,
    curator_token TEXT NOT NULL,
    content       TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS boxes_curator_idx ON boxes (curator_token, created_at DESC);

CREATE TABLE IF NOT EXISTS sessions (
    box_id     TEXT PRIMARY KEY REFERENCES boxes (id) ON DELETE CASCADE,
    untied     INTEGER NOT NULL DEFAULT 0,
    seen       TEXT NOT NULL DEFAULT '[]',
    pick_index INTEGER,
    pick_code  TEXT,
    picked_at  TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(DB_PATH, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with connect() as conn:
        conn.execute("PRAGMA journal_mode = WAL")
        conn.executescript(SCHEMA)
