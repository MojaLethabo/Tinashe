import type { NextRequest } from 'next/server'

const API = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')

export async function GET(request: NextRequest) {
  const targetId = request.nextUrl.searchParams.get('targetId')
  if (!targetId) return Response.json({ error: 'Missing targetId' }, { status: 400 })

  const res = await fetch(`${API}/comments?targetId=${encodeURIComponent(targetId)}`, { cache: 'no-store' })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return Response.json({ error: 'Invalid JSON' }, { status: 400 })

  // Map camelCase → snake_case for Express
  const payload = {
    target_id:   body.targetId,
    target_type: body.targetType,
    parent_id:   body.parentId,
    name:        body.name,
    comment:     body.comment,
  }

  const res = await fetch(`${API}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  // Map response back to camelCase
  if (res.ok && data.target_id) {
    return Response.json({
      id:         data.id,
      targetId:   data.target_id,
      targetType: data.target_type,
      ...(data.parent_id ? { parentId: data.parent_id } : {}),
      name:    data.name,
      comment: data.comment,
      date:    data.date,
    }, { status: res.status })
  }
  return Response.json(data, { status: res.status })
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  const res = await fetch(`${API}/comments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${process.env.INTERNAL_API_KEY}` },
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
