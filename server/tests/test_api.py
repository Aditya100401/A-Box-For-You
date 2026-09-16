PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64


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


def test_the_clock_starts_when_the_ribbon_is_pulled(client):
    """A box packed days early must still be there on the morning it is opened."""
    box = make_box(client)
    assert client.get(f"/api/boxes/{box['id']}/session").json()["expires_at"] == ""

    opened = client.patch(f"/api/boxes/{box['id']}/session", json={"untied": True}).json()
    assert opened["expires_at"] != ""

    # Opening it again must not buy more time than she was promised.
    again = client.patch(f"/api/boxes/{box['id']}/session", json={"seen": ["cards"]}).json()
    assert again["expires_at"] == opened["expires_at"]


def test_downloading_takes_the_box_off_the_server(client, _stub_r2):
    box = make_box(client)
    upload = client.post("/api/uploads", files={"file": ("photo.png", PNG, "image/png")}).json()
    key = upload["url"].removeprefix("/api/uploads/")
    client.put(
        f"/api/boxes/{box['id']}",
        params={"token": box["curator_token"]},
        json={"to": "Maya", "photos": [{"url": upload["url"], "caption": "the lake"}]},
    )
    assert key in _stub_r2

    assert client.delete(f"/api/boxes/{box['id']}").status_code == 200
    assert client.get(f"/api/boxes/{box['id']}").status_code == 404
    assert client.get(f"/api/boxes/{box['id']}/session").status_code == 404
    assert key not in _stub_r2, "the photo should leave R2 with the box"


def test_the_drawn_gift_outlives_the_box_but_the_name_does_not(client):
    box = make_box(client)
    token = box["curator_token"]
    pick = client.post(f"/api/boxes/{box['id']}/shake").json()["pick"]

    client.delete(f"/api/boxes/{box['id']}")

    archive = client.get("/api/curator/archive", params={"token": token}).json()
    assert [a["gift"] for a in archive] == [pick["name"]]
    assert archive[0]["code"] == pick["code"]
    # Nothing about the recipient survives.
    assert "Maya" not in client.get("/api/curator/archive", params={"token": token}).text
    assert client.get("/api/curator/boxes", params={"token": token}).json() == []


def test_an_expired_box_is_swept_up_on_the_next_visit(client):
    from app.db import BOXES, connect

    box = make_box(client)
    client.patch(f"/api/boxes/{box['id']}/session", json={"untied": True})
    with connect() as conn:
        conn.execute(
            f"UPDATE {BOXES} SET expires_at = now() - interval '1 minute' WHERE id = %s",
            (box["id"],),
        )

    # Someone else's request is enough to sweep it; no scheduler involved.
    other = make_box(client)
    client.get(f"/api/boxes/{other['id']}")
    assert client.get(f"/api/boxes/{box['id']}").status_code == 404


def test_a_box_nobody_opens_is_kept_for_now(client):
    box = make_box(client)
    other = make_box(client)
    client.get(f"/api/boxes/{other['id']}")
    assert client.get(f"/api/boxes/{box['id']}").status_code == 200
