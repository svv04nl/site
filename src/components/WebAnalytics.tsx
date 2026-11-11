import Script from 'next/script'

// Cloudflare Web Analytics (vervangt Vercel Analytics en Speed Insights). Geen cookies;
// meet bezoeken en Core Web Vitals. Zonder token (lokaal, previews) laadt er niets.
export function WebAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN
  if (!token) {
    return null
  }
  return (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
      strategy="afterInteractive"
    />
  )
}
