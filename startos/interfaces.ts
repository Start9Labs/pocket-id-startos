import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { httpInterfaceId, uiMultiHostId, uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiMulti = sdk.MultiHost.of(effects, uiMultiHostId)
  const uiMultiOrigin = await uiMulti.bindPort(uiPort, {
    protocol: 'http',
  })
  const ui = sdk.createInterface(effects, {
    name: i18n('Web UI'),
    id: httpInterfaceId,
    description: i18n('Web interface and OIDC endpoints for Pocket ID'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
    preferredLauncherAddress:
      (await storeJson.read((s) => s.APP_URL).const(effects)) || null,
  })

  const uiReceipt = await uiMultiOrigin.export([ui])

  return [uiReceipt]
})
