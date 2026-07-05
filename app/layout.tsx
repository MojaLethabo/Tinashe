import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import PublicShell from '@/components/PublicShell'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-var',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter-var',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ZARD | Research Podcast by Innocent Tinashe Mutero',
  description:
    'ZARD — a research podcast by Innocent Tinashe Mutero exploring arts for social change, conflict transformation, and community engagement.',
  icons: {
    icon: '/Pictures/Logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-inter antialiased">
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  )
}
