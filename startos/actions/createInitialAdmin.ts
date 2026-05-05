import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const createInitialAdmin = sdk.Action.withoutInput(
  'create-initial-admin',

  async () => ({
    name: i18n('Create First Admin User'),
    description: i18n(
      'Pocket ID requires its first user to be created from a browser so a passkey can be registered against the primary URL. This action gives you the URL to visit; the upstream Pocket ID UI walks you through choosing a username, email, and registering a passkey.',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'hidden',
  }),

  async ({ effects }) => {
    const appUrl = await storeJson.read((s) => s.APP_URL).const(effects)
    if (!appUrl) {
      throw new Error(
        i18n('Primary URL is not set — run "Set Primary URL" first.'),
      )
    }

    return {
      version: '1' as const,
      title: i18n('Create your first Pocket ID admin'),
      message: i18n(
        'Open the URL below in a browser that can register a passkey. The Pocket ID setup page will prompt you for a username, email, first/last name, and to register a passkey. After this completes, dismiss this task and use the same URL to invite/manage further users.',
      ),
      result: {
        type: 'single' as const,
        value: `${appUrl}/setup`,
        copyable: true,
        masked: false,
        qr: true,
      },
    }
  },
)
