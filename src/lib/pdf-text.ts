/**
 * Plain text from `pdftotext -layout` output, for the assistant's search index: no form feeds,
 * no runs of spaces from the layout, at most one empty line between paragraphs.
 */
export function cleanPdfText(raw: string): string {
  return raw
    .replace(/\f/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
