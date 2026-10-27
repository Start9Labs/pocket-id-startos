import { createLoginLink } from '../actions/createLoginLink'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getEncryptionKey } from '../utils'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await storeJson.merge(effects, {
      ENCRYPTION_KEY: getEncryptionKey(),
    })
    await sdk.action.createOwnTask(effects, createLoginLink, 'important', {
      reason: i18n(
        'Sign in as the admin with a one-time login link and register your passkey.',
      ),
    })
  } else {
    await storeJson.merge(effects, {})
  }
})
