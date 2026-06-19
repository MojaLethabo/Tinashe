'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/research', label: 'Research' },
  { href: '/blog', label: 'Blog' },
  { href: '/podcast', label: 'Podcast' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 48)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid #e0e0e0' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 16px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-8 h-[58px] flex items-center justify-between">

        <Link href="/" className="flex-shrink-0">
          <span className="font-playfair font-bold" style={{ fontSize: '1.2rem', letterSpacing: '0.08em', color: '#111111' }}>
            ZARD
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-9">
          {links.map(({ href, label }) => {
            const active = href === '/' ? pathname === href : pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className="relative font-inter transition-colors duration-200 pb-px"
                style={{
                  fontSize: '0.6875rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: active ? '#111111' : '#777777',
                }}
              >
                {label}
                {active && (
                  <span className="absolute -bottom-px left-0 right-0 h-[1.5px]" style={{ background: '#111111' }} />
                )}
              </Link>
            )
          })}
        </div>

        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden transition-colors"
          style={{ color: '#555555' }}
          aria-label="Toggle menu"
        >
          {open ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-4 sm:px-8 py-6 flex flex-col gap-5" style={{ background: '#ffffff', borderTop: '1px solid #e5e5e5' }}>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-inter transition-colors"
              style={{
                fontSize: '0.6875rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: pathname === href ? '#111111' : '#666666',
              }}
            >
              {label}
            </Link>
          ))}
          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e5e5e5' }}>
            <Link
              href="/podcast"
              className="inline-block font-inter font-semibold text-white transition-opacity hover:opacity-85"
              style={{ fontSize: '0.6875rem', letterSpacing: '0.18em', textTransform: 'uppercase', background: '#111111', padding: '0.625rem 1.25rem' }}
            >
              Listen Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
