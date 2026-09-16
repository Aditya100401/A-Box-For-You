const MAX_EDGE = 1600
const QUALITY = 0.85

/**
 * Phone photos are enormous and none of this needs print resolution, so the
 * image is redrawn at a sane size before it ever leaves the browser.
 */
async function shrink(file: File): Promise<Blob> {
  if (file.type === 'image/gif') return file
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  if (scale === 1 && file.size < 900_000) {
    bitmap.close()
    return file
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return file
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', QUALITY),
  )
  return blob ?? file
}

export async function uploadImage(file: File): Promise<string> {
  const body = new FormData()
  const shrunk = await shrink(file)
  body.append('file', shrunk, file.name)

  const res = await fetch('/api/uploads', { method: 'POST', body })
  if (!res.ok) {
    const detail = await res.json().catch(() => null)
    throw new Error(detail?.detail ?? 'That image could not be uploaded.')
  }
  const { url } = (await res.json()) as { url: string }
  return url
}
