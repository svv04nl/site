import React from 'react'

type Props = {
  buttonLabel?: string | null
  buttonUrl?: string | null
}

export default function CtaBlockComponent({ buttonLabel, buttonUrl }: Props) {
  if (!buttonLabel || !buttonUrl) return null

  return (
    <div className="static-page-cta">
      <a
        href={buttonUrl}
        className="cta-button"
        target="_blank"
        rel="noopener noreferrer"
      >
        {buttonLabel}
      </a>
    </div>
  )
}
