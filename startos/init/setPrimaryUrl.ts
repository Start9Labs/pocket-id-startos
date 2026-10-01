import { setPrimaryUrl } from '../actions/setPrimaryUrl'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getHttpInterfaceUrls } from '../utils'

export const taskSetPrimaryUrl = sdk.setupOnInit(async (effects) => {
  const url = await storeJson.read((s) => s.APP_URL).const(effects)
  if (!url) {
    await sdk.action.createOwnTask(effects, setPrimaryUrl, 'critical', {
      reason: i18n(
        'Choose the permanent primary URL for your Pocket ID instance. Passkeys are scoped to this URL and the URL becomes the OIDC issuer — this cannot be changed later without invalidating registered passkeys.',
      ),
    })
    return
  }

  const availableUrls = await getHttpInterfaceUrls(effects)
  if (!availableUrls.includes(url)) {
    await sdk.action.createOwnTask(effects, setPrimaryUrl, 'critical', {
      reason: i18n('Primary URL removed. Select a new primary URL.'),
    })
  }
})
