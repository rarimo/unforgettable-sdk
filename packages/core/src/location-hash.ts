import { ALL_RECOVERY_FACTORS, RecoveryFactor } from './constants'

export interface UnforgettablePathParams {
  dataTransferId: string
  encryptionPublicKey: string
  factors: RecoveryFactor[]
  walletAddress?: string
}

enum ParamsKey {
  DataTransferId = 'id',
  EncryptionPublicKey = 'epk',
  Factors = 'f',
  WalletAddress = 'wa',
}

export function composeUnforgettableLocationHash(params: UnforgettablePathParams): string {
  const searchParams = new URLSearchParams()

  searchParams.set(ParamsKey.DataTransferId, params.dataTransferId)
  searchParams.set(ParamsKey.EncryptionPublicKey, params.encryptionPublicKey)
  searchParams.set(ParamsKey.Factors, params.factors.join(','))
  if (params.walletAddress) {
    searchParams.set(ParamsKey.WalletAddress, params.walletAddress)
  }

  return `#${searchParams.toString()}`
}

export function parseUnforgettableLocationHash(hash: string): UnforgettablePathParams {
  const rawParams = hash.startsWith('#') ? hash.slice(1) : hash
  const searchParams = new URLSearchParams(rawParams)

  const params: UnforgettablePathParams = {
    dataTransferId: searchParams.get(ParamsKey.DataTransferId) || '',
    encryptionPublicKey: searchParams.get(ParamsKey.EncryptionPublicKey) || '',
    factors: parseFactors(searchParams.get(ParamsKey.Factors) || ''),
    walletAddress: searchParams.get(ParamsKey.WalletAddress) ?? undefined,
  }

  if (!params.dataTransferId || !params.encryptionPublicKey) {
    throw new Error('Invalid recovery path parameters')
  }

  return params
}

function parseFactors(rawFactors: string): RecoveryFactor[] {
  if (!rawFactors) return []

  return rawFactors
    .split(',')
    .filter(factor => factor !== '')
    .map(raw => {
      const num = Number(raw)
      if (!Number.isInteger(num)) throw new Error(`Recovery factor id is not an integer: "${raw}"`)
      if (!ALL_RECOVERY_FACTORS.includes(num)) throw new Error(`Invalid recovery factor id: ${num}`)
      return num
    })
}
