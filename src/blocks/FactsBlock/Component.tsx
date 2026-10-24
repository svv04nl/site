import React from 'react'

type Item = {
  value?: string | null
  label?: string | null
}

type Props = {
  items?: Item[] | null
}

export default function FactsBlockComponent({ items }: Props) {
  const resolved = (items ?? []).filter((i) => i.value && i.label)
  if (resolved.length === 0) return null

  return (
    <dl className="facts-block">
      {resolved.map((item, i) => (
        <div className="facts-block-item" key={i}>
          <dt className="facts-block-value">{item.value}</dt>
          <dd className="facts-block-label">{item.label}</dd>
        </div>
      ))}
    </dl>
  )
}
