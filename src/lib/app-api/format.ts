/** URL-safe slug, used for heading anchors and derived ids. */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/** "06-12345678" or "0524-531656" to E.164 ("+31612345678"). Undefined if it is not a Dutch or international number. */
export function toE164(phone: string | null | undefined): string | undefined {
  if (!phone) {
    return undefined
  }
  const digits = phone.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) {
    return /^\+\d{8,15}$/.test(digits) ? digits : undefined
  }
  if (digits.startsWith('00')) {
    return /^\d{10,17}$/.test(digits) ? `+${digits.slice(2)}` : undefined
  }
  if (digits.startsWith('0')) {
    return /^0\d{9}$/.test(digits) ? `+31${digits.slice(1)}` : undefined
  }
  return undefined
}

/**
 * "SVV'04 O11-1JM" -> "O11-1JM". Names where the part after the club name starts with a digit
 * ("SVV'04 1", "SVV'04 35+1") keep the club name, because "1" alone says nothing.
 */
export function shortTeamName(name: string): string {
  const short = name.replace(/^SVV['’]04\s+/i, '')
  return /^[A-Za-z]/.test(short) ? short : name
}

/** "EMMEN" -> "Emmen", "KLAZIENAVEEN" -> "Klazienaveen". */
export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|[\s-])(\p{L})/gu, (_m, sep: string, ch: string) => sep + ch.toUpperCase())
}

/** "*accent*" markers to plain text, for places that cannot show the accent colour. */
export function stripAccent(value: string): string {
  return value.replace(/\*([^*]+)\*/g, '$1')
}
