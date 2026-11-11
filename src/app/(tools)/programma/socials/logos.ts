import fs from 'node:fs'
import path from 'node:path'

function loadDataUri(filename: string) {
  const filePath = path.join(process.cwd(), 'public', filename)
  const buffer = fs.readFileSync(filePath)
  return `data:image/png;base64,${buffer.toString('base64')}`
}

let cachedClubLogo: string | null = null
export function getClubLogoDataUri() {
  if (!cachedClubLogo) {
    cachedClubLogo = loadDataUri('svv04-logo.png')
  }
  return cachedClubLogo
}

let cached7x7Logo: string | null = null
export function get7x7LogoDataUri() {
  if (!cached7x7Logo) {
    cached7x7Logo = loadDataUri('knvb-7x7-voetbal-logo.png')
  }
  return cached7x7Logo
}
