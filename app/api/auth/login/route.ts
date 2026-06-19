import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createSession, COOKIE_NAME } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const validEmail = process.env.ADMIN_EMAIL
  const validPassword = process.env.ADMIN_PASSWORD

  if (
    !validEmail || !validPassword ||
    email !== validEmail ||
    password !== validPassword
  ) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = await createSession()
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  })

  return Response.json({ ok: true })
}
