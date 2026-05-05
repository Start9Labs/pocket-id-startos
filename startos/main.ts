import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { mount, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Pocket ID!'))

  const store = await storeJson.read().const(effects)
  if (!store) throw new Error(i18n('store.json not found'))

  const subcontainer = await sdk.SubContainer.of(
    effects,
    { imageId: 'pocket-id' },
    mount,
    'pocket-id-sub',
  )

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer,
    exec: {
      command: sdk.useEntrypoint(),
      env: {
        APP_URL: store.APP_URL,
        ENCRYPTION_KEY: store.ENCRYPTION_KEY,
        TRUST_PROXY: String(store.TRUST_PROXY),
      },
    },
    ready: {
      display: i18n('Web Interface'),
      gracePeriod: 30000,
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, uiPort, {
          successMessage: i18n('The web interface is ready'),
          errorMessage: i18n('The web interface is not ready'),
        }),
    },
    requires: [],
  })
})
