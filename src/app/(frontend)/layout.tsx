import React from 'react'
import Header from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import ReactQueryProvider from '@/components/ReactQueryProvider'
import './globals.scss'

export const metadata = {
  description: "Voetbalvereniging SVV'04 uit Schoonebeek.",
  title: "SVV'04 Schoonebeek",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Footer />
      </body>
    </html>
  )
}
