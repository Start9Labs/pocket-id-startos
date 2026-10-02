import { T, utils } from '@start9labs/start-sdk'
import { sdk } from './sdk'

export const uiPort = 1411

export const uiMultiHostId = 'main'
export const httpInterfaceId = 'http'

export const mount = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  subpath: null,
  mountpoint: '/app/data',
  readonly: false,
})

export function getEncryptionKey() {
  return utils.getDefaultString({
    charset: 'A-Z,a-z,0-9',
    len: 44,
  })
}

export function getPrimaryUrlCandidates(effects: T.Effects) {
  return sdk.host.getOwn(effects, uiMultiHostId, (host) => {
    const domains =
      host &&
      Object.values(host.bindings)
        .flatMap((b) => Object.values(b.interfaces))
        .find((i) => i.id === httpInterfaceId)
        ?.addressInfo.filter({ kind: 'domain', predicate: (h) => h.ssl })
    return domains
      ? domains.hostnames.map((h) => ({
          url: domains.toUrl(h),
          public: h.metadata.kind === 'public-domain',
        }))
      : []
  })
}
