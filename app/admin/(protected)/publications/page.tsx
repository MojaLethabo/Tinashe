import Link from 'next/link'
import { getPublications, deletePublication } from '@/lib/api'
import { Plus, Pencil, Trash2, ExternalLink, FileText, BookOpen, Clock } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { PublicationType } from '@/lib/publications'

async function handleDelete(id: string) {
  'use server'
  await deletePublication(id)
  revalidatePath('/admin/publications')
  revalidatePath('/research')
  redirect('/admin/publications')
}

const TYPE_LABEL: Record<PublicationType, { label: string; icon: React.ReactNode }> = {
  'article':      { label: 'Article',      icon: <BookOpen size={10} /> },
  'chapter':      { label: 'Chapter',      icon: <FileText size={10} /> },
  'under-review': { label: 'Under Review', icon: <Clock size={10} /> },
}

export default async function AdminPublicationsPage() {
  const pubs = await getPublications()

  const articles     = pubs.filter(p => p.type === 'article')
  const chapters     = pubs.filter(p => p.type === 'chapter')
  const underReview  = pubs.filter(p => p.type === 'under-review')

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: '#111111' }}>Publications</h1>
          <p className="text-sm font-inter mt-0.5" style={{ color: '#888888' }}>
            {articles.length} articles · {chapters.length} chapters · {underReview.length} under review
          </p>
        </div>
        <Link
          href="/admin/publications/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-inter font-bold tracking-[0.15em] uppercase transition-opacity hover:opacity-85"
          style={{ background: '#111111', color: '#ffffff' }}
        >
          <Plus size={12} /> Add Publication
        </Link>
      </div>

      {[
        { label: 'Journal Articles', items: articles },
        { label: 'Book Chapters', items: chapters },
        { label: 'Under Review / In Press', items: underReview },
      ].map(({ label, items }) => (
        <section key={label} className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-inter font-semibold text-sm tracking-wide" style={{ color: '#555555' }}>{label}</h2>
            <span className="text-[9px] tracking-widest uppercase font-inter" style={{ color: '#aaaaaa' }}>{items.length}</span>
          </div>
          <div className="overflow-hidden" style={{ border: '1px solid #e0e0e0', background: '#ffffff' }}>
            {items.length === 0 ? (
              <p className="p-6 text-sm font-inter" style={{ color: '#888888' }}>None yet.</p>
            ) : (
              items.map((pub, i) => {
                const tl = TYPE_LABEL[pub.type]
                return (
                  <div
                    key={pub.id}
                    className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[#f9f9f9]"
                    style={i > 0 ? { borderTop: '1px solid #ebebeb' } : {}}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-inter text-sm font-medium" style={{ color: '#111111' }}>
                          {pub.title}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[8px] font-inter tracking-[0.12em] uppercase px-2 py-0.5 flex-shrink-0"
                          style={{ border: '1px solid #d0d0d0', color: '#888888' }}>
                          {tl.icon}{tl.label}
                        </span>
                      </div>
                      <p className="text-[11px] font-inter mb-0.5" style={{ color: '#666666' }}>{pub.authors}</p>
                      <p className="text-[10px] font-inter italic" style={{ color: '#888888' }}>
                        {pub.year && <span className="not-italic mr-2 px-1.5 py-0.5" style={{ border: '1px solid #e0e0e0', color: '#777777' }}>{pub.year}</span>}
                        {pub.venue}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {pub.scholarUrl && (
                          <a href={pub.scholarUrl} target="_blank" rel="noopener"
                            className="inline-flex items-center gap-1 text-[9px] font-inter tracking-[0.1em] uppercase transition-colors hover:text-[#111111]"
                            style={{ color: '#777777' }}>
                            <ExternalLink size={9} />Scholar
                          </a>
                        )}
                        {pub.pdfUrl && (
                          <a href={pub.pdfUrl} target="_blank" rel="noopener"
                            className="inline-flex items-center gap-1 text-[9px] font-inter tracking-[0.1em] uppercase transition-colors hover:text-[#111111]"
                            style={{ color: '#777777' }}>
                            <FileText size={9} />PDF
                          </a>
                        )}
                        {pub.doi && (
                          <a href={pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`} target="_blank" rel="noopener"
                            className="inline-flex items-center gap-1 text-[9px] font-inter tracking-[0.1em] uppercase transition-colors hover:text-[#111111]"
                            style={{ color: '#777777' }}>
                            DOI ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                      <Link
                        href={`/admin/publications/${pub.id}`}
                        className="w-8 h-8 flex items-center justify-center transition-all hover:text-[#111111]"
                        style={{ color: '#aaaaaa' }}
                      >
                        <Pencil size={13} />
                      </Link>
                      <form action={handleDelete.bind(null, pub.id)}>
                        <button type="submit" className="w-8 h-8 flex items-center justify-center transition-all hover:text-red-600"
                          style={{ color: '#aaaaaa' }}>
                          <Trash2 size={13} />
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
