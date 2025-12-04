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
}

export interface UnforgettableSdkOptions {
  mode: 'create' | 'restore'
  appUrl?: string
  apiUrl?: string
  factors?: RecoveryFactor[]
  walletAddress?: string
  group?: string
  customParams?: Record<string, string>
}

export interface RecoveredData {
  recoveryKey: string
}

export class UnforgettableSdk {
  mode: UnforgettableMode
  appUrl: string
  factors: RecoveryFactor[]
  walletAddress?: string
  group?: string
  customParams?: Record<string, string>

  #dataTransferId: string
  #encryptionKeyPairPromise: Promise<DataTransferKeyPair>
  #apiClient: JsonApiClient

  constructor(opts: UnforgettableSdkOptions) {
    this.mode = opts.mode
    this.appUrl = opts.appUrl || UNFORGETTABLE_APP_URL
    this.factors = opts.factors || []
    this.walletAddress = opts.walletAddress
    this.group = opts.group
    this.customParams = opts.customParams

    this.#apiClient = new JsonApiClient({
      baseUrl: opts.apiUrl || UNFORGETTABLE_API_URL,
    })
    this.#dataTransferId = uuid()
    this.#encryptionKeyPairPromise = generateDataTransferKeyPair()
  }

  async getRecoveryUrl() {
    const keypair = await this.#encryptionKeyPairPromise

    const baseUrl = this.appUrl.endsWith('/') ? this.appUrl.slice(0, -1) : this.appUrl
    const path = this.mode === 'restore' ? '/r' : '/c'

    const url = new URL(baseUrl + path)

    url.hash = composeUnforgettableLocationHash({
      dataTransferId: this.#dataTransferId,
      encryptionPublicKey: keypair.publicKey,
      factors: this.factors,
      walletAddress: this.walletAddress,
      group: this.group,
      customParams: this.customParams,
    })

    return url.toString()
  }

  async getRecoveredData(): Promise<RecoveredData> {
    const { data } = await this.#apiClient.get<DataTransfer>(
      `/integrations/helper-keeper/v1/public/data-transfers/${this.#dataTransferId}`,
    )
    if (!data) throw errors.NotFoundError

    const keypair = await this.#encryptionKeyPairPromise
    const { recovery_key }: DataTransferPayload = JSON.parse(data.data)

    return {
      recoveryKey: keypair.decrypt(recovery_key),
    }
  }

  async getRecoveredKey(): Promise<string> {
    const recoveredData = await this.getRecoveredData()
    return recoveredData.recoveryKey
  }
}
