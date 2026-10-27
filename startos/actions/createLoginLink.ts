import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { primaryUrl } from '../primaryUrl'
import { sdk } from '../sdk'
import { mount } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  user: Value.text({
    name: i18n('Username or email'),
    description: i18n(
      'The account to sign in as. The admin account created on first start is "admin".',
    ),
    default: 'admin',
    required: true,
  }),
})

export const createLoginLink = sdk.Action.withInput(
  'create-login-link',

  async () => ({
    name: i18n('Create Login Link'),
    description: i18n(
      'Generate a one-time link, valid for one hour, that signs a user in without a passkey. Use it to sign in as the admin for the first time, or to let anyone who has lost their passkeys back in to register a new one.',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async () => ({ user: 'admin' }),

  async ({ effects, input }) => {
    const { stdout } = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'pocket-id' },
      mount,
      'create-login-link',
      async (sub) =>
        sub.execFail(
          [
            '/app/docker/entrypoint.sh',
            '/app/pocket-id',
            'one-time-access-token',
            input.user,
          ],
          {
            env: {
              APP_URL: (await primaryUrl.bestUsable(effects).once()) ?? '',
              ENCRYPTION_KEY: (await storeJson
                .read((s) => s.ENCRYPTION_KEY)
                .once())!,
            },
          },
        ),
    )
    const link = String(stdout).match(/\S+\/lc\/\S+/)?.[0]
    if (!link) throw new Error(i18n('Pocket ID did not return a login link.'))

    return {
      version: '1',
      title: i18n('One-time login link'),
      message: i18n(
        'Open this link within one hour in a browser that can register a passkey. It signs you in once; add a passkey when Pocket ID asks.',
      ),
      result: {
        type: 'single',
        value: link,
        copyable: true,
        masked: true,
        qr: true,
        launchable: true,
      },
    }
  },
)
