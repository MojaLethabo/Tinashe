import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, COOKIE_NAME } from '@/lib/session'
import { toPublicationPayload } from '@/lib/api'

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const res = await fetch(`${API}/publications/${id}`, { headers: { Authorization: `Bearer ${INT_KEY}` }, cache: 'no-store' })
  return Response.json(await res.json(), { status: res.status })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const res = await fetch(`${API}/publications/${id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(toPublicationPayload(body)),
  })
  return Response.json(await res.json(), { status: res.status })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const res = await fetch(`${API}/publications/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${INT_KEY}` },
  })
  return Response.json(await res.json(), { status: res.status })
}
