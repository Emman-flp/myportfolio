import type { Metadata } from 'next'
import { Geist, Geist_Mono, Source_Serif_4 } from 'next/font/google'
import './globals.css'

import { ThemeProvider } from '@/components/shell/ThemeProvider'
import { Shell } from '@/components/shell/Shell'
import { PROFILE } from '@/lib/fixtures'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif-4',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: `${PROFILE.name} — Data Analyst & Data Engineer`,
  description: PROFILE.description,
  authors: [{ name: PROFILE.name }],
  openGraph: {
    type: 'website',
    siteName: PROFILE.name,
    title: `${PROFILE.name} — Data Analyst & Data Engineer`,
    description: PROFILE.description,
    url: '/',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PROFILE.name} — Data Analyst & Data Engineer`,
    description: PROFILE.description,
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
}

/**
 * Applied before paint so the theme never flashes.
 * Mirrors the reference's no-FOUC behaviour (Phase 1 §6).
 */
const themeInit = `(function(){try{var p=localStorage.getItem('theme');var d=p==='dark'||(p!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${sourceSerif.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="relative overflow-x-hidden bg-white font-sans text-ink antialiased">
        <ThemeProvider>
          <Shell>{children}</Shell>
        </ThemeProvider>
      </body>
    </html>
  )
}
