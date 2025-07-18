import { pki } from 'node-forge'

import { UNFORGETTABLE_APP_URL } from './constants'
import { pemToBase64Url } from './utils'

export enum RecoveryType {
  Create = 'create',
  Restore = 'restore',
}

export const generateKeyPair = (bits = 2048, workers = -1) =>
  pki.rsa.generateKeyPair({
    bits,
    workers,
  })

export const generateRecoveryLink = (
  dataTransferId: string,
  publicKey: pki.rsa.PublicKey,
  recoveryType: RecoveryType,
  urlBaseLink = UNFORGETTABLE_APP_URL,
) => {
  const url = new URL(
    recoveryType === RecoveryType.Restore ? '/recovery/restore/form' : '/recovery/create/form',
    urlBaseLink,
  )

  url.searchParams.set('id', dataTransferId)
  url.searchParams.set('data-transfer-key', pemToBase64Url(pki.publicKeyToPem(publicKey)))

  return url.toString()
}
