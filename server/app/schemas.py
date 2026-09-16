from pydantic import BaseModel, Field


class Card(BaseModel):
    title: str = ""
    message: str = ""
    stamp: str = ""
    stickers: list[str] = Field(default_factory=list)
    charms: list[str] = Field(default_factory=list)


class Track(BaseModel):
    title: str = ""
    artist: str = ""
    url: str = ""
    why: str = ""


class Photo(BaseModel):
    url: str = ""
    caption: str = ""


class Gift(BaseModel):
    name: str = ""
    hint: str = ""


class Stroke(BaseModel):
    color: str = "#000000"
    width: float = 4
    # Flattened [x, y, x, y, …] in the board's own 1000×700 space.
    points: list[float] = Field(default_factory=list, max_length=4000)


class Drawing(BaseModel):
    caption: str = ""
    strokes: list[Stroke] = Field(default_factory=list, max_length=400)


class BoxContent(BaseModel):
    to: str = ""
    sender: str = ""
    age: int = 0
    flower_note: str = ""
    cards: list[Card] = Field(default_factory=list)
    flowers: list[str] = Field(default_factory=list)
    tape: list[Track] = Field(default_factory=list)
    photos: list[Photo] = Field(default_factory=list)
    gifts: list[Gift] = Field(default_factory=list)
    drawings: list[Drawing] = Field(default_factory=list, max_length=6)
    letter: str = ""
    tape_style: str = "classic"
    tape_label: str = ""


class TeasedGift(BaseModel):
    """What the recipient is allowed to see before fate decides."""

    hint: str = ""


class RecipientBox(BaseModel):
    """The box as the recipient sees it — gift names withheld, only teasers."""

    to: str = ""
    sender: str = ""
    age: int = 0
    flower_note: str = ""
    cards: list[Card] = Field(default_factory=list)
    flowers: list[str] = Field(default_factory=list)
    tape: list[Track] = Field(default_factory=list)
    photos: list[Photo] = Field(default_factory=list)
    gifts: list[TeasedGift] = Field(default_factory=list)
    drawings: list[Drawing] = Field(default_factory=list)
    letter: str = ""
    tape_style: str = "classic"
    tape_label: str = ""


class Pick(BaseModel):
    index: int
    name: str
    code: str
    picked_at: str


class Session(BaseModel):
    untied: bool = False
    seen: list[str] = Field(default_factory=list)
    pick: Pick | None = None
    # Empty until the ribbon is pulled; after that, when the box leaves the server.
    expires_at: str = ""


class SessionPatch(BaseModel):
    untied: bool | None = None
    seen: list[str] | None = None


class Upload(BaseModel):
    url: str


class CreatedBox(BaseModel):
    id: str
    curator_token: str


class BoxSummary(BaseModel):
    id: str
    to: str
    created_at: str
    untied: bool
    pick: Pick | None = None


class LoggedGift(BaseModel):
    """What survives a deleted box: the promise you made, not who you made it to."""

    gift: str
    code: str
    drawn_at: str


class DecodeResult(BaseModel):
    box_id: str
    to: str
    gift: str
