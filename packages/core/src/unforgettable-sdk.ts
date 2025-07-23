import { errors, JsonApiClient } from '@distributedlab/jac'
import { pki } from 'node-forge'
import { v4 as uuid } from 'uuid'

import { UNFORGETTABLE_API_URL, UNFORGETTABLE_APP_URL } from './constants'
import { pemToBase64Url } from './utils'

export type UnforgettableMode = 'create' | 'restore'

export interface DataTransfer {
  id: string
  data: string
}

export interface DataTransferPayload {
  recovery_key: string
}

export interface UnforgettableSdkOptions {
  mode: 'create' | 'restore'
  appUrl?: string
  apiUrl?: string
}

export class UnforgettableSdk {
  mode: UnforgettableMode
  appUrl: string

  #dataTransferId: string
  #encryptionKeyPair: pki.rsa.KeyPair
  #apiClient: JsonApiClient

  constructor(opts: UnforgettableSdkOptions) {
    const { mode, appUrl, apiUrl } = opts
    this.mode = mode
    this.appUrl = appUrl || UNFORGETTABLE_APP_URL
    this.#apiClient = new JsonApiClient({
      baseUrl: apiUrl || UNFORGETTABLE_API_URL,
    })
    this.#dataTransferId = uuid()
    this.#encryptionKeyPair = this.generateKeyPair()
  }

  get recoveryUrl() {
    const url = new URL(this.mode === 'restore' ? '/r' : '/c', this.appUrl)
    url.hash = `#${this.#dataTransferId}&${pemToBase64Url(pki.publicKeyToPem(this.#encryptionKeyPair.publicKey))}`
    return url.toString()
  }

  generateKeyPair = (bits = 2048, workers = -1) =>
    pki.rsa.generateKeyPair({
      bits,
      workers,
    })

  async getRecoveredKey(): Promise<string> {
    const { data } = await this.#apiClient.get<DataTransfer>(
      `/integrations/helper-keeper/v1/public/data-transfers/${this.#dataTransferId}`,
    )
    if (!data) throw errors.NotFoundError

    const { recovery_key: encryptedRecoveryKey } = JSON.parse(data.data) as DataTransferPayload
    return this.#encryptionKeyPair.privateKey.decrypt(encryptedRecoveryKey)
  }
}
