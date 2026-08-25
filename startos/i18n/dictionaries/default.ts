export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Pocket ID!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,
  'store.json not found': 4,

  // interfaces.ts
  'Web UI': 5,
  'Web interface and OIDC endpoints for Pocket ID': 6,

  // actions/setPrimaryUrl.ts
  'Primary URL': 7,
  'Set Primary URL': 8,
  'Pocket ID hands this URL to OIDC clients, embeds it in invite/verification emails, and uses it as the WebAuthn relying-party identifier. Passkeys are scoped to this hostname and **cannot be moved later** — pick the URL you intend to use long-term (a public domain you control if you plan to expose Pocket ID outside the LAN).': 9,
  'Choose the URL Pocket ID treats as primary. This URL becomes the OIDC issuer and the WebAuthn relying-party ID — passkeys are bound to it. Changing it later invalidates every existing passkey, so this is a one-time choice.': 10,
  'Pocket ID can only be started after a primary URL is set. Once users have registered passkeys, the URL cannot be changed without invalidating them.': 11,
  'Create the first Pocket ID admin user. Pocket ID requires the first user to be created from a browser so a passkey can be registered.': 12,

  // actions/createInitialAdmin.ts
  'Create First Admin User': 13,
  'Pocket ID requires its first user to be created from a browser so a passkey can be registered against the primary URL. This action gives you the URL to visit; the upstream Pocket ID UI walks you through choosing a username, email, and registering a passkey.': 14,
  'Primary URL is not set — run "Set Primary URL" first.': 15,
  'Create your first Pocket ID admin': 16,
  'Open the URL below in a browser that can register a passkey. The Pocket ID setup page will prompt you for a username, email, first/last name, and to register a passkey. After this completes, dismiss this task and use the same URL to invite/manage further users.': 17,

  // init/setPrimaryUrl.ts
  'Choose the permanent primary URL for your Pocket ID instance. Passkeys are scoped to this URL and the URL becomes the OIDC issuer — this cannot be changed later without invalidating registered passkeys.': 18,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
