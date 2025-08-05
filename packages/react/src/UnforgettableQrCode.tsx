import { QRCodeSVG } from 'qrcode.react'
import { ComponentProps, HTMLAttributes, ReactNode } from 'react'

import { useUnforgettableLink, UseUnforgettableLinkOptions } from './useUnforgettableLink'

export interface UnforgettableQrCodeProps
  extends UseUnforgettableLinkOptions,
    Omit<HTMLAttributes<HTMLAnchorElement>, 'onError'> {
  qrProps?: Omit<ComponentProps<typeof QRCodeSVG>, 'value'>
  loader?: ReactNode
}

export default function UnforgettableQrCode({
  qrProps,
  mode,
  apiUrl,
  appUrl,
  pollingInterval,
  onSuccess,
  onError,
  loader,
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

  if (!unforgettableLink) {
    return (
      loader ?? (
        <QRCodeSVG
          value='Loading...'
          {...qrProps}
          style={{
            ...qrProps?.style,
            opacity: 0.3,
            filter: 'blur(4px)',
          }}
        />
      )
    )
  }

  return (
    <a href={unforgettableLink} target='_blank' rel='noopener noreferrer' {...rest}>
      <QRCodeSVG value={unforgettableLink} {...qrProps} />
    </a>
  )
}
