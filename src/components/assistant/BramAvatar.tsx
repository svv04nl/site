import React from 'react'

/**
 * Bram's head in a circle, popping out above the top of the circle.
 * `size` is the circle's diameter in px; `tone` its colour.
 */
export function BramAvatar({
  size = 62,
  tone = 'white',
}: {
  size?: number
  tone?: 'white' | 'red'
}) {
  return (
    <span
      className={`bram-avatar${tone === 'red' ? ' bram-avatar--red' : ''}`}
      aria-hidden="true"
      style={{ '--bram-size': `${size}px` } as React.CSSProperties}
    >
      <img src="/bram/bram.webp" alt="" width={240} height={274} />
    </span>
  )
}
