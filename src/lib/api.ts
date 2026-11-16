import { getFirebase } from './firebase'
import type { ProgressData } from './progress'

async function authHeader(): Promise<HeadersInit> {
  const { auth } = await getFirebase()
  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new Error('Not signed in')
  return { Authorization: `Bearer ${token}` }
}

/** Returns the saved progress, or null if nothing has been saved yet. */
export async function fetchProgress(): Promise<ProgressData | null> {
  const res = await fetch('/api/progress', { headers: await authHeader() })
  if (!res.ok) throw new Error(`Loading progress failed (${res.status})`)
  return (await res.json()) as ProgressData | null
}

export async function saveProgress(data: ProgressData): Promise<void> {
  const res = await fetch('/api/progress', {
    method: 'PUT',
    headers: { ...(await authHeader()), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Saving progress failed (${res.status})`)
}
