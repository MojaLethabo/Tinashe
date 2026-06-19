import BlogForm from '@/components/admin/BlogForm'

export default function NewBlogPostPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: '#111111' }}>New Blog Post</h1>
        <p className="text-sm font-inter mt-0.5" style={{ color: '#888888' }}>Write and publish a post to the blog</p>
      </div>
      <BlogForm />
    </div>
  )
}
