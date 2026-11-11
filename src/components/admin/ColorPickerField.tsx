'use client'

import { useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

export const ColorPickerField: TextFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  const hex = value || '#ffffff'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input
          type="color"
          value={hex}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: '2.5rem',
            height: '2.5rem',
            padding: '2px',
            cursor: 'pointer',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
          }}
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#ffffff"
          style={{
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            padding: '0.4rem 0.6rem',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            width: '7rem',
            background: 'var(--theme-input-bg)',
            color: 'var(--theme-text)',
          }}
        />
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '4px',
            background: hex,
            border: '1px solid var(--theme-elevation-150)',
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  )
}
