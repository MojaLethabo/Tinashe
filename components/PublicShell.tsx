'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname.startsWith('/admin')) {
      fetch('/api/pageviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'site' }),
      }).catch(() => {})
    }
  }, [pathname])

  if (pathname.startsWith('/admin')) {
    return <>{children}</>
  }
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
