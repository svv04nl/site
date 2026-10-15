export const dynamic = 'force-dynamic'

import React from 'react'
import { Saira_Condensed, Outfit } from 'next/font/google'
import Header from '@/components/HeaderServer'
import Footer from '@/components/FooterServer'
import ReactQueryProvider from '@/components/ReactQueryProvider'
import { BreadcrumbProvider } from '@/components/BreadcrumbContext'
import { AssistantProvider } from '@/components/assistant/AssistantProvider'
import { isAssistantEnabled } from '@/lib/ai/agent'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.scss'

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
    <html lang="nl" className={`${sairaCondensed.variable} ${outfit.variable}`}>
      <body>
        <div className="site-shell">
          <AssistantProvider enabled={isAssistantEnabled()}>
            <BreadcrumbProvider>
              <Header />
              <ReactQueryProvider>{children}</ReactQueryProvider>
            </BreadcrumbProvider>
            <Footer />
          </AssistantProvider>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
