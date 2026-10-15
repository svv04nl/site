import React from 'react'

export const SparkleIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <path d="M9.5 2.5 11 8l5.5 1.5L11 11l-1.5 5.5L8 11 2.5 9.5 8 8l1.5-5.5Z" />
    <path d="M18 13l.9 3.1L22 17l-3.1.9L18 21l-.9-3.1L14 17l3.1-.9L18 13Z" />
  </svg>
)
