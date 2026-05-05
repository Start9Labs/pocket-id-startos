import { sdk } from '../sdk'
import { createInitialAdmin } from './createInitialAdmin'
import { setPrimaryUrl } from './setPrimaryUrl'

export const actions = sdk.Actions.of()
  .addAction(setPrimaryUrl)
  .addAction(createInitialAdmin)
