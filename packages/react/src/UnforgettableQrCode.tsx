import { QRCodeSVG } from 'qrcode.react'
import { ComponentProps, HTMLAttributes, ReactNode } from 'react'

import { useUnforgettableLink, UseUnforgettableLinkOptions } from './useUnforgettableLink'

export interface UnforgettableQrCodeProps
  extends UseUnforgettableLinkOptions,
    Omit<HTMLAttributes<HTMLAnchorElement>, 'onError'> {
  qrProps?: Omit<ComponentProps<typeof QRCodeSVG>, 'value'>
  loader?: ReactNode
  loaderContainerProps?: HTMLAttributes<HTMLDivElement>
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
  loaderContainerProps,
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
    const { style: styles, ...rest } = loaderContainerProps || {}

    return (
      <div
        {...rest}
        style={{
          width: qrProps?.width ?? 200,
          height: qrProps?.height ?? 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...styles,
        }}
      >
        {loader}
      </div>
    )
  }

  return (
    <a href={unforgettableLink} target='_blank' rel='noopener noreferrer' {...rest}>
      <QRCodeSVG value={unforgettableLink} {...qrProps} />
    </a>
  )
}
