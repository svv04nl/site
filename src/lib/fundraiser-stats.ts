import { getPayload } from 'payload'
import config from '@payload-config'

export type PublicDonor = { name: string; units: number; amount: number }

export type FundraiserStats = {
  totalAmount: number
  totalUnits: number
  donorCount: number
  // Alleen donateurs die toestemming gaven voor vermelding op de website, met het
  // aantal eenheden en het donatiebedrag (zonder transactiekosten).
  publicDonors: PublicDonor[]
}

export async function getFundraiserStats(fundraiserId: number): Promise<FundraiserStats> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'donations',
    where: { status: { equals: 'betaald' }, fundraiser: { equals: fundraiserId } },
    pagination: false,
    depth: 0,
    sort: '-paidAt',
    select: {
      amount: true,
      units: true,
      name: true,
      companyName: true,
      isCompany: true,
      showOnList: true,
    },
  })

  return {
    totalAmount: docs.reduce((sum, d) => sum + d.amount, 0),
    totalUnits: docs.reduce((sum, d) => sum + d.units, 0),
    donorCount: docs.length,
    publicDonors: docs
      .filter((d) => d.showOnList)
      .map((d) => ({
        name: d.isCompany && d.companyName ? d.companyName : d.name,
        units: d.units,
        amount: d.amount,
      })),
  }
}
