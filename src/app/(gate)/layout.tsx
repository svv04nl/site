import React from 'react'
import { Saira_Condensed, Outfit } from 'next/font/google'
import './gate.scss'

const sairaCondensed = Saira_Condensed({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-saira-condensed',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-outfit',
  display: 'swap',
})

// Losse pagina zonder header en footer: de bezoeker is nog niet binnen.
export default function GateLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${sairaCondensed.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  )
}
