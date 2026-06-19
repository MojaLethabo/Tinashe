import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'
import ConnectList from '@/components/ConnectList'

export const metadata: Metadata = {
  title: 'Contact | ZARD',
  description: 'Get in touch with Innocent Tinashe Mutero for research collaborations, speaking engagements, and podcast inquiries.',
}

const connectItems = [
  { label: 'Email', value: 'muteroinnocent@gmail.com', href: 'mailto:muteroinnocent@gmail.com' },
  { label: 'Phone', value: '078 587 7933', href: 'tel:+27785877933' },
  { label: 'Google Scholar', value: 'h-index 7 · 198 citations', href: '#' },
  { label: 'Location', value: 'Johannesburg, South Africa', href: '#' },
]

const interests = [
  'Research Collaborations', 'Grant Development', 'Speaking & Keynotes',
  'Postgraduate Supervision', 'Podcast Appearances', 'M&E Consultancy',
  'Academic Partnerships',
]

export default function ContactPage() {
  return (
    <>
      <section className="pt-32" style={{ background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-8">
          <span className="section-label mb-4">ZARD · Contact</span>
          <div className="pb-12" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <h1 className="font-playfair leading-none mb-5" style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)', color: '#111111' }}>
              Get in Touch
            </h1>
            <p className="font-inter text-[15px] leading-relaxed max-w-lg" style={{ color: '#555555' }}>
              For research collaborations, speaking engagements, podcast inquiries, or general correspondence.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: '#f6f6f6' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-px" style={{ background: '#d8d8d8' }}>

            <div className="px-10 py-10" style={{ background: '#f6f6f6' }}>
              <div className="flex items-center justify-between mb-8 pb-5" style={{ borderBottom: '1px solid #e0e0e0' }}>
                <h2 className="font-inter font-black tracking-tight" style={{ fontSize: '1.375rem', color: '#111111' }}>Send a Message</h2>
              </div>
              <ContactForm />
            </div>

            <div className="px-10 py-10" style={{ background: '#f6f6f6' }}>
              <div className="flex items-center justify-between mb-8 pb-5" style={{ borderBottom: '1px solid #e0e0e0' }}>
                <h3 className="font-inter font-black tracking-tight" style={{ fontSize: '1.375rem', color: '#111111' }}>Ways to Connect</h3>
              </div>
              <ConnectList items={connectItems} />
              <div className="mt-10 pt-7" style={{ borderTop: '1px solid #e0e0e0' }}>
                <span className="section-label mb-4">Open to</span>
                <ul>
                  {interests.map(text => (
                    <li key={text} className="py-3 flex items-center gap-3" style={{ borderBottom: '1px solid #ebebeb' }}>
                      <div className="w-[3px] h-3 rounded-full flex-shrink-0" style={{ background: '#cccccc' }} />
                      <span className="font-inter text-[13px]" style={{ color: '#444444' }}>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
