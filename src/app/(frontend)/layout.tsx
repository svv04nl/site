export const dynamic = 'force-dynamic'

import React from 'react'
import { Rajdhani, Outfit } from 'next/font/google'
import Header from '@/components/HeaderServer'
import Footer from '@/components/FooterServer'
import ReactQueryProvider from '@/components/ReactQueryProvider'
import './globals.scss'

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata = {
  description: "Voetbalvereniging SVV'04 uit Schoonebeek.",
  title: "SVV'04 Schoonebeek",
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', rel: 'shortcut icon' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  appleWebApp: {
    title: "SVV'04",
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${rajdhani.variable} ${outfit.variable}`}>
      <body>
        <Header />
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Footer />
      </body>
    </html>
  )
}
