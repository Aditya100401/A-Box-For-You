import { normalizeBox, type BoxContent } from './api'

const TOKEN_KEY = 'giftbox.curator'
const DRAFT_KEY = 'giftbox.draft'

function randomToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * The curator's identity is this token and nothing else — it is what ties their
 * boxes together in the log, so losing it loses the log.
 */
export function curatorToken(): string {
  try {
    const existing = localStorage.getItem(TOKEN_KEY)
    if (existing) return existing
    const fresh = randomToken()
    localStorage.setItem(TOKEN_KEY, fresh)
    return fresh
  } catch {
    return randomToken()
  }
}

export function adoptCuratorToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* private browsing — the log just won't follow them */
  }
}

export function loadDraft(): BoxContent | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? normalizeBox(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function saveDraft(content: BoxContent): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(content))
  } catch {
    /* autosave is a nicety, not a guarantee */
  }
}
