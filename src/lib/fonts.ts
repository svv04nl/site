import { Outfit, Rajdhani, Saira_Condensed } from 'next/font/google'

// The site's fonts, defined once and imported by every root layout. With the webpack build
// (Cloudflare), each next/font call gets its own class hash; when several layouts each called
// Outfit(...) with the same options, a page could get one call's class while the CSS of another
// was loaded, so the font variable was never set and text fell back to the system font.

export const sairaCondensed = Saira_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-saira-condensed',
  display: 'swap',
})

export const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-outfit',
  display: 'swap',
})

/** Used by the tools and ordedienst pages (match day screens). */
export const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
})
