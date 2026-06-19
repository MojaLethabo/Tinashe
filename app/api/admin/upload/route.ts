import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, COOKIE_NAME } from '@/lib/session'

const API     = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')
const INT_KEY = process.env.INTERNAL_API_KEY ?? ''

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !(await verifySession(token))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  if (!file.type.startsWith('audio/')) {
    return Response.json({ error: 'File must be an audio file' }, { status: 400 })
  }

  // Forward to Express → Supabase Storage
  const fd = new FormData()
  fd.append('file', file)

  const res = await fetch(`${API}/upload/audio`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${INT_KEY}` },
    body: fd,
  })

  const data = await res.json()
  return Response.json(data, { status: res.status })
}
