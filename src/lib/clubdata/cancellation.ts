import type { ScheduleMatch } from '@/lib/clubdata/transform'

// Sportlink puts one of these words in a match's status when it does not go ahead.
const LABELS = [
  ['afgelast', 'Afgelast'],
  ['uitgesteld', 'Uitgesteld'],
  ['gestaakt', 'Gestaakt'],
  ['afgekeurd', 'Afgekeurd'],
] as const

/** "Afgelast", "Uitgesteld", "Gestaakt" or "Afgekeurd" for a match that does not go ahead, else null. */
export function cancellationLabel(status: string | null | undefined): string | null {
  const s = status?.toLowerCase() ?? ''
  return LABELS.find(([word]) => s.includes(word))?.[1] ?? null
}

// ─── Test mode ───────────────────────────────────────────────────────────────
// On previews and locally, ?afgelasting=test, =veel or =alles pretends that real upcoming
// matches are cancelled, so the bar, the popup, the programme and the match page can be
// checked without a real cancellation. The bar, the programme and the match page pick the
// same matches, so a click in the bar leads to a match page that shows it too.

export type CancellationTestMode = 'test' | 'veel' | 'alles'

const TEST_MODES: readonly string[] = ['test', 'veel', 'alles']

// The live site. Every other host (previews, localhost) may use the test mode.
const PRODUCTION_HOSTS = ['svv04.nl', 'www.svv04.nl', 'preview.svv04.nl', 'site.svv04.workers.dev']

/** The test mode in the URL (?afgelasting=..., any capitals), or null. Browser only. */
export function testModeParam(): CancellationTestMode | null {
  if (typeof window === 'undefined') {
    return null
  }
  for (const [key, value] of new URLSearchParams(window.location.search)) {
    const mode = value.toLowerCase()
    if (key.toLowerCase() === 'afgelasting' && TEST_MODES.includes(mode)) {
      return mode as CancellationTestMode
    }
  }
  return null
}

/** The test mode in the URL, outside production (judged by the host name). Browser only. */
export function browserTestMode(): CancellationTestMode | null {
  if (typeof window === 'undefined' || PRODUCTION_HOSTS.includes(window.location.hostname)) {
    return null
  }
  return testModeParam()
}

/**
 * The matches a test mode pretends are cancelled: 'test' the first 2 own matches to come,
 * 'veel' the first 7, 'alles' all home matches of the first day with at least two of them.
 */
export function testCancelledCodes(
  matches: ScheduleMatch[],
  mode: CancellationTestMode,
  today: string,
): Set<number> {
  const own = matches
    .filter((m) => m.isOwn && m.dayKey >= today)
    .sort((a, b) => a.dayKey.localeCompare(b.dayKey) || a.time.localeCompare(b.time))
  if (mode === 'alles') {
    for (const day of [...new Set(own.map((m) => m.dayKey))]) {
      const home = own.filter((m) => m.dayKey === day && m.isOwnHome)
      if (home.length >= 2) {
        return new Set(home.map((m) => m.matchCode))
      }
    }
    return new Set()
  }
  return new Set(own.slice(0, mode === 'test' ? 2 : 7).map((m) => m.matchCode))
}

/** "YYYY-MM-DD" for today in Dutch time. */
export const amsterdamToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(new Date())
