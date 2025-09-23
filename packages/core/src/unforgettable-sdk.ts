import { errors, JsonApiClient } from '@distributedlab/jac'
import { v4 as uuid } from 'uuid'

import { RecoveryFactor, UNFORGETTABLE_API_URL, UNFORGETTABLE_APP_URL } from './constants'
import { composeUnforgettableLocationHash } from './location-hash'
import { DataTransferKeyPair, generateDataTransferKeyPair } from './utils'

export type UnforgettableMode = 'create' | 'restore'

export interface DataTransfer {
  id: string
  data: string
}

export interface DataTransferPayload {
  recovery_key: string
  helper_data_url?: string
}

export interface UnforgettableSdkOptions {
  mode: 'create' | 'restore'
  appUrl?: string
  apiUrl?: string
  factors?: RecoveryFactor[]
  walletAddress?: string
}

export interface RecoveredData {
  recoveryKey: string
  helperDataUrl?: string
}

export class UnforgettableSdk {
  mode: UnforgettableMode
  appUrl: string
  factors: RecoveryFactor[]
  walletAddress?: string

  #dataTransferId: string
  #encryptionKeyPairPromise: Promise<DataTransferKeyPair>
  #apiClient: JsonApiClient

  constructor(opts: UnforgettableSdkOptions) {
    this.mode = opts.mode
    this.appUrl = opts.appUrl || UNFORGETTABLE_APP_URL
    this.factors = opts.factors || []
    this.walletAddress = opts.walletAddress

    this.#apiClient = new JsonApiClient({
      baseUrl: opts.apiUrl || UNFORGETTABLE_API_URL,
    })
    this.#dataTransferId = uuid()
    this.#encryptionKeyPairPromise = generateDataTransferKeyPair()
  }

  async getRecoveryUrl() {
    const keypair = await this.#encryptionKeyPairPromise

    const url = new URL(this.mode === 'restore' ? '/r' : '/c', this.appUrl)
    url.hash = composeUnforgettableLocationHash({
      dataTransferId: this.#dataTransferId,
      encryptionPublicKey: keypair.publicKey,
      factors: this.factors,
      walletAddress: this.walletAddress,
    })

    return url.toString()
  }

  async getRecoveredData(): Promise<RecoveredData> {
    const { data } = await this.#apiClient.get<DataTransfer>(
      `/integrations/helper-keeper/v1/public/data-transfers/${this.#dataTransferId}`,
    )
    if (!data) throw errors.NotFoundError

    const keypair = await this.#encryptionKeyPairPromise
    const { recovery_key, helper_data_url }: DataTransferPayload = JSON.parse(data.data)

    return {
      recoveryKey: keypair.decrypt(recovery_key),
      helperDataUrl: helper_data_url,
    }
  }

  async getRecoveredKey(): Promise<string> {
    const recoveredData = await this.getRecoveredData()
    return recoveredData.recoveryKey
  }
}
