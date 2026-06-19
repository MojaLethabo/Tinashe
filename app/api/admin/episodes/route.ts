import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, COOKIE_NAME } from '@/lib/session'
import { toEpisodePayload } from '@/lib/api'
import type { Episode } from '@/lib/episodes'

const API     = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')
const INT_KEY = process.env.INTERNAL_API_KEY ?? ''

async function auth(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  return !!token && (await verifySession(token))
}

function adminHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${INT_KEY}` }
}

export async function GET() {
  if (!(await auth())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const res = await fetch(`${API}/episodes/all`, { headers: { Authorization: `Bearer ${INT_KEY}` }, cache: 'no-store' })
  return Response.json(await res.json(), { status: res.status })
}

export async function POST(req: NextRequest) {
  if (!(await auth())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json() as Episode
  const res = await fetch(`${API}/episodes`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(toEpisodePayload(body)),
  })
  return Response.json(await res.json(), { status: res.status })
}
