export const DEFAULT_LANG = 'en_US'

const dict = {
  'Starting Pocket ID!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,
  'store.json not found': 4,
  'Web UI': 5,
  'Web interface and OIDC endpoints for Pocket ID': 6,
  'Primary URL': 7,
  'Set Primary URL': 8,
  "Pocket ID hands this URL to OIDC clients, embeds it in invite/verification emails, and uses it as the WebAuthn relying-party identifier. Passkeys are scoped to this hostname and cannot be moved later. Only HTTPS domains are offered: a public domain works with any service; a private domain works only on your LAN or VPN, and only with services that trust your server's Root CA. If the list is empty, add a domain to the Web UI interface first.": 9,
  'Choose the URL Pocket ID treats as primary. This URL becomes the OIDC issuer and the WebAuthn relying-party ID — passkeys are bound to it. Changing it later invalidates every existing passkey, so this is a one-time choice.': 10,
  'Once users have registered passkeys, the URL cannot be changed without invalidating them.': 11,
  'Sign in as the admin with a one-time login link and register your passkey.': 12,
  'Create Login Link': 13,
  'Generate a one-time link, valid for one hour, that signs a user in without a passkey. Use it to sign in as the admin for the first time, or to let anyone who has lost their passkeys back in to register a new one.': 14,
  'Pocket ID did not return a login link.': 15,
  'One-time login link': 16,
  'Open this link within one hour in a browser that can register a passkey. It signs you in once; add a passkey when Pocket ID asks.': 17,
  'Choose the permanent primary URL for your Pocket ID instance. It must be a public or private domain, so add one to the Web UI interface first. Passkeys are scoped to this URL and the URL becomes the OIDC issuer — this cannot be changed later without invalidating registered passkeys.': 18,
  'Pocket ID cannot start without a primary URL. Run Set Primary URL, then start the service.': 19,
  'Public domain. Any service that supports OIDC can sign in through it.': 20,
  "Private domain. Reachable only on your LAN or VPN, and only by services that trust your server's Root CA.": 21,
  'Username or email': 22,
  'The account to sign in as. The admin account created on first start is "admin".': 23,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
