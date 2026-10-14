import React from 'react'
import { Saira_Condensed, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './tribune.scss'

const sairaCondensed = Saira_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-saira-condensed',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://svv04.nl'),
  title: "Steun de renovatie van de tribune | SVV'04 Schoonebeek",
  description:
    "De tribune van SVV'04 wordt gerenoveerd. Doneer een nieuw stoeltje voor €30 of geef een vrije donatie.",
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', rel: 'shortcut icon' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
}

// Losse campagnepagina: bewust zonder de header en footer van de hoofdsite.
export default function TribuneLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${sairaCondensed.variable} ${outfit.variable}`}>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
