import React from 'react'

/**
 * Bram's head in a white circle, popping out above the top of the circle.
 * `size` is the circle's diameter in px.
 */
export function BramAvatar({ size = 62 }: { size?: number }) {
  return (
    <span
      className="bram-avatar"
      aria-hidden="true"
      style={{ '--bram-size': `${size}px` } as React.CSSProperties}
    >
      <img src="/bram/bram.webp" alt="" width={240} height={274} />
    </span>
  )
}
