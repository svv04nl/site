import React from 'react'

type Row = {
  task?: string | null
  description?: string | null
  frequency?: string | null
}

type Props = {
  heading?: string | null
  rows?: Row[] | null
}

export default function TaskTableBlockComponent({ heading, rows }: Props) {
  const resolved = (rows ?? []).filter((r) => r.task)
  if (resolved.length === 0) return null

  return (
    <div className="pricing-table-wrap">
      {heading && <h3>{heading}</h3>}
      <table className="pricing-table">
        <thead>
          <tr>
            <th>Taak/functie</th>
            <th>Omschrijving</th>
            <th>Frequentie</th>
          </tr>
        </thead>
        <tbody>
          {resolved.map((row, i) => (
            <tr key={i}>
              <td>{row.task}</td>
              <td>{row.description}</td>
              <td>{row.frequency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
