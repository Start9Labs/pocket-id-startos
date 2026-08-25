import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getHttpInterfaceUrls } from '../utils'
import { createInitialAdmin } from './createInitialAdmin'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  url: Value.dynamicSelect(async ({ effects }) => {
    const systemUrls = await getHttpInterfaceUrls(effects)

    return {
      name: i18n('Primary URL'),
      description: i18n(
        'Pocket ID hands this URL to OIDC clients, embeds it in invite/verification emails, and uses it as the WebAuthn relying-party identifier. Passkeys are scoped to this hostname and **cannot be moved later** — pick the URL you intend to use long-term (a public domain you control if you plan to expose Pocket ID outside the LAN).',
      ),
      warning: null,
      values: systemUrls.reduce(
        (obj, url) => ({
          ...obj,
          [url]: url,
        }),
        {} as Record<string, string>,
      ),
      default: '',
    }
  }),
})

export const setPrimaryUrl = sdk.Action.withInput(
  'set-primary-url',

  async ({ effects }) => ({
    name: i18n('Set Primary URL'),
    description: i18n(
      'Choose the URL Pocket ID treats as primary. This URL becomes the OIDC issuer and the WebAuthn relying-party ID — passkeys are bound to it. Changing it later invalidates every existing passkey, so this is a one-time choice.',
    ),
    warning: i18n(
      'Pocket ID can only be started after a primary URL is set. Once users have registered passkeys, the URL cannot be changed without invalidating them.',
    ),
    allowedStatuses: 'only-stopped',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({
    url: (await storeJson.read((s) => s.APP_URL).once()) || undefined,
  }),

  async ({ effects, input }) => {
    const previousUrl = await storeJson.read((s) => s.APP_URL).once()

    await storeJson.merge(
      effects,
      { APP_URL: input.url },
      { allowWriteAfterConst: true },
    )

    if (!previousUrl) {
      await sdk.action.createOwnTask(effects, createInitialAdmin, 'important', {
        reason: i18n(
          'Create the first Pocket ID admin user. Pocket ID requires the first user to be created from a browser so a passkey can be registered.',
        ),
      })
    }
  },
)
