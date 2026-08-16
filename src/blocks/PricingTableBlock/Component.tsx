import React from 'react'

type Row = {
  category?: string | null
  perKwartaal?: string | null
  perSeizoen?: string | null
}

type Props = {
  rows?: Row[] | null
}

export default function PricingTableBlockComponent({ rows }: Props) {
  const resolved = (rows ?? []).filter((r) => r.category)
  if (resolved.length === 0) return null

  return (
    <div className="pricing-table-wrap">
      <table className="pricing-table">
        <thead>
          <tr>
            <th>Categorie</th>
            <th>Per kwartaal</th>
            <th>Per seizoen</th>
          </tr>
        </thead>
        <tbody>
          {resolved.map((row, i) => (
            <tr key={i}>
              <td>{row.category}</td>
              <td>{row.perKwartaal}</td>
              <td>{row.perSeizoen}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
