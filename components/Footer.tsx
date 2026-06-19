import Link from 'next/link'

const navLinks = [
  ['/', 'Home'], ['/about', 'About'], ['/research', 'Research'],
  ['/podcast', 'Podcast'], ['/contact', 'Contact'],
] as const

const connectLinks = [
  { href: 'mailto:muteroinnocent@gmail.com', label: 'Email' },
  { href: '#', label: 'Google Scholar' },
  { href: '#', label: 'ResearchGate' },
  { href: '#', label: 'LinkedIn' },
  { href: '#', label: 'Spotify' },
  { href: '#', label: 'Apple Podcasts' },
]

export default function Footer() {
  return (
    <footer style={{ background: '#f6f6f6', borderTop: '1px solid #e0e0e0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 sm:pt-14 pb-10">

        <div className="grid sm:grid-cols-2 md:grid-cols-[1.8fr_1fr_1fr] gap-8 md:gap-12 mb-10 sm:mb-12">

          <div>
            <div className="mb-5">
              <span className="font-inter font-black text-[1.4rem] tracking-[0.07em]" style={{ color: '#111111' }}>ZARD</span>
            </div>
            <p className="font-inter text-[13px] leading-relaxed mb-1" style={{ color: '#555555' }}>
              by Innocent Tinashe Mutero
            </p>
            <p className="font-inter text-[12px] leading-relaxed" style={{ color: '#777777' }}>
              African Cultural Economies · Entrepreneurship Ecosystems<br />
              PhD (Public Administration) · DMus (Ethnomusicology)
            </p>
          </div>

          <div>
            <span className="section-label mb-4">Navigate</span>
            <ul className="space-y-3">
              {navLinks.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="font-inter text-[13px] transition-colors hover:text-[#111111]" style={{ color: '#555555' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="section-label mb-4">Listen &amp; Connect</span>
            <ul className="space-y-3">
              {connectLinks.map(({ href, label }) => (
                <li key={label}>
                  <a href={href} className="font-inter text-[13px] transition-colors hover:text-[#111111]" style={{ color: '#555555' }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-7" style={{ borderTop: '1px solid #e0e0e0' }}>
          <p className="font-inter text-[11px]" style={{ color: '#999999' }}>
            © {new Date().getFullYear()} ZARD · Innocent Tinashe Mutero. All rights reserved.
          </p>
          <p className="font-inter text-[9px] tracking-[0.3em] uppercase" style={{ color: '#bbbbbb' }}>
            Research Podcast
          </p>
        </div>
      </div>
    </footer>
  )
}
