import { QRCodeSVG } from 'qrcode.react'
import { ComponentProps, HTMLAttributes } from 'react'

import { useUnforgettableLink, UseUnforgettableLinkOptions } from './useUnforgettableLink'

export interface UnforgettableQrCodeProps
  extends Omit<HTMLAttributes<HTMLAnchorElement>, 'onError'> {
  qrProps?: Omit<ComponentProps<typeof QRCodeSVG>, 'value'>
  unforgettableLinkOptions: UseUnforgettableLinkOptions
}

export default function UnforgettableQrCode({
  qrProps,
  unforgettableLinkOptions,
  ...rest
}: UnforgettableQrCodeProps) {
  const unforgettableLink = useUnforgettableLink(unforgettableLinkOptions)

  return (
    <a href={unforgettableLink} target='_blank' rel='noopener noreferrer' {...rest}>
      <QRCodeSVG value={unforgettableLink} {...qrProps} />
    </a>
  )
}
