import { primaryUrl } from '../primaryUrl'
import { sdk } from '../sdk'
import { createLoginLink } from './createLoginLink'

export const actions = sdk.Actions.of()
  .addAction(primaryUrl.action)
  .addAction(createLoginLink)
