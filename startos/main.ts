import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { primaryUrl } from './primaryUrl'
import { sdk } from './sdk'
import { httpInterfaceId, mount, uiMultiHostId, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Pocket ID!'))

  const store = await storeJson.read().const(effects)
  if (!store) throw new Error(i18n('store.json not found'))

  const appUrl = await primaryUrl.bestUsable(effects).const()
  if (!appUrl)
    throw new Error(
      i18n(
        'Pocket ID cannot start without a primary URL. Run Set Primary URL, then start the service.',
      ),
    )

  const isPublic = await sdk.host
    .getOwn(effects, uiMultiHostId, (host) =>
      Object.values(host?.bindings ?? {})
        .flatMap((b) => Object.values(b.interfaces))
        .find((i) => i.id === httpInterfaceId)
        ?.addressInfo.filter({ visibility: 'public', kind: 'domain' })
        .hostnames.some((h) => new URL(appUrl).hostname === h.hostname),
    )
    .const()

  const bootstrapPort = 1412
  const setupUrl = `http://127.0.0.1:${bootstrapPort}/api/signup/setup`
  const env = {
    APP_URL: appUrl,
    ENCRYPTION_KEY: store.ENCRYPTION_KEY,
    TRUST_PROXY: 'true',
    ANALYTICS_DISABLED: 'true',
  }

  return sdk.Daemons.of(effects)
    .addOneshot('create-admin', {
      subcontainer: null,
      exec: {
        fn: () =>
          sdk.Daemons.of(effects)
            .addDaemon('bootstrap', {
              subcontainer: sdk.SubContainer.of(
                effects,
                { imageId: 'pocket-id' },
                mount,
                'pocket-id-bootstrap',
              ),
              exec: {
                command: sdk.useEntrypoint(),
                env: { ...env, HOST: '127.0.0.1', PORT: String(bootstrapPort) },
              },
              ready: {
                display: null,
                fn: () =>
                  sdk.healthCheck.checkPortListening(effects, bootstrapPort, {
                    successMessage: i18n('The web interface is ready'),
                    errorMessage: i18n('The web interface is not ready'),
                  }),
              },
              requires: [],
            })
            .addOneshot('setup', {
              subcontainer: null,
              exec: {
                fn: async () => {
                  const available = await fetch(setupUrl)
                  if (available.status === 404) return null
                  if (available.status !== 204)
                    throw new Error(
                      `Checking admin setup failed: ${available.status} ${await available.text()}`,
                    )
                  const res = await fetch(setupUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      username: 'admin',
                      email: `admin@${new URL(appUrl).hostname}`,
                      firstName: 'Admin',
                    }),
                  })
                  if (!res.ok)
                    throw new Error(
                      `Creating the admin account failed: ${res.status} ${await res.text()}`,
                    )
                  return null
                },
              },
              requires: ['bootstrap'],
            })
            .runUntilSuccess(120_000),
      },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer: await sdk.SubContainer.of(
        effects,
        { imageId: 'pocket-id' },
        mount,
        'pocket-id-sub',
      ),
      exec: {
        command: sdk.useEntrypoint(),
        env,
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
      requires: ['create-admin'],
    })
    .addHealthCheck('primary-url', {
      ready: {
        display: i18n('Primary URL'),
        fn: () => ({
          result: 'success',
          message: isPublic
            ? i18n(
                'Public domain. Any service that supports OIDC can sign in through it.',
              )
            : i18n(
                "Private domain. Reachable only on your LAN or VPN, and only by services that trust your server's Root CA.",
              ),
        }),
      },
      requires: [],
    })
})
