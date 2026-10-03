import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { getPrimaryUrlCandidates, mount, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Pocket ID!'))

  const store = await storeJson.read().const(effects)
  if (!store) throw new Error(i18n('store.json not found'))

  const subcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'pocket-id' },
    mount,
    'pocket-id-sub',
  )

  return sdk.Daemons.of(effects)
    .addDaemon('primary', {
      subcontainer,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          APP_URL: store.APP_URL,
          ENCRYPTION_KEY: store.ENCRYPTION_KEY,
          TRUST_PROXY: 'true',
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
    .addHealthCheck('primary-url', {
      ready: {
        display: i18n('Primary URL'),
        fn: async () => {
          const candidate = (
            await getPrimaryUrlCandidates(effects).once()
          ).find((c) => c.url === store.APP_URL)
          if (!candidate)
            return {
              result: 'failure',
              message: i18n(
                "The primary URL is no longer one of this service's domains. Run Set Primary URL.",
              ),
            }
          return {
            result: 'success',
            message: candidate.public
              ? i18n(
                  'Public domain. Any service that supports OIDC can sign in through it.',
                )
              : i18n(
                  "Private domain. Reachable only on your LAN or VPN, and only by services that trust your server's Root CA.",
                ),
          }
        },
      },
      requires: [],
    })
})
