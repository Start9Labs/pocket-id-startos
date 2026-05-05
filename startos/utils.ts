import { T } from '@start9labs/start-sdk'
import { sdk } from './sdk'
import { utils } from '@start9labs/start-sdk'

export const uiPort = 1411

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

export async function getHttpInterfaceUrls(
  effects: T.Effects,
): Promise<string[]> {
  return sdk.serviceInterface
    .getOwn(effects, httpInterfaceId, (i) => i?.addressInfo?.nonLocal.format() || [])
    .const()
}
