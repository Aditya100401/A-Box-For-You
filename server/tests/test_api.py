import os
import tempfile

import pytest

os.environ["BOX_DB_PATH"] = os.path.join(tempfile.mkdtemp(), "test.db")
os.environ["BOX_UPLOAD_DIR"] = tempfile.mkdtemp()

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def make_box(client, **overrides):
    body = {
        "to": "Maya",
        "sender": "Sam",
        "age": 2,
        "gifts": [
            {"name": "Ceramics class", "hint": "something you make"},
            {"name": "Espresso machine", "hint": "something loud"},
        ],
        "cards": [{"title": "Hi", "message": "there", "stickers": ["bow"], "charms": ["nazar"]}],
        "letter": "Dear Maya",
    }
    body.update(overrides)
    res = client.post("/api/boxes", json=body)
    assert res.status_code == 200
    return res.json()


def test_gift_names_never_reach_the_recipient(client):
    box = make_box(client)
    shown = client.get(f"/api/boxes/{box['id']}").json()
    assert shown["gifts"] == [{"hint": "something you make"}, {"hint": "something loud"}]
    assert "Espresso machine" not in client.get(f"/api/boxes/{box['id']}").text


def test_session_is_shared_across_devices(client):
    box = make_box(client)
    client.patch(f"/api/boxes/{box['id']}/session", json={"untied": True, "seen": ["cards"]})
    # a second device asks the server, not its own storage
    resumed = client.get(f"/api/boxes/{box['id']}/session").json()
    assert resumed["untied"] is True
    assert resumed["seen"] == ["cards"]


def test_seen_items_merge_rather_than_overwrite(client):
    box = make_box(client)
    client.patch(f"/api/boxes/{box['id']}/session", json={"seen": ["cards"]})
    merged = client.patch(f"/api/boxes/{box['id']}/session", json={"seen": ["tape"]}).json()
    assert merged["seen"] == ["cards", "tape"]


def test_the_ball_may_only_be_shaken_once(client):
    box = make_box(client)
    first = client.post(f"/api/boxes/{box['id']}/shake").json()["pick"]
    assert first["name"] in {"Ceramics class", "Espresso machine"}
    for _ in range(5):
        again = client.post(f"/api/boxes/{box['id']}/shake").json()["pick"]
        assert again == first


def test_shake_refuses_a_box_with_no_gifts(client):
    box = make_box(client, gifts=[])
    assert client.post(f"/api/boxes/{box['id']}/shake").status_code == 409


def test_curator_log_and_codeword(client):
    box = make_box(client)
    token = box["curator_token"]
    pick = client.post(f"/api/boxes/{box['id']}/shake").json()["pick"]

    log = client.get("/api/curator/boxes", params={"token": token}).json()
    assert [b["id"] for b in log] == [box["id"]]
    assert log[0]["pick"]["name"] == pick["name"]

    decoded = client.get(
        "/api/curator/decode", params={"code": pick["code"].lower(), "token": token}
    ).json()
    assert decoded["gift"] == pick["name"]
    assert (
        client.get("/api/curator/decode", params={"code": "9-NOPE", "token": token}).status_code
        == 404
    )


def test_curator_token_guards_the_full_box(client):
    box = make_box(client)
    assert client.get(f"/api/boxes/{box['id']}/full", params={"token": "wrong"}).status_code == 403
    ok = client.get(f"/api/boxes/{box['id']}/full", params={"token": box["curator_token"]})
    assert ok.json()["gifts"][0]["name"] == "Ceramics class"


def test_boxes_share_one_curator_token(client):
    token = "a" * 32
    make_box(client, to="One")
    client.post("/api/boxes", json={"to": "Two"}, params={"token": token})
    client.post("/api/boxes", json={"to": "Three"}, params={"token": token})
    log = client.get("/api/curator/boxes", params={"token": token}).json()
    assert {b["to"] for b in log} == {"Two", "Three"}


def test_short_curator_tokens_are_refused(client):
    assert client.post("/api/boxes", json={"to": "X"}, params={"token": "short"}).status_code == 400


def test_drawings_survive_the_round_trip(client):
    drawing = {
        "caption": "a cake",
        "strokes": [{"color": "#111", "width": 5, "points": [1, 2, 3, 4]}],
    }
    box = make_box(client, drawings=[drawing])
    assert client.get(f"/api/boxes/{box['id']}").json()["drawings"] == [drawing]


def test_upload_accepts_an_image_and_serves_it_back(client):
    res = client.post("/api/uploads", files={"file": ("photo.png", PNG, "image/png")})
    assert res.status_code == 200
    url = res.json()["url"]

    served = client.get(url)
    assert served.status_code == 200
    assert served.headers["content-type"] == "image/png"
    assert served.headers["x-content-type-options"] == "nosniff"


def test_upload_rejects_non_images_whatever_they_claim_to_be(client):
    html = b"<script>alert(1)</script>"
    assert (
        client.post("/api/uploads", files={"file": ("x.png", html, "image/png")}).status_code == 415
    )
    svg = b'<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>'
    assert (
        client.post("/api/uploads", files={"file": ("x.svg", svg, "image/svg+xml")}).status_code
        == 415
    )


def test_upload_rejects_oversized_files(client):
    huge = b"\x89PNG\r\n\x1a\n" + b"\x00" * (9 * 1024 * 1024)
    res = client.post("/api/uploads", files={"file": ("big.png", huge, "image/png")})
    assert res.status_code == 413


def test_upload_paths_cannot_escape_the_directory(client):
    for name in ["../boxes.db", "..%2fboxes.db", "nope.txt", "x.png"]:
        assert client.get(f"/api/uploads/{name}").status_code == 404


def test_missing_box_is_a_404(client):
    assert client.get("/api/boxes/nope").status_code == 404
