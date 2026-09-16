import os
import re
from collections.abc import Iterator
from contextlib import contextmanager

import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.environ.get("DATABASE_URL", "")

# Tests point this at a throwaway schema so they can never touch real boxes.
SCHEMA = os.environ.get("BOX_DB_SCHEMA", "public")
if not re.fullmatch(r"[A-Za-z0-9_]+", SCHEMA):
    raise RuntimeError(f"BOX_DB_SCHEMA must be a plain identifier, got {SCHEMA!r}")

# Table names are schema-qualified rather than reached through `search_path`.
# Neon's pooled endpoint hands one server connection to many clients, and a
# session-level SET outlives the client that ran it — so search_path set here
# would leak into somebody else's queries.
BOXES = f'"{SCHEMA}".boxes'
SESSIONS = f'"{SCHEMA}".sessions'
GIFT_LOG = f'"{SCHEMA}".gift_log'

SCHEMA_SQL = f"""
CREATE TABLE IF NOT EXISTS {BOXES} (
    id            TEXT PRIMARY KEY,
    curator_token TEXT NOT NULL,
    content       JSONB NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS boxes_curator_idx ON {BOXES} (curator_token, created_at DESC);

CREATE TABLE IF NOT EXISTS {SESSIONS} (
    box_id     TEXT PRIMARY KEY REFERENCES {BOXES} (id) ON DELETE CASCADE,
    untied     BOOLEAN NOT NULL DEFAULT false,
    seen       JSONB NOT NULL DEFAULT '[]'::jsonb,
    pick_index INTEGER,
    pick_code  TEXT,
    picked_at  TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The clock starts when the ribbon is pulled, not when the box is packed, so a
-- box can wait as long as it needs to for the right morning.
ALTER TABLE {BOXES} ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- All that outlives a box: what you promised to buy. No trace of who it was for.
CREATE TABLE IF NOT EXISTS {GIFT_LOG} (
    id            BIGSERIAL PRIMARY KEY,
    curator_token TEXT NOT NULL,
    gift          TEXT NOT NULL,
    code          TEXT NOT NULL,
    drawn_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gift_log_curator_idx ON {GIFT_LOG} (curator_token, drawn_at DESC);
"""


@contextmanager
def connect() -> Iterator[psycopg.Connection]:
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set — see server/.env.example")
    with psycopg.connect(DATABASE_URL, row_factory=dict_row, autocommit=True) as conn:
        yield conn


def init_db() -> None:
    with connect() as conn:
        conn.execute(f'CREATE SCHEMA IF NOT EXISTS "{SCHEMA}"')
        conn.execute(SCHEMA_SQL)


def iso(value) -> str:
    """Timestamps leave the API as plain ISO strings."""
    return value.isoformat() if value is not None else ""
