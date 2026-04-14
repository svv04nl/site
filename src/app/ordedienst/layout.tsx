import React from 'react'
import { Rajdhani, Outfit } from 'next/font/google'
import ReactQueryProvider from '@/components/ReactQueryProvider'

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

export default function OrdiedienstLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${rajdhani.variable} ${outfit.variable}`}>
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  )
}
