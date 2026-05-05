import { setPrimaryUrl } from '../actions/setPrimaryUrl'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskSetPrimaryUrl = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await sdk.action.createOwnTask(effects, setPrimaryUrl, 'critical', {
      reason: i18n(
        'Choose the permanent primary URL for your Pocket ID instance. Passkeys are scoped to this URL and the URL becomes the OIDC issuer — this cannot be changed later without invalidating registered passkeys.',
      ),
    })
  }
})
