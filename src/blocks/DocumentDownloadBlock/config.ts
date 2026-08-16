import type { Block } from 'payload'

export const DocumentDownloadBlock: Block = {
  slug: 'documentDownloadBlock',
  labels: {
    singular: 'Document download',
    plural: 'Document downloads',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      label: 'Beschrijving',
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      label: 'Bestand',
      required: true,
    },
  ],
}
