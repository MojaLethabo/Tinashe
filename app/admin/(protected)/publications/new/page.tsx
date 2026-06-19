import PublicationForm from '@/components/admin/PublicationForm'

export default function NewPublicationPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: '#111111' }}>Add Publication</h1>
        <p className="text-sm font-inter mt-0.5" style={{ color: '#888888' }}>Add a journal article, book chapter, or work in progress</p>
      </div>
      <PublicationForm />
    </div>
  )
}
