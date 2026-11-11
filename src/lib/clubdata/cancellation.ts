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
