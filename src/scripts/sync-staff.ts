import { getPayload } from 'payload'
import config from '@payload-config'
import { syncTeamStaff } from '@/lib/clubdata/sync-staff'

const payload = await getPayload({ config })
const result = await syncTeamStaff(payload)
console.log(result)
process.exit(0)
