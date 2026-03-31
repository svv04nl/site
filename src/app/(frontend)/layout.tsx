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
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-touch-icon.png',
  },
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
