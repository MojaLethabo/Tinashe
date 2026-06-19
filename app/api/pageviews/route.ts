import type { NextRequest } from 'next/server'

const API     = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')
const INT_KEY = process.env.INTERNAL_API_KEY ?? ''

export async function GET() {
  const res = await fetch(`${API}/pageviews`, {
    headers: { Authorization: `Bearer ${INT_KEY}` },
    cache: 'no-store',
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return Response.json({ error: 'Invalid JSON' }, { status: 400 })

  const res = await fetch(`${API}/pageviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
