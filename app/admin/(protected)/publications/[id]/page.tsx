import { notFound } from 'next/navigation'
import { getPublicationById } from '@/lib/api'
import PublicationForm from '@/components/admin/PublicationForm'

export default async function EditPublicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pub = await getPublicationById(id)
  if (!pub) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: '#111111' }}>Edit Publication</h1>
        <p className="text-sm font-inter mt-0.5 line-clamp-1" style={{ color: '#888888' }}>{pub.title}</p>
      </div>
      <PublicationForm pub={pub} />
    </div>
  )
}
