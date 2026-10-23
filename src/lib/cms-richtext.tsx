import React from 'react'
import CtaBlockComponent from '@/blocks/CtaBlock/Component'
import ContactBlockComponent from '@/blocks/ContactBlock/Component'
import PricingTableBlockComponent from '@/blocks/PricingTableBlock/Component'
import QrCodeBlockComponent from '@/blocks/QrCodeBlock/Component'
import AppStoreButtonsBlockComponent from '@/blocks/AppStoreButtonsBlock/Component'
import AddressBlockComponent from '@/blocks/AddressBlock/Component'
import TaskTableBlockComponent from '@/blocks/TaskTableBlock/Component'
import QuoteBlockComponent from '@/blocks/QuoteBlock/Component'
import DocumentDownloadBlockComponent from '@/blocks/DocumentDownloadBlock/Component'
import FactsBlockComponent from '@/blocks/FactsBlock/Component'
import OptionCardsBlockComponent from '@/blocks/OptionCardsBlock/Component'
import PackageTiersBlockComponent from '@/blocks/PackageTiersBlock/Component'
import AdFormatsBlockComponent from '@/blocks/AdFormatsBlock/Component'
import BoardMembersBlockComponent from '@/blocks/BoardMembersBlock/Component'
import TeamDirectoryBlockComponent from '@/blocks/TeamDirectoryBlock/Component'
import { defaultJSXConverters } from '@/lib/richtext'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

// Renders the custom richText blocks (cards, pricing, contact, ...) on CMS pages and audience pages.
export const cmsJsxConverters: JSXConvertersFunction = (args) => ({
  ...defaultJSXConverters(args),
  blocks: {
    ...defaultJSXConverters(args).blocks,
    ctaBlock: ({ node }: { node: any }) => (
      <CtaBlockComponent buttonLabel={node.fields.buttonLabel} buttonUrl={node.fields.buttonUrl} />
    ),
    contactBlock: ({ node }: { node: any }) => (
      <ContactBlockComponent heading={node.fields.heading} contacts={node.fields.contacts} />
    ),
    pricingTableBlock: ({ node }: { node: any }) => (
      <PricingTableBlockComponent rows={node.fields.rows} />
    ),
    qrCodeBlock: ({ node }: { node: any }) => (
      <QrCodeBlockComponent url={node.fields.url} label={node.fields.label} />
    ),
    appStoreButtonsBlock: ({ node }: { node: any }) => (
      <AppStoreButtonsBlockComponent
        appStoreUrl={node.fields.appStoreUrl}
        playStoreUrl={node.fields.playStoreUrl}
      />
    ),
    addressBlock: ({ node }: { node: any }) => (
      <AddressBlockComponent
        name={node.fields.name}
        address={node.fields.address}
        plusCode={node.fields.plusCode}
        mapsUrl={node.fields.mapsUrl}
        websiteUrl={node.fields.websiteUrl}
      />
    ),
    taskTableBlock: ({ node }: { node: any }) => (
      <TaskTableBlockComponent heading={node.fields.heading} rows={node.fields.rows} />
    ),
    quoteBlock: ({ node }: { node: any }) => <QuoteBlockComponent text={node.fields.text} />,
    factsBlock: ({ node }: { node: any }) => <FactsBlockComponent items={node.fields.items} />,
    optionCardsBlock: ({ node }: { node: any }) => (
      <OptionCardsBlockComponent cards={node.fields.cards} />
    ),
    packageTiersBlock: ({ node }: { node: any }) => (
      <PackageTiersBlockComponent tiers={node.fields.tiers} />
    ),
    adFormatsBlock: ({ node }: { node: any }) => (
      <AdFormatsBlockComponent
        heading={node.fields.heading}
        description={node.fields.description}
        formats={node.fields.formats}
      />
    ),
    boardMembersBlock: ({ node }: { node: any }) => (
      <BoardMembersBlockComponent members={node.fields.members} />
    ),
    teamDirectoryBlock: ({ node }: { node: any }) => (
      <TeamDirectoryBlockComponent units={node.fields.units} />
    ),
    documentDownloadBlock: ({ node }: { node: any }) => (
      <DocumentDownloadBlockComponent
        title={node.fields.title}
        description={node.fields.description}
        file={node.fields.file}
      />
    ),
  },
})
