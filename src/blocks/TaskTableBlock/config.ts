import type { Block } from 'payload'

export const TaskTableBlock: Block = {
  slug: 'taskTableBlock',
  labels: {
    singular: 'Takentabel',
    plural: 'Takentabellen',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Kopje (optioneel)',
    },
    {
      name: 'rows',
      type: 'array',
      label: 'Rijen',
      labels: { singular: 'Rij', plural: 'Rijen' },
      fields: [
        { name: 'task', type: 'text', label: 'Taak/functie', required: true },
        { name: 'description', type: 'text', label: 'Omschrijving' },
        { name: 'frequency', type: 'text', label: 'Frequentie' },
      ],
    },
  ],
}
