export const COOKIE_NAME = 'zard_admin'

async function computeToken(): Promise<string> {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET not set')
  const encoder = new TextEncoder()
  const key = await globalThis.crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await globalThis.crypto.subtle.sign(
    'HMAC', key, encoder.encode('authenticated')
  )
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function createSession(): Promise<string> {
  return computeToken()
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    const expected = await computeToken()
    return token === expected
  } catch {
    return false
  }
}
