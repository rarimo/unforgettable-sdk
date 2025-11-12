import { NotFoundError } from '@distributedlab/jac'
import { UnforgettableSdk, UnforgettableSdkOptions } from '@rarimo/unforgettable-sdk'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface UseUnforgettableLinkOptions extends UnforgettableSdkOptions {
  pollingInterval?: number
  pollingDisabled?: boolean
  onSuccess?: (privateKey: string, helperDataUrl?: string) => void
  onError?: (error: Error) => void
}

export function useUnforgettableLink({
  mode,
  appUrl,
  apiUrl,
  factors,
  walletAddress,
  group,
  customParams,
  pollingInterval = 5000,
  pollingDisabled = false,
  onSuccess,
  onError,
}: UseUnforgettableLinkOptions) {
  const pollingIntervalRef = useRef<number>(-1)
  const [isFinished, setIsFinished] = useState(false)
  const [recoveryUrl, setRecoveryUrl] = useState<string | null>(null)

  const sdk = useMemo(() => {
    return new UnforgettableSdk({
      mode,
      appUrl,
      apiUrl,
      factors,
      walletAddress,
      group,
      customParams,
    })
    // Factors is an array, so we need to convert it to a string to avoid unnecessary re-creations
  }, [mode, appUrl, apiUrl, walletAddress, group, customParams, factors?.toString()])

  const processKeyRecovery = useCallback(async () => {
    try {
      const { recoveryKey, helperDataUrl } = await sdk.getRecoveredData()
      setIsFinished(true)
      window.clearInterval(pollingIntervalRef.current)
      onSuccess?.(recoveryKey, helperDataUrl)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return // Data transfer is not yet available
      }

      window.clearInterval(pollingIntervalRef.current)
      onError?.(error as Error)
    }
  }, [onSuccess, onError])

  useEffect(() => {
    if (pollingDisabled || isFinished) {
      if (pollingIntervalRef.current > -1) {
        window.clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = -1
      }
      return
    }
    const intervalId = window.setInterval(() => {
      processKeyRecovery()
    }, pollingInterval)

    pollingIntervalRef.current = intervalId

    return () => window.clearInterval(intervalId)
  }, [processKeyRecovery, isFinished, pollingInterval, pollingDisabled])

  useEffect(() => {
    const loadRecoveryUrl = async () => {
      try {
        const url = await sdk.getRecoveryUrl()
        setRecoveryUrl(url)
      } catch (error) {
        onError?.(error as Error)
      }
    }

    loadRecoveryUrl()

    return () => {
      setRecoveryUrl(null)
    }
  }, [sdk])

  return recoveryUrl
}
