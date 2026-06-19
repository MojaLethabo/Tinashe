'use client'
import { useState, useTransition } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface FormState { name: string; email: string; subject: string; message: string }

const EMPTY: FormState = { name: '', email: '', subject: '', message: '' }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.2em] uppercase mb-2 font-inter" style={{ color: '#777777' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL ?? ''
        const res = await fetch(`${apiBase}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error ?? 'Something went wrong. Please try again.')
          return
        }
        setForm(EMPTY)
        setSubmitted(true)
      } catch {
        setError('Could not send your message. Please check your connection and try again.')
      }
    })
  }

  const inputStyle = { background: '#ffffff', border: '1px solid #d5d5d5', color: '#333333' }
  const inputClass = 'w-full text-sm px-4 py-3 font-inter transition-all focus:outline-none focus:border-[#999999]'

  if (submitted) {
    return (
      <div className="p-10" style={{ border: '1px solid #e0e0e0', background: '#ffffff' }}>
        <p className="font-playfair text-4xl mb-4" style={{ color: '#111111' }}>Thank you.</p>
        <p className="font-inter text-sm leading-relaxed" style={{ color: '#555555' }}>
          Your message has been sent. Innocent will be in touch as soon as possible.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Name">
          <input
            type="text" required
            value={form.name} onChange={set('name')}
            placeholder="Your name"
            className={inputClass} style={inputStyle}
          />
        </Field>
        <Field label="Email">
          <input
            type="email" required
            value={form.email} onChange={set('email')}
            placeholder="your@email.com"
            className={inputClass} style={inputStyle}
          />
        </Field>
      </div>
      <Field label="Subject">
        <input
          type="text" required
          value={form.subject} onChange={set('subject')}
          placeholder="Research collaboration, speaking, podcast…"
          className={inputClass} style={inputStyle}
        />
      </Field>
      <Field label="Message">
        <textarea
          required rows={6}
          value={form.message} onChange={set('message')}
          placeholder="Your message…"
          className={`${inputClass} resize-none`} style={inputStyle}
        />
      </Field>

      {error && (
        <p className="font-inter text-[12px]" style={{ color: '#c0392b' }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-3 px-8 py-3.5 text-[10px] font-inter font-bold tracking-[0.18em] uppercase text-white transition-opacity hover:opacity-85 disabled:opacity-50"
        style={{ background: '#111111' }}
      >
        {isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        {isPending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
