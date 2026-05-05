import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getHttpInterfaceUrls } from '../utils'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  url: Value.dynamicSelect(async ({ effects }) => {
    const systemUrls = await getHttpInterfaceUrls(effects)

    return {
      name: i18n('URL'),
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
      'Choose which of your Pocket ID URLs is the primary one. Pocket ID hands this URL to OIDC clients, embeds it in emails, and uses it for WebAuthn relying-party identification — passkeys are scoped to this hostname, so changing it will invalidate existing passkeys.',
    ),
    warning: i18n(
      'Changing the primary URL after users have registered passkeys will invalidate those passkeys. They will need to be re-registered against the new URL.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({
    url: (await storeJson.read((s) => s.APP_URL).once()) || undefined,
  }),

  async ({ effects, input }) =>
    storeJson.merge(effects, { APP_URL: input.url }),
)
