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
  URL: 7,
  'Set Primary URL': 8,
  'Choose which of your Pocket ID URLs is the primary one. Pocket ID hands this URL to OIDC clients, embeds it in emails, and uses it for WebAuthn relying-party identification — passkeys are scoped to this hostname, so changing it will invalidate existing passkeys.': 9,
  'Changing the primary URL after users have registered passkeys will invalidate those passkeys. They will need to be re-registered against the new URL.': 10,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
