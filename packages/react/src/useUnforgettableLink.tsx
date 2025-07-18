import { NotFoundError } from '@distributedlab/jac'
import {
  DataTransferPayload,
  generateKeyPair,
  generateRecoveryLink,
  getDataTransfer,
  RecoveryType,
} from '@rarimo/unforgettable-sdk'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'

export interface UseUnforgettableLinkOptions {
  recoveryType: RecoveryType
  pollingInterval?: number
  onSuccess?: (privateKey: string) => void
  onError?: (error: Error) => void
}

export function useUnforgettableLink({
  recoveryType,
  pollingInterval = 5000,
  onSuccess,
  onError,
}: UseUnforgettableLinkOptions) {
  const [isFinished, setIsFinished] = useState(false)
  const pollingIntervalRef = useRef<number>(-1)

  const dataTransferId = useMemo(() => uuid(), [])
  const encryptionKeyPair = useMemo(() => generateKeyPair(), [])

  const unforgettableLink = useMemo(
    () => generateRecoveryLink(dataTransferId, encryptionKeyPair.publicKey, recoveryType),
    [dataTransferId, encryptionKeyPair, recoveryType],
  )

  const processKeyRecovery = useCallback(async () => {
    try {
      const { data } = await getDataTransfer(dataTransferId)
      if (!data) return

      const { recovery_key: encryptedRecoveryKey } = JSON.parse(data.data) as DataTransferPayload
      const privateKey = encryptionKeyPair.privateKey.decrypt(encryptedRecoveryKey)

      setIsFinished(true)
      window.clearInterval(pollingIntervalRef.current)
      onSuccess?.(privateKey)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return // Data transfer is not yet available
      }

      window.clearInterval(pollingIntervalRef.current)
      onError?.(error as Error)
    }
  }, [dataTransferId, encryptionKeyPair, onSuccess, onError])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (!isFinished) processKeyRecovery()
    }, pollingInterval)

    pollingIntervalRef.current = intervalId

    return () => window.clearInterval(intervalId)
  }, [processKeyRecovery, isFinished, pollingInterval])

  return {
    unforgettableLink,
    isFinished,
  }
}
