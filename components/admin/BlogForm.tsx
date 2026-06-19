'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { BlogPost } from '@/lib/blog'
import { Upload, Loader2, ImageIcon, Globe, FileText, X } from 'lucide-react'

interface Props {
  post?: BlogPost
}

const inputStyle = { background: '#ffffff', border: '1px solid #d5d5d5', color: '#333333' }
const inputCls = 'w-full text-sm px-4 py-2.5 focus:outline-none transition-all font-inter placeholder:text-[#cccccc] focus:border-[#999999]'
const labelCls = 'block text-[10px] tracking-[0.2em] uppercase mb-1.5 font-inter'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

export default function BlogForm({ post }: Props) {
  const router = useRouter()
  const isEdit = !!post

  const [form, setForm] = useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? '',
    imageUrl: post?.imageUrl ?? '',
    author: post?.author ?? 'Innocent Tinashe Mutero',
    date: post?.date ?? new Date().toISOString().split('T')[0],
    tags: post?.tags?.join(', ') ?? '',
    status: (post?.status ?? 'published') as 'published' | 'draft',
  })

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const imgRef = useRef<HTMLInputElement>(null)

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    setForm(prev => ({
      ...prev,
      title,
      slug: prev.slug === slugify(prev.title) || prev.slug === '' ? slugify(title) : prev.slug,
    }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setForm(prev => ({ ...prev, imageUrl: data.url }))
      } else {
        setError(data.error ?? 'Upload failed')
      }
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.slug.trim()) { setError('Slug is required'); return }
    setSaving(true)
    setError('')

    const payload: BlogPost = {
      id: post?.id ?? Date.now().toString(),
      slug: form.slug.trim(),
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      author: form.author.trim(),
      date: form.date,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: form.status,
    }

    const url = isEdit ? `/api/admin/blog/${post!.id}` : '/api/admin/blog'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        router.push('/admin/blog')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Save failed')
      }
    } catch {
      setError('Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {error && (
        <p className="text-red-600 text-sm font-inter px-4 py-3"
          style={{ border: '1px solid #fca5a5', background: '#fef2f2' }}>
          {error}
        </p>
      )}

      {/* Status */}
      <div>
        <p className={labelCls} style={{ color: '#777777' }}>Status</p>
        <div className="grid grid-cols-2 gap-2" style={{ maxWidth: 360 }}>
          {([
            { value: 'published', label: 'Publish', icon: <Globe size={13} />, desc: 'Visible on the site' },
            { value: 'draft', label: 'Draft', icon: <FileText size={13} />, desc: 'Saved privately' },
          ] as const).map(({ value, label, icon, desc }) => {
            const active = form.status === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, status: value }))}
                className="flex flex-col items-start gap-1.5 px-4 py-3.5 text-left transition-all"
                style={active
                  ? { border: '1px solid #111111', background: '#111111', color: '#ffffff' }
                  : { border: '1px solid #d5d5d5', background: '#ffffff', color: '#777777' }}
              >
                <span className="flex items-center gap-1.5 text-[10px] font-inter font-bold tracking-[0.12em] uppercase">
                  {icon}{label}
                </span>
                <span className="text-[10px] font-inter opacity-60">{desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cover image */}
      <div>
        <p className={labelCls} style={{ color: '#777777' }}>Cover Image</p>
        <div className="space-y-3">
          {form.imageUrl && (
            <div className="relative inline-block">
              <img
                src={form.imageUrl}
                alt="Cover preview"
                className="object-cover"
                style={{ width: 240, height: 140, border: '1px solid #e0e0e0' }}
              />
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center"
                style={{ background: '#111111', color: '#ffffff' }}
              >
                <X size={11} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={uploading}
              onClick={() => imgRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-inter tracking-[0.15em] uppercase transition-all disabled:opacity-40"
              style={{ border: '1px solid #d5d5d5', background: '#ffffff', color: '#666666' }}
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? 'Uploading…' : 'Upload Image'}
            </button>
            <input ref={imgRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <span className="text-[10px] font-inter" style={{ color: '#bbbbbb' }}>or</span>
            <input
              type="text"
              value={form.imageUrl}
              onChange={set('imageUrl')}
              placeholder="https://… or /blog-images/…"
              className={inputCls}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Title + slug */}
      <div className="space-y-5">
        <div>
          <label className={labelCls} style={{ color: '#777777' }}>Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={handleTitleChange}
            placeholder="Post title"
            className={inputCls}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelCls} style={{ color: '#777777' }}>Slug (URL)</label>
          <input
            type="text"
            required
            value={form.slug}
            onChange={set('slug')}
            placeholder="url-friendly-slug"
            className={inputCls}
            style={inputStyle}
          />
          {form.slug && (
            <p className="mt-1 text-[10px] font-inter" style={{ color: '#aaaaaa' }}>
              /blog/{form.slug}
            </p>
          )}
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className={labelCls} style={{ color: '#777777' }}>Excerpt</label>
        <textarea
          required
          rows={2}
          value={form.excerpt}
          onChange={set('excerpt')}
          placeholder="A short summary shown on the blog listing…"
          className={`${inputCls} resize-none`}
          style={inputStyle}
        />
      </div>

      {/* Content */}
      <div>
        <label className={labelCls} style={{ color: '#777777' }}>Content</label>
        <textarea
          required
          rows={16}
          value={form.content}
          onChange={set('content')}
          placeholder="Full post content. Separate paragraphs with a blank line."
          className={`${inputCls} resize-y`}
          style={{ ...inputStyle, lineHeight: 1.7 }}
        />
      </div>

      {/* Meta */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label className={labelCls} style={{ color: '#777777' }}>Author</label>
          <input type="text" value={form.author} onChange={set('author')} className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className={labelCls} style={{ color: '#777777' }}>Date</label>
          <input type="date" required value={form.date} onChange={set('date')} className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className={labelCls} style={{ color: '#777777' }}>Tags (comma separated)</label>
          <input type="text" value={form.tags} onChange={set('tags')} placeholder="Music, Research, Africa" className={inputCls} style={inputStyle} />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 px-8 py-3 text-[10px] font-inter font-bold tracking-[0.18em] uppercase transition-opacity hover:opacity-85 disabled:opacity-50"
          style={{ background: '#111111', color: '#ffffff' }}
        >
          {saving && <Loader2 size={12} className="animate-spin" />}
          {isEdit ? 'Save Changes' : form.status === 'draft' ? 'Save Draft' : 'Publish Post'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-[10px] font-inter tracking-[0.15em] uppercase transition-colors hover:text-[#111111]"
          style={{ color: '#888888' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
