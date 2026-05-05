import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const v_2_6_2_0 = VersionInfo.of({
  version: '2.6.2:0',
  releaseNotes: {
    en_US: 'Initial release of Pocket ID for StartOS.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
