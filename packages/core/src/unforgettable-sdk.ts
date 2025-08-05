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
  #encryptionKeyPairPromise: Promise<pki.rsa.KeyPair>
  #apiClient: JsonApiClient

  constructor(opts: UnforgettableSdkOptions) {
    const { mode, appUrl, apiUrl } = opts
    this.mode = mode
    this.appUrl = appUrl || UNFORGETTABLE_APP_URL
    this.#apiClient = new JsonApiClient({
      baseUrl: apiUrl || UNFORGETTABLE_API_URL,
    })
    this.#dataTransferId = uuid()
    this.#encryptionKeyPairPromise = this.generateKeyPair()
  }

  async getRecoveryUrl() {
    const url = new URL(this.mode === 'restore' ? '/r' : '/c', this.appUrl)
    const keypair = await this.#encryptionKeyPairPromise
    url.hash = `#${this.#dataTransferId}&${pemToBase64Url(pki.publicKeyToPem(keypair.publicKey))}`
    return url.toString()
  }

  private generateKeyPair = (bits = 2048) => {
    return new Promise<pki.rsa.KeyPair>((resolve, reject) => {
      pki.rsa.generateKeyPair({ bits }, (err, keypair) => {
        if (err) return reject(err)
        resolve(keypair)
      })
    })
  }

  async getRecoveredKey(): Promise<string> {
    const { data } = await this.#apiClient.get<DataTransfer>(
      `/integrations/helper-keeper/v1/public/data-transfers/${this.#dataTransferId}`,
    )
    if (!data) throw errors.NotFoundError

    const keypair = await this.#encryptionKeyPairPromise

    const { recovery_key: encryptedRecoveryKey } = JSON.parse(data.data) as DataTransferPayload
    return keypair.privateKey.decrypt(encryptedRecoveryKey)
  }
}
