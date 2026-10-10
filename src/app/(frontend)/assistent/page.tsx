import { notFound } from 'next/navigation'
import AssistantChat from '@/components/assistant/AssistantChat'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { isAssistantEnabled } from '@/lib/ai/agent'

export const metadata = {
  title: "SVV'04 - Vraag het de assistent",
  // Not public yet: keep out of search engines until the assistant is launched.
  robots: { index: false, follow: false },
}

export default function AssistantPage() {
  if (!isAssistantEnabled()) notFound()

  return (
    <main className="page">
      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Assistent' }]} />

      <div className="page-inner assistant-page">
        <SectionHeader as="h1" title="Vraag het de assistent" />
        <p className="assistant-intro">
          Stel een vraag over SVV'04: de club, het lidmaatschap, vrijwilligerswerk, programma,
          uitslagen en standen. De assistent zoekt het op in de website en de KNVB-gegevens.
        </p>
        <AssistantChat />
      </div>
    </main>
  )
}
