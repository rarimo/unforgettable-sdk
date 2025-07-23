import { NotFoundError } from '@distributedlab/jac'
import { UnforgettableSdk, UnforgettableSdkOptions } from '@rarimo/unforgettable-sdk'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface UseUnforgettableLinkOptions {
  sdkOptions: UnforgettableSdkOptions
  pollingInterval?: number
  onSuccess?: (privateKey: string) => void
  onError?: (error: Error) => void
}

export function useUnforgettableLink({
  sdkOptions,
  pollingInterval = 5000,
  onSuccess,
  onError,
}: UseUnforgettableLinkOptions) {
  const sdk = useMemo(() => new UnforgettableSdk(sdkOptions), [sdkOptions])
  const pollingIntervalRef = useRef<number>(-1)
  const [isFinished, setIsFinished] = useState(false)

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

  return sdk.recoveryUrl
}
