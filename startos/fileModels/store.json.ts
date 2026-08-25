import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z
  .object({
    APP_URL: z.string().catch(''),
    ENCRYPTION_KEY: z.string(),
    TRUST_PROXY: z.boolean().catch(true),
  })
  .strip()

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/store.json' },
  shape,
)
