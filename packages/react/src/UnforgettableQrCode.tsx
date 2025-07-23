import { QRCodeSVG } from 'qrcode.react'
import { ComponentProps, HTMLAttributes } from 'react'

import { useUnforgettableLink, UseUnforgettableLinkOptions } from './useUnforgettableLink'

export interface UnforgettableQrCodeProps
  extends UseUnforgettableLinkOptions,
    Omit<HTMLAttributes<HTMLAnchorElement>, 'onError'> {
  qrProps?: Omit<ComponentProps<typeof QRCodeSVG>, 'value'>
}

export default function UnforgettableQrCode({
  qrProps,
  mode,
  apiUrl,
  appUrl,
  pollingInterval,
  onSuccess,
  onError,
  ...rest
}: UnforgettableQrCodeProps) {
  const unforgettableLink = useUnforgettableLink({
    mode,
    apiUrl,
    appUrl,
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
