import { sdk } from '../sdk'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { i18n } from '../i18n'
import { primaryUrl } from '../primaryUrl'
import { seedFiles } from './seedFiles'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedFiles,
  setInterfaces,
  actions,
  dependencies,
  primaryUrl.setupTask('critical', {
    reason: i18n(
      'Choose the permanent primary URL for your Pocket ID instance. It must be a public or private domain, so add one to the Web UI interface first. Passkeys are scoped to this URL and the URL becomes the OIDC issuer — this cannot be changed later without invalidating registered passkeys.',
    ),
  }),
)

export const uninit = sdk.setupUninit(versionGraph)
