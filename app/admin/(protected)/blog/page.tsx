import Link from 'next/link'
import { getAllBlogPosts, deleteBlogPost, getPageViews } from '@/lib/api'
import { Plus, Pencil, Trash2, ImageIcon, Eye } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function handleDelete(id: string) {
  'use server'
  await deleteBlogPost(id)
  revalidatePath('/admin/blog')
  revalidatePath('/')
  revalidatePath('/blog')
  redirect('/admin/blog')
}

export default async function AdminBlogPage() {
  const [posts, pageViews] = await Promise.all([getAllBlogPosts(), getPageViews()])

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: '#111111' }}>Blog Posts</h1>
          <p className="text-sm font-inter mt-0.5" style={{ color: '#888888' }}>
            {posts.filter(p => p.status === 'published').length} published · {posts.filter(p => p.status === 'draft').length} drafts
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-inter font-bold tracking-[0.15em] uppercase transition-opacity hover:opacity-85"
          style={{ background: '#111111', color: '#ffffff' }}
        >
          <Plus size={12} /> New Post
        </Link>
      </div>

      <div className="overflow-hidden" style={{ border: '1px solid #e0e0e0', background: '#ffffff' }}>
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="font-inter text-sm" style={{ color: '#888888' }}>No blog posts yet.</p>
            <Link
              href="/admin/blog/new"
              className="text-[10px] font-inter tracking-[0.15em] uppercase transition-colors hover:text-[#111111]"
              style={{ color: '#777777' }}
            >
              Create your first post →
            </Link>
          </div>
        ) : (
          posts.map((post, i) => (
            <div
              key={post.id}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#f9f9f9]"
              style={i > 0 ? { borderTop: '1px solid #ebebeb' } : {}}
            >
              {/* thumbnail */}
              <div
                className="flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{ width: 56, height: 40, border: '1px solid #e0e0e0', background: '#f6f6f6' }}
              >
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={16} style={{ color: '#cccccc' }} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-inter text-sm font-medium truncate" style={{ color: '#111111' }}>{post.title}</p>
                  {post.status === 'draft' && (
                    <span className="text-[8px] font-inter tracking-[0.12em] uppercase px-2 py-0.5 flex-shrink-0"
                      style={{ border: '1px solid #d0d0d0', color: '#888888' }}>
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-inter" style={{ color: '#888888' }}>
                  {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {post.tags.length > 0 && ` · ${post.tags.slice(0, 3).join(', ')}`}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 text-[9px] font-inter" style={{ color: '#aaaaaa' }}>
                <span className="flex items-center gap-1">
                  <Eye size={11} />
                  {pageViews.blog[post.slug] ?? 0}
                </span>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="w-8 h-8 flex items-center justify-center transition-all hover:text-[#111111] text-[10px] font-inter"
                  style={{ color: '#aaaaaa' }}
                  title="View post"
                >
                  ↗
                </Link>
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="w-8 h-8 flex items-center justify-center transition-all hover:text-[#111111]"
                  style={{ color: '#aaaaaa' }}
                >
                  <Pencil size={13} />
                </Link>
                <form action={handleDelete.bind(null, post.id)}>
                  <button type="submit" className="w-8 h-8 flex items-center justify-center transition-all hover:text-red-600"
                    style={{ color: '#aaaaaa' }}>
                    <Trash2 size={13} />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
