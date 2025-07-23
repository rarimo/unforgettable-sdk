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

export class UnforgettableSdk {
  mode: UnforgettableMode
  appUrl: string

  #dataTransferId: string
  #encryptionKeyPair: pki.rsa.KeyPair
  #apiClient: JsonApiClient

  constructor(opts: { mode: 'create' | 'restore'; appUrl?: string; apiUrl?: string }) {
    this.mode = opts.mode
    this.appUrl = opts.appUrl || UNFORGETTABLE_APP_URL
    this.#apiClient = new JsonApiClient({
      baseUrl: opts.apiUrl || UNFORGETTABLE_API_URL,
    })
    this.#dataTransferId = uuid()
    this.#encryptionKeyPair = this.generateKeyPair()
  }

  get recoveryUrl() {
    const url = new URL(
      this.mode === 'restore' ? '/recovery/restore/form' : '/recovery/create/form',
      this.appUrl,
    )

    url.searchParams.set('id', this.#dataTransferId)
    url.searchParams.set(
      'data-transfer-key',
      pemToBase64Url(pki.publicKeyToPem(this.#encryptionKeyPair.publicKey)),
    )

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
