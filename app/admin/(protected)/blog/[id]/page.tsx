import { notFound } from 'next/navigation'
import { getBlogPostById } from '@/lib/api'
import BlogForm from '@/components/admin/BlogForm'

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getBlogPostById(id)
  if (!post) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: '#111111' }}>Edit Post</h1>
        <p className="text-sm font-inter mt-0.5" style={{ color: '#888888' }}>{post.title}</p>
      </div>
      <BlogForm post={post} />
    </div>
  )
}
