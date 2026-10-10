import type { JSONValue } from 'ai'

/** `toModelOutput` for tools that return UI data: the model only sees everything except `ui`. */
export const stripUi = ({ output }: { output: unknown }) => {
  const { ui: _ui, ...rest } =
    output && typeof output === 'object' ? (output as Record<string, unknown>) : {}
  return { type: 'json' as const, value: rest as JSONValue }
}
