import { RecoveryType } from '@rarimo/unforgettable-sdk'
import { QRCodeSVG } from 'qrcode.react'
import { ComponentProps, HTMLAttributes } from 'react'

import { useUnforgettableLink } from './useUnforgettableLink'

export interface UnforgettableQrCodeProps
  extends Omit<HTMLAttributes<HTMLAnchorElement>, 'onError'> {
  recoveryType: RecoveryType
  pollingInterval?: number
  qrProps?: Omit<ComponentProps<typeof QRCodeSVG>, 'value'>
  onSuccess?: (privateKey: string) => void
  onError?: (error: Error) => void
}

export default function UnforgettableQrCode({
  recoveryType,
  pollingInterval = 5000,
  qrProps,
  onSuccess,
  onError,
  ...rest
}: UnforgettableQrCodeProps) {
  const { unforgettableLink } = useUnforgettableLink({
    recoveryType,
    pollingInterval,
    onSuccess,
    onError,
  })

  return (
    <a href={unforgettableLink} target='_blank' rel='noopener noreferrer' {...rest}>
      <QRCodeSVG value={unforgettableLink} {...qrProps} />
    </a>
  )
}
