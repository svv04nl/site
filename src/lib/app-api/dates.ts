import { addDays } from '@/lib/ai/time'

export type DateRange = { from: string; to: string }

/** 0 = Monday ... 6 = Sunday, for a YYYY-MM-DD date. */
function weekdayIndex(iso: string): number {
  return (new Date(`${iso}T12:00:00Z`).getUTCDay() + 6) % 7
}

/**
 * The weekend people mean "this weekend": the coming Saturday and Sunday from Monday to Friday,
 * the current one on Saturday and Sunday.
 */
export function thisWeekend(today: string): DateRange {
  const weekday = weekdayIndex(today)
  const saturday = addDays(today, weekday === 6 ? -1 : 5 - weekday)
  return { from: saturday, to: addDays(saturday, 1) }
}

const shift = (range: DateRange, days: number): DateRange => ({
  from: addDays(range.from, days),
  to: addDays(range.to, days),
})

function weekOf(today: string): DateRange {
  const monday = addDays(today, -weekdayIndex(today))
  return { from: monday, to: addDays(monday, 6) }
}

export type ProgramPeriod =
  | 'this-weekend'
  | 'next-weekend'
  | 'this-week'
  | 'next-week'
  | 'next-3-weeks'
export type ResultsPeriod = 'last-weekend' | 'this-weekend' | 'last-week'

export function programRange(period: ProgramPeriod, today: string): DateRange {
  switch (period) {
    case 'this-weekend':
      return thisWeekend(today)
    case 'next-weekend':
      return shift(thisWeekend(today), 7)
    case 'this-week':
      return weekOf(today)
    case 'next-week':
      return shift(weekOf(today), 7)
    case 'next-3-weeks':
      // Vandaag en de 20 dagen erna: het programma voor de komende drie weken.
      return { from: today, to: addDays(today, 20) }
  }
}

export function resultsRange(period: ResultsPeriod, today: string): DateRange {
  switch (period) {
    case 'last-weekend':
      return shift(thisWeekend(today), -7)
    case 'this-weekend':
      return thisWeekend(today)
    case 'last-week':
      return shift(weekOf(today), -7)
  }
}

/** "Zaterdag 31 oktober" for a YYYY-MM-DD date. */
export function dayLabel(iso: string): string {
  const label = new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${iso}T12:00:00Z`))
  return label.charAt(0).toUpperCase() + label.slice(1)
}
