import type { CollectionConfig } from 'payload'
import { Resend } from 'resend'

const isAdmin = ({ req: { user } }: { req: { user: any } }) => user?.role === 'admin'

const NOTIFY_EMAIL = 'algemenezaken@svv04.nl'
const NOTIFICATION_TEMPLATE_ALIAS = 'svv04-nieuw-bericht'

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Optional detail rows (Afdeling/Onderwerp) are passed to the Resend template
// as pre-built <tr> HTML via {{{}}} (unescaped) variables — empty means the
// message came from the feedback widget, not the contact form.
function detailRow(label: string, value?: string | null): string {
  if (!value) return '<!---->'
  return `<tr><td style="padding:10px 0; border-bottom:1px solid #ececec; font-family:Helvetica, Arial, sans-serif; font-size:13px; color:#999999; vertical-align:top;">${label}</td><td style="padding:10px 0; border-bottom:1px solid #ececec; font-family:Helvetica, Arial, sans-serif; font-size:14px; color:#1a1a1a;">${escapeHtml(value)}</td></tr>`
}

export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: {
    singular: 'Bericht',
    plural: 'Berichten',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'afdeling', 'message', 'createdAt'],
    description:
      'Berichten via de feedback-widget en het contactformulier op de site. Alleen aanmaken via /api/message-submit (met BotID-check), niet rechtstreeks via de API.',
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Naam',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: 'E-mailadres',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Bericht',
      required: true,
    },
    {
      name: 'afdeling',
      type: 'text',
      label: 'Afdeling',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Alleen gezet bij een bericht via het contactformulier (rol-slug uit contacts). Leeg = via de feedback-widget.',
      },
    },
    {
      name: 'onderwerp',
      type: 'text',
      label: 'Onderwerp',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Alleen gezet bij een bericht via het contactformulier.',
      },
    },
    {
      name: 'pageUrl',
      type: 'text',
      label: 'Pagina',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Pagina waarop dit bericht is verstuurd.',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        try {
          let to = NOTIFY_EMAIL
          if (doc.afdeling) {
            const { docs } = await req.payload.find({
              collection: 'contacts',
              where: { 'roles.slug': { equals: doc.afdeling } },
              limit: 1,
              depth: 0,
            })
            if (docs[0]?.email) to = docs[0].email
          }

          const { error } = await resend.emails.send({
            to,
            template: {
              id: NOTIFICATION_TEMPLATE_ALIAS,
              variables: {
                NAME: escapeHtml(doc.name),
                SENDER_EMAIL: escapeHtml(doc.email),
                MESSAGE: escapeHtml(String(doc.message)).replace(/\n/g, '<br />'),
                PAGE_URL: doc.pageUrl ?? '-',
                AFDELING_ROW: detailRow('Afdeling', doc.afdeling),
                ONDERWERP_ROW: detailRow('Onderwerp', doc.onderwerp),
              },
            },
          })
          // resend.emails.send() resolves with { error } on API failures rather
          // than throwing — must check explicitly or failures go unnoticed.
          if (error) throw new Error(`${error.name}: ${error.message}`)
        } catch (err) {
          req.payload.logger.error(`Message notification email failed: ${err}`)
        }
      },
    ],
  },
  timestamps: true,
}
