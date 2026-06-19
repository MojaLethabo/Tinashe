'use client'

import { useState, useEffect, useTransition } from 'react'
import { CornerDownRight } from 'lucide-react'
import type { Comment } from '@/lib/comments'

interface Props {
  targetId: string
  targetType: 'blog' | 'episode'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid #d5d5d5',
  background: '#fafafa',
  fontFamily: 'inherit',
  fontSize: '0.8125rem',
  color: '#111111',
  outline: 'none',
}

function MiniForm({
  onPost,
  onCancel,
  placeholder = 'Share your thoughts…',
  submitLabel = 'Post Comment',
}: {
  onPost: (name: string, text: string) => Promise<void>
  onCancel?: () => void
  placeholder?: string
  submitLabel?: string
}) {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !text.trim()) { setError('Please fill in both fields.'); return }
    startTransition(async () => {
      try {
        await onPost(name.trim(), text.trim())
        setName('')
        setText('')
        setDone(true)
        setTimeout(() => setDone(false), 3500)
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label className="font-inter uppercase" style={{ fontSize: '0.4375rem', letterSpacing: '0.28em', color: '#888888', display: 'block', marginBottom: '0.4rem' }}>
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={100}
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = '#999999'; e.currentTarget.style.background = '#ffffff' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#d5d5d5'; e.currentTarget.style.background = '#fafafa' }}
          />
        </div>
      </div>
      <div>
        <label className="font-inter uppercase" style={{ fontSize: '0.4375rem', letterSpacing: '0.28em', color: '#888888', display: 'block', marginBottom: '0.4rem' }}>
          Comment
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={placeholder}
          maxLength={1000}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={e => { e.currentTarget.style.borderColor = '#999999'; e.currentTarget.style.background = '#ffffff' }}
          onBlur={e => { e.currentTarget.style.borderColor = '#d5d5d5'; e.currentTarget.style.background = '#fafafa' }}
        />
      </div>
      {error && <p className="font-inter" style={{ fontSize: '0.75rem', color: '#c0392b' }}>{error}</p>}
      {done && <p className="font-inter" style={{ fontSize: '0.75rem', color: '#27ae60' }}>Posted — thank you!</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="submit"
          disabled={isPending}
          className="font-inter font-black uppercase"
          style={{
            fontSize: '0.5rem',
            letterSpacing: '0.2em',
            background: isPending ? '#888888' : '#111111',
            color: '#ffffff',
            border: 'none',
            padding: '0.625rem 1.5rem',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Posting…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="font-inter uppercase"
            style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: '#888888', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function CommentMeta({ name, date }: { name: string; date: string }) {
  return (
    <div className="flex items-center gap-2.5" style={{ marginBottom: '0.375rem' }}>
      <span className="font-inter font-semibold" style={{ fontSize: '0.8125rem', color: '#111111' }}>{name}</span>
      <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cccccc', display: 'inline-block', flexShrink: 0 }} />
      <span className="font-inter" style={{ fontSize: '0.625rem', color: '#aaaaaa' }}>
        {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </span>
    </div>
  )
}

export default function CommentSection({ targetId, targetType }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/comments?targetId=${encodeURIComponent(targetId)}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setComments(data) })
      .catch(() => {})
  }, [targetId])

  async function postComment(name: string, text: string) {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId, targetType, name, comment: text }),
    })
    if (!res.ok) throw new Error()
    const c: Comment = await res.json()
    setComments(prev => [...prev, c])
  }

  async function postReply(parentId: string, name: string, text: string) {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId, targetType, parentId, name, comment: text }),
    })
    if (!res.ok) throw new Error()
    const c: Comment = await res.json()
    setComments(prev => [...prev, c])
    setReplyingTo(null)
  }

  const topLevel = comments.filter(c => !c.parentId)
  const repliesFor = (parentId: string) => comments.filter(c => c.parentId === parentId)
  const topLevelCount = topLevel.length

  return (
    <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '2.5rem', marginTop: '2.5rem' }}>
      <span className="font-inter uppercase" style={{ fontSize: '0.5rem', letterSpacing: '0.35em', color: '#999999', display: 'block', marginBottom: '0.5rem' }}>
        Discussion
      </span>
      <h3 className="font-inter font-black tracking-tight" style={{ fontSize: '1.1rem', color: '#111111', marginBottom: '1.75rem' }}>
        {topLevelCount > 0 ? `${topLevelCount} Comment${topLevelCount === 1 ? '' : 's'}` : 'Leave a Comment'}
      </h3>

      {topLevel.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          {topLevel.map(c => {
            const replies = repliesFor(c.id)
            const isReplying = replyingTo === c.id
            return (
              <div key={c.id} style={{ borderBottom: '1px solid #ebebeb' }}>
                {/* Top-level comment */}
                <div className="py-5">
                  <CommentMeta name={c.name} date={c.date} />
                  <p className="font-inter leading-relaxed" style={{ fontSize: '0.875rem', color: '#444444', marginBottom: '0.75rem' }}>
                    {c.comment}
                  </p>
                  {!isReplying && (
                    <button
                      onClick={() => setReplyingTo(c.id)}
                      className="font-inter uppercase"
                      style={{ fontSize: '0.4375rem', letterSpacing: '0.22em', color: '#888888', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Reply
                    </button>
                  )}
                </div>

                {/* Replies */}
                {replies.map(r => (
                  <div key={r.id} className="flex gap-3 py-4 pl-4" style={{ borderTop: '1px solid #f0f0f0' }}>
                    <CornerDownRight size={12} strokeWidth={1.5} style={{ color: '#cccccc', marginTop: '0.25rem', flexShrink: 0 }} />
                    <div>
                      <CommentMeta name={r.name} date={r.date} />
                      <p className="font-inter leading-relaxed" style={{ fontSize: '0.8125rem', color: '#555555' }}>{r.comment}</p>
                    </div>
                  </div>
                ))}

                {/* Inline reply form */}
                {isReplying && (
                  <div className="pl-8 pb-5 pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <CornerDownRight size={11} strokeWidth={1.5} style={{ color: '#bbbbbb' }} />
                      <span className="font-inter uppercase" style={{ fontSize: '0.4375rem', letterSpacing: '0.22em', color: '#aaaaaa' }}>
                        Replying to {c.name}
                      </span>
                    </div>
                    <MiniForm
                      placeholder={`Reply to ${c.name}…`}
                      submitLabel="Post Reply"
                      onPost={(name, text) => postReply(c.id, name, text)}
                      onCancel={() => setReplyingTo(null)}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* New top-level comment form */}
      <div>
        <p className="font-inter uppercase" style={{ fontSize: '0.4375rem', letterSpacing: '0.28em', color: '#888888', marginBottom: '1rem' }}>
          Add a comment
        </p>
        <MiniForm onPost={postComment} />
      </div>
    </div>
  )
}
