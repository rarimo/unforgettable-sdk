import { NotFoundError } from '@distributedlab/jac'
import { UnforgettableSdk, UnforgettableSdkOptions } from '@rarimo/unforgettable-sdk'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface UseUnforgettableLinkOptions extends UnforgettableSdkOptions {
  pollingInterval?: number
  onSuccess?: (privateKey: string) => void
  onError?: (error: Error) => void
}

export function useUnforgettableLink({
  mode,
  appUrl,
  apiUrl,
  pollingInterval = 5000,
  onSuccess,
  onError,
}: UseUnforgettableLinkOptions) {
  const sdk = useMemo(() => new UnforgettableSdk({ mode, appUrl, apiUrl }), [mode, appUrl, apiUrl])
  const pollingIntervalRef = useRef<number>(-1)
  const [isFinished, setIsFinished] = useState(false)
  const [recoveryUrl, setRecoveryUrl] = useState<string | null>(null)

  const processKeyRecovery = useCallback(async () => {
    try {
      const privateKey = await sdk.getRecoveredKey()
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
  }, [onSuccess, onError])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (!isFinished) processKeyRecovery()
    }, pollingInterval)

    pollingIntervalRef.current = intervalId

    return () => window.clearInterval(intervalId)
  }, [processKeyRecovery, isFinished, pollingInterval])

  useEffect(() => {
    let isInitialized = true
    const loadRecoveryUrl = async () => {
      try {
        const url = await sdk.getRecoveryUrl()
        if (isInitialized) setRecoveryUrl(url)
      } catch (error) {
        onError?.(error as Error)
      }
    }

    loadRecoveryUrl()

    return () => {
      isInitialized = false
    }
  }, [])

  return recoveryUrl
}
