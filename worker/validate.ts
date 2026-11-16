export const MAX_BODY_BYTES = 256 * 1024

export interface StoredProgress {
  done: Record<string, true>
  notes: Record<string, string>
  updatedAt: number
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Returns a cleaned copy of the progress payload, or null if it is malformed. */
export function parseProgress(input: unknown): StoredProgress | null {
  if (!isRecord(input) || !isRecord(input.done) || !isRecord(input.notes)) return null
  if (typeof input.updatedAt !== 'number' || !Number.isFinite(input.updatedAt)) return null

  const done: Record<string, true> = {}
  for (const [key, value] of Object.entries(input.done)) {
    if (value !== true) return null
    done[key] = true
  }
  const notes: Record<string, string> = {}
  for (const [key, value] of Object.entries(input.notes)) {
    if (typeof value !== 'string') return null
    notes[key] = value
  }
  return { done, notes, updatedAt: input.updatedAt }
}
