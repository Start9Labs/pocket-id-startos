import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

const dockerImage = 'ghcr.io/pocket-id/pocket-id'
const dockerVersion = 'v2.6.2'

export const manifest = setupManifest({
  id: 'pocket-id',
  title: 'Pocket ID',
  license: 'BSD-2-Clause',
  packageRepo: 'https://github.com/Start9Labs/pocket-id-startos',
  upstreamRepo: 'https://github.com/pocket-id/pocket-id',
  marketingUrl: 'https://pocket-id.org/',
  donationUrl: null,
  docsUrls: ['https://pocket-id.org/docs/introduction'],
  description: { short, long },
  volumes: ['main'],
  images: {
    'pocket-id': {
      source: { dockerTag: `${dockerImage}:${dockerVersion}` },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
