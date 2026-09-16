export type Card = {
  title: string
  message: string
  stamp: string
  stickers: string[]
  charms: string[]
}
export type Track = { title: string; artist: string; url: string; why: string }
export type Photo = { url: string; caption: string }
export type Gift = { name: string; hint: string }
export type Stroke = { color: string; width: number; points: number[] }
export type Drawing = { caption: string; strokes: Stroke[] }

export type BoxContent = {
  to: string
  sender: string
  age: number
  flower_note: string
  cards: Card[]
  flowers: string[]
  tape: Track[]
  photos: Photo[]
  gifts: Gift[]
  drawings: Drawing[]
  letter: string
  tape_style: string
  tape_label: string
}

/** What the recipient's browser is allowed to know: teasers, never gift names. */
export type RecipientBox = Omit<BoxContent, 'gifts'> & { gifts: { hint: string }[] }

export type Pick = { index: number; name: string; code: string; picked_at: string }
export type Session = { untied: boolean; seen: string[]; pick: Pick | null }
export type CreatedBox = { id: string; curator_token: string }
export type BoxSummary = {
  id: string
  to: string
  created_at: string
  untied: boolean
  pick: Pick | null
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => null)
    throw new Error(detail?.detail ?? `Something went wrong (${res.status}).`)
  }
  return res.json() as Promise<T>
}

export const api = {
  createBox: (content: BoxContent, token?: string) =>
    call<CreatedBox>(token ? `/boxes?token=${encodeURIComponent(token)}` : '/boxes', {
      method: 'POST',
      body: JSON.stringify(content),
    }),

  updateBox: (id: string, token: string, content: BoxContent) =>
    call<CreatedBox>(`/boxes/${id}?token=${encodeURIComponent(token)}`, {
      method: 'PUT',
      body: JSON.stringify(content),
    }),

  getBox: (id: string) => call<RecipientBox>(`/boxes/${id}`),

  getFullBox: (id: string, token: string) =>
    call<BoxContent>(`/boxes/${id}/full?token=${encodeURIComponent(token)}`),

  getSession: (id: string) => call<Session>(`/boxes/${id}/session`),

  patchSession: (id: string, patch: { untied?: boolean; seen?: string[] }) =>
    call<Session>(`/boxes/${id}/session`, { method: 'PATCH', body: JSON.stringify(patch) }),

  shake: (id: string) => call<Session>(`/boxes/${id}/shake`, { method: 'POST' }),

  history: (token: string) =>
    call<BoxSummary[]>(`/curator/boxes?token=${encodeURIComponent(token)}`),

  decode: (code: string, token: string) =>
    call<{ box_id: string; to: string; gift: string }>(
      `/curator/decode?code=${encodeURIComponent(code)}&token=${encodeURIComponent(token)}`,
    ),
}

export function blankDrawing(): Drawing {
  return { caption: '', strokes: [] }
}

export function blankCard(): Card {
  return { title: '', message: '', stamp: '', stickers: [], charms: [] }
}

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

/**
 * A draft can be JSON written by an older build of this app, so every field is
 * re-checked rather than trusted — a missing array here becomes a crash on render.
 */
export function normalizeBox(raw: unknown): BoxContent {
  const box = (raw ?? {}) as Record<string, unknown>
  const list = (key: string): unknown[] => (Array.isArray(box[key]) ? (box[key] as unknown[]) : [])
  const cards = list('cards').map((entry) => {
    const card = (entry ?? {}) as Record<string, unknown>
    return {
      title: str(card.title),
      message: str(card.message),
      stamp: str(card.stamp),
      stickers: strList(card.stickers),
      charms: strList(card.charms),
    }
  })
  const tape = list('tape').map((entry) => {
    const track = (entry ?? {}) as Record<string, unknown>
    return {
      title: str(track.title),
      artist: str(track.artist),
      url: str(track.url),
      why: str(track.why),
    }
  })
  const photos = list('photos').map((entry) => {
    const photo = (entry ?? {}) as Record<string, unknown>
    return { url: str(photo.url), caption: str(photo.caption) }
  })
  const gifts = list('gifts').map((entry) => {
    const gift = (entry ?? {}) as Record<string, unknown>
    return { name: str(gift.name), hint: str(gift.hint) }
  })
  const drawings = list('drawings').map((entry) => {
    const drawing = (entry ?? {}) as Record<string, unknown>
    const strokes = Array.isArray(drawing.strokes) ? drawing.strokes : []
    return {
      caption: str(drawing.caption),
      strokes: strokes.flatMap((raw) => {
        const stroke = (raw ?? {}) as Record<string, unknown>
        const points = Array.isArray(stroke.points)
          ? stroke.points.filter((n): n is number => typeof n === 'number')
          : []
        if (points.length < 2) return []
        return [{
          color: str(stroke.color, '#000000'),
          width: typeof stroke.width === 'number' ? stroke.width : 4,
          points,
        }]
      }),
    }
  })

  return {
    to: str(box.to),
    sender: str(box.sender),
    age: typeof box.age === 'number' && box.age > 0 ? box.age : 27,
    flower_note: str(box.flower_note),
    cards: cards.length ? cards : [blankCard()],
    flowers: strList(box.flowers),
    tape,
    photos: photos.length ? photos : [{ url: '', caption: '' }],
    gifts: gifts.length ? gifts : [{ name: '', hint: '' }],
    drawings,
    letter: str(box.letter),
    tape_style: str(box.tape_style, 'classic'),
    tape_label: str(box.tape_label),
  }
}

export function emptyBox(): BoxContent {
  return {
    to: '',
    sender: '',
    age: 27,
    flower_note: '',
    cards: [blankCard()],
    flowers: ['Peony', 'Ranunculus', 'Eucalyptus'],
    tape: [],
    photos: [{ url: '', caption: '' }],
    gifts: [
      { name: '', hint: '' },
      { name: '', hint: '' },
      { name: '', hint: '' },
    ],
    drawings: [],
    letter: '',
    tape_style: 'classic',
    tape_label: '',
  }
}
