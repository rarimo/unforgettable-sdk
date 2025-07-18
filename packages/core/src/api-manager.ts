import { JsonApiClient, JsonApiClientRequestOpts } from '@distributedlab/jac'

import { UNFORGETTABLE_API_URL } from './constants'

export const api = new JsonApiClient({
  baseUrl: UNFORGETTABLE_API_URL,
})

export interface DataTransfer {
  id: string
  data: string
}

export interface DataTransferPayload {
  recovery_key: string
}

export const getDataTransfer = async (id: string, opts?: Partial<JsonApiClientRequestOpts>) => {
  return api.get<DataTransfer>(`/integrations/helper-keeper/v1/public/data-transfers/${id}`, opts)
}
