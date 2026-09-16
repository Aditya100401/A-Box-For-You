import os
import secrets

# `app` loads .env locally; CI sets DATABASE_URL directly. Either way the tests
# get a scratch schema, so they can never see or touch a real box.
TEST_SCHEMA = f"test_{secrets.token_hex(6)}"
os.environ["BOX_DB_SCHEMA"] = TEST_SCHEMA

import psycopg  # noqa: E402
import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import main  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _scratch_schema():
    yield
    with psycopg.connect(os.environ["DATABASE_URL"], autocommit=True) as conn:
        conn.execute(f'DROP SCHEMA IF EXISTS "{TEST_SCHEMA}" CASCADE')


@pytest.fixture(autouse=True)
def _stub_r2(monkeypatch):
    """Uploads go to a dict — the real bucket stays out of the test suite."""
    bucket: dict[str, bytes] = {}

    def forget(keys):
        for key in keys:
            bucket.pop(key, None)

    monkeypatch.setattr(main, "put_image", lambda key, data, ct: bucket.__setitem__(key, data))
    monkeypatch.setattr(main, "get_image", bucket.get)
    monkeypatch.setattr(main, "delete_images", forget)
    return bucket


@pytest.fixture
def client():
    with TestClient(main.app) as c:
        yield c
