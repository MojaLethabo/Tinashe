'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError('Incorrect email or password')
        setPassword('')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: '#ffffff',
    border: '1px solid #d5d5d5',
    color: '#333333',
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#f6f6f6' }}>
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <p className="font-inter font-black text-2xl tracking-[0.08em] mb-1" style={{ color: '#111111' }}>ZARD</p>
          <p className="text-[10px] tracking-[0.3em] uppercase font-inter" style={{ color: '#999999' }}>
            Admin Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase mb-2 font-inter" style={{ color: '#777777' }}>
              Email
            </label>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full text-sm px-4 py-3 focus:outline-none transition-all font-inter focus:border-[#999999]"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase mb-2 font-inter" style={{ color: '#777777' }}>
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full text-sm px-4 py-3 focus:outline-none transition-all font-inter focus:border-[#999999]"
              style={inputStyle}
            />
          </div>

          {error && (
            <p className="text-red-600 text-[11px] font-inter">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 text-[10px] font-inter font-bold tracking-[0.18em] uppercase transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ background: '#111111', color: '#ffffff' }}
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
