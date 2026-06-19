'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Publication, PublicationType } from '@/lib/publications'
import { Upload, Loader2, ExternalLink, FileText, BookOpen, Clock, X } from 'lucide-react'

interface Props {
  pub?: Publication
}

const inputStyle = { background: '#ffffff', border: '1px solid #d5d5d5', color: '#333333' }
const inputCls = 'w-full text-sm px-4 py-2.5 focus:outline-none transition-all font-inter placeholder:text-[#cccccc] focus:border-[#999999]'
const labelCls = 'block text-[10px] tracking-[0.2em] uppercase mb-1.5 font-inter'

const TYPE_OPTIONS: { value: PublicationType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'article',      label: 'Journal Article', icon: <BookOpen size={13} />,  desc: 'Peer-reviewed journal paper' },
  { value: 'chapter',      label: 'Book Chapter',    icon: <FileText size={13} />,  desc: 'Edited volume or book' },
  { value: 'under-review', label: 'Under Review',    icon: <Clock size={13} />,     desc: 'In press or under revision' },
]

export default function PublicationForm({ pub }: Props) {
  const router = useRouter()
  const isEdit = !!pub

  const [form, setForm] = useState({
    title:      pub?.title      ?? '',
    authors:    pub?.authors    ?? '',
    year:       pub?.year       ?? new Date().getFullYear().toString(),
    type:       (pub?.type      ?? 'article') as PublicationType,
    venue:      pub?.venue      ?? '',
    abstract:   pub?.abstract   ?? '',
    scholarUrl: pub?.scholarUrl ?? '',
    pdfUrl:     pub?.pdfUrl     ?? '',
    doi:        pub?.doi        ?? '',
  })

  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const pdfRef = useRef<HTMLInputElement>(null)

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload-pdf', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setForm(prev => ({ ...prev, pdfUrl: data.url }))
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
    if (!form.authors.trim()) { setError('Authors field is required'); return }
    setSaving(true)
    setError('')

    const payload: Publication = {
      id:         pub?.id ?? Date.now().toString(),
      title:      form.title.trim(),
      authors:    form.authors.trim(),
      year:       form.year.trim(),
      type:       form.type,
      venue:      form.venue.trim(),
      abstract:   form.abstract.trim() || undefined,
      scholarUrl: form.scholarUrl.trim() || undefined,
      pdfUrl:     form.pdfUrl.trim() || undefined,
      doi:        form.doi.trim() || undefined,
    }

    const url    = isEdit ? `/api/admin/publications/${pub!.id}` : '/api/admin/publications'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        router.push('/admin/publications')
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

      {/* Type */}
      <div>
        <p className={labelCls} style={{ color: '#777777' }}>Publication Type</p>
        <div className="grid grid-cols-3 gap-2">
          {TYPE_OPTIONS.map(({ value, label, icon, desc }) => {
            const active = form.type === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, type: value }))}
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

      {/* Core metadata */}
      <div className="space-y-5">
        <div>
          <label className={labelCls} style={{ color: '#777777' }}>Title</label>
          <input type="text" required value={form.title} onChange={set('title')}
            placeholder="Full title of the article or chapter"
            className={inputCls} style={inputStyle} />
        </div>

        <div>
          <label className={labelCls} style={{ color: '#777777' }}>Authors</label>
          <input type="text" required value={form.authors} onChange={set('authors')}
            placeholder="Surname, I.T. & Co-Author, A.B."
            className={inputCls} style={inputStyle} />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls} style={{ color: '#777777' }}>
              {form.type === 'article' ? 'Journal Name' : form.type === 'chapter' ? 'Book / Publisher' : 'Status / Venue'}
            </label>
            <input type="text" required value={form.venue} onChange={set('venue')}
              placeholder={
                form.type === 'article' ? 'e.g. Social Dynamics, 41(2)'
                : form.type === 'chapter' ? 'e.g. In J. Smith (Ed.), Book Title. UKZN Press.'
                : 'e.g. Under revision — Journal of African Studies'
              }
              className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: '#777777' }}>Year</label>
            <input type="text" value={form.year} onChange={set('year')}
              placeholder="2024"
              className={inputCls} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Abstract */}
      <div>
        <label className={labelCls} style={{ color: '#777777' }}>Abstract (optional)</label>
        <textarea rows={5} value={form.abstract} onChange={set('abstract')}
          placeholder="Paste the abstract here…"
          className={`${inputCls} resize-y`} style={{ ...inputStyle, lineHeight: 1.7 }} />
      </div>

      {/* Links */}
      <div className="space-y-5 pt-2" style={{ borderTop: '1px solid #e0e0e0' }}>
        <p className={labelCls} style={{ color: '#aaaaaa', marginBottom: 0 }}>Links &amp; Files</p>

        {/* Scholar URL */}
        <div>
          <label className={labelCls} style={{ color: '#777777' }}>
            <span className="inline-flex items-center gap-1.5"><ExternalLink size={10} />Google Scholar URL</span>
          </label>
          <input type="url" value={form.scholarUrl} onChange={set('scholarUrl')}
            placeholder="https://scholar.google.com/…"
            className={inputCls} style={inputStyle} />
        </div>

        {/* DOI */}
        <div>
          <label className={labelCls} style={{ color: '#777777' }}>DOI (optional)</label>
          <input type="text" value={form.doi} onChange={set('doi')}
            placeholder="10.1080/…"
            className={inputCls} style={inputStyle} />
          {form.doi && !form.doi.startsWith('http') && (
            <p className="mt-1 text-[10px] font-inter" style={{ color: '#aaaaaa' }}>
              Resolves to https://doi.org/{form.doi}
            </p>
          )}
        </div>

        {/* PDF */}
        <div>
          <label className={labelCls} style={{ color: '#777777' }}>PDF File</label>
          <div className="space-y-3">
            {form.pdfUrl && (
              <div className="flex items-center gap-3 px-4 py-2.5"
                style={{ border: '1px solid #e0e0e0', background: '#f6f6f6' }}>
                <FileText size={14} style={{ color: '#888888', flexShrink: 0 }} />
                <span className="font-inter text-[12px] truncate flex-1" style={{ color: '#555555' }}>
                  {form.pdfUrl.split('/').pop()}
                </span>
                <a href={form.pdfUrl} target="_blank" rel="noopener"
                  className="text-[10px] font-inter tracking-[0.12em] uppercase"
                  style={{ color: '#777777' }}>
                  Preview ↗
                </a>
                <button type="button" onClick={() => setForm(prev => ({ ...prev, pdfUrl: '' }))}
                  className="flex-shrink-0 transition-colors hover:text-red-500"
                  style={{ color: '#aaaaaa' }}>
                  <X size={13} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={uploading}
                onClick={() => pdfRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-inter tracking-[0.15em] uppercase transition-all disabled:opacity-40"
                style={{ border: '1px solid #d5d5d5', background: '#ffffff', color: '#666666' }}
              >
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                {uploading ? 'Uploading…' : 'Upload PDF'}
              </button>
              <input ref={pdfRef} type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
              <span className="text-[10px] font-inter" style={{ color: '#bbbbbb' }}>or paste URL below</span>
            </div>
            {!form.pdfUrl && (
              <input type="text" value={form.pdfUrl} onChange={set('pdfUrl')}
                placeholder="https://… or /papers/…"
                className={inputCls} style={inputStyle} />
            )}
          </div>
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
          {isEdit ? 'Save Changes' : 'Add Publication'}
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
