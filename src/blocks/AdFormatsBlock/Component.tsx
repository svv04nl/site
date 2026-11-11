import React from 'react'

type Format = {
  label?: string | null
  width?: number | null
  height?: number | null
  note?: string | null
}

type Props = {
  heading?: string | null
  description?: string | null
  formats?: Format[] | null
}

function formatMm(value: number) {
  return String(value).replace('.', ',')
}

export default function AdFormatsBlockComponent({ heading, description, formats }: Props) {
  const resolved = (formats ?? []).filter((f) => f.label && f.width && f.height)
  if (!heading || resolved.length === 0) {
    return null
  }
  // The shapes share a baseline: the tallest format sets the height of the stage.
  const stage = Math.max(...resolved.map((f) => f.height!))

  return (
    <figure className="ad-formats">
      <figcaption className="ad-formats-caption">
        <span className="ad-formats-heading">{heading}</span>
        {description && <span className="ad-formats-description">{description}</span>}
      </figcaption>
      <ul className="ad-formats-list" style={{ '--stage': stage } as React.CSSProperties}>
        {resolved.map((format, i) => (
          <li className="ad-format" key={i}>
            <span
              className="ad-format-shape"
              style={{ '--w': format.width, '--h': format.height } as React.CSSProperties}
              aria-hidden="true"
            />
            <span className="ad-format-label">{format.label}</span>
            <span className="ad-format-size">
              {formatMm(format.width!)} × {formatMm(format.height!)} mm
            </span>
            {format.note && <span className="ad-format-note">{format.note}</span>}
          </li>
        ))}
      </ul>
    </figure>
  )
}
