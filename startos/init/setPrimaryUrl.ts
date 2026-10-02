import { setPrimaryUrl } from '../actions/setPrimaryUrl'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getPrimaryUrlCandidates } from '../utils'

export const taskSetPrimaryUrl = sdk.setupOnInit(async (effects) => {
  const url = await storeJson.read((s) => s.APP_URL).const(effects)
  if (!url) {
    await sdk.action.createOwnTask(effects, setPrimaryUrl, 'critical', {
      reason: i18n(
        'Choose the permanent primary URL for your Pocket ID instance. It must be a public or private domain, so add one to the Web UI interface first. Passkeys are scoped to this URL and the URL becomes the OIDC issuer — this cannot be changed later without invalidating registered passkeys.',
      ),
    })
    return
  }

  const candidates = await getPrimaryUrlCandidates(effects).const()
  if (!candidates.some((c) => c.url === url)) {
    await sdk.action.createOwnTask(effects, setPrimaryUrl, 'critical', {
      reason: i18n('Primary URL removed. Select a new primary URL.'),
    })
  }
})
