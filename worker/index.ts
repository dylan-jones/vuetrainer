import { bearerToken, verifyFirebaseToken } from './auth'
import { MAX_BODY_BYTES, parseProgress } from './validate'

interface Env {
  DB: D1Database
  FIREBASE_PROJECT_ID: string
}

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname !== '/api/progress') return json({ error: 'Not found' }, 404)

    if (request.method !== 'GET' && request.method !== 'PUT') {
      return new Response(null, { status: 405, headers: { Allow: 'GET, PUT' } })
    }

    const token = bearerToken(request)
    const uid = token ? await verifyFirebaseToken(token, env.FIREBASE_PROJECT_ID) : null
    if (!uid) return json({ error: 'Unauthorized' }, 401)

    if (request.method === 'GET') {
      const row = await env.DB.prepare('SELECT data FROM progress WHERE uid = ?').bind(uid).first<{ data: string }>()
      return json(row ? JSON.parse(row.data) : null)
    }

    const text = await request.text()
    if (text.length > MAX_BODY_BYTES) return json({ error: 'Payload too large' }, 413)

    let parsed: ReturnType<typeof parseProgress> = null
    try {
      parsed = parseProgress(JSON.parse(text))
    } catch {
      // falls through to the 400 below
    }
    if (!parsed) return json({ error: 'Invalid progress payload' }, 400)

    await env.DB.prepare(
      `INSERT INTO progress (uid, data, updated_at) VALUES (?1, ?2, ?3)
       ON CONFLICT(uid) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    )
      .bind(uid, JSON.stringify(parsed), parsed.updatedAt)
      .run()
    return json({ ok: true })
  },
}
