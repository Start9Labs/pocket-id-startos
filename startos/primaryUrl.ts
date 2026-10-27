import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { httpInterfaceId, uiMultiHostId } from './utils'

export const primaryUrl = sdk.setupPrimaryUrl({
  id: 'set-primary-url',
  hostId: uiMultiHostId,
  interfaceId: httpInterfaceId,
  metadata: {
    name: i18n('Set Primary URL'),
    description: i18n(
      'Choose the URL Pocket ID treats as primary. This URL becomes the OIDC issuer and the WebAuthn relying-party ID — passkeys are bound to it. Changing it later invalidates every existing passkey, so this is a one-time choice.',
    ),
    warning: i18n(
      'Once users have registered passkeys, the URL cannot be changed without invalidating them.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  field: {
    name: i18n('Primary URL'),
    description: i18n(
      "Pocket ID hands this URL to OIDC clients, embeds it in invite/verification emails, and uses it as the WebAuthn relying-party identifier. Passkeys are scoped to this hostname and cannot be moved later. Only HTTPS domains are offered: a public domain works with any service; a private domain works only on your LAN or VPN, and only with services that trust your server's Root CA. If the list is empty, add a domain to the Web UI interface first.",
    ),
  },
  get: storeJson.read((s) => s.APP_URL),
  set: (effects, url) => storeJson.merge(effects, { APP_URL: url }),
  filter: { kind: 'domain' },
  ssl: true,
  fallback: false,
})
