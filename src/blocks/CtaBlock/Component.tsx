import React from 'react'

type Props = {
  buttonLabel?: string | null
  buttonUrl?: string | null
}

export default function CtaBlockComponent({ buttonLabel, buttonUrl }: Props) {
  if (!buttonLabel || !buttonUrl) return null

  // Links within the site stay in the same tab; only external links open a new one.
  const isInternal = buttonUrl.startsWith('/')

  return (
    <div className="static-page-cta">
      <a
        href={buttonUrl}
        className="cta-button"
        {...(isInternal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {buttonLabel}
      </a>
    </div>
  )
}
