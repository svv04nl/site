'use client'

import React, { useActionState } from 'react'
import { noPasswordManager } from '@/lib/no-password-manager'
import { submitAccessCode, type AccessState } from './actions'

export default function AccessForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AccessState, FormData>(submitAccessCode, null)

  return (
    <form className="gate-form" action={formAction}>
      <input type="hidden" name="next" value={next} />
      <label htmlFor="gate-code">Toegangscode</label>
      <input
        id="gate-code"
        name="code"
        type="text"
        autoFocus
        required
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-invalid={state?.error ? true : undefined}
        aria-describedby={state?.error ? 'gate-error' : undefined}
        {...noPasswordManager}
      />
      {state?.error && (
        <p id="gate-error" className="gate-error" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending}>
        {pending ? 'Even geduld…' : 'Verder'}
      </button>
    </form>
  )
}
