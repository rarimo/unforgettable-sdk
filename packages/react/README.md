# Unforgettable React SDK 

React QR code component for the [Unforgettable SDK](https://github.com/rarimo/unforgettable-sdk). Add identity verification to your React app with a scannable QR code that works with [Unforgettable.app](https://unforgettable.app).

## Features

- Simple QR code component for React
- Works with [Unforgettable SDK core library](https://github.com/rarimo/unforgettable-sdk/tree/main/packages/core)
- Supports **create** and **restore** modes
- Built-in polling with success/error callbacks
- Fully customizable via props

## Installation

```bash
yarn add @rarimo/unforgettable-sdk-react
```

## Component: UnforgettableQrCode

This component renders a QR code wrapped in an `<a>` tag that links to the identity creation or recovery page on Unforgettable.app.

### What it does

- Generates a recovery link using `UnforgettableSdk`.
- Displays a QR code containing the link.
- Starts polling for the recovery key.
- Triggers `onSuccess` or `onError` callbacks when appropriate.

### Props

- `mode: 'create' | 'restore'` — required field for operation type.
- `appUrl?: string` — optional App URL where you'll be redirected.
- `apiUrl?: string` — optional API URL where you can set custom link.
- `factors?: RecoveryFactor[]` — optional custom recovery factors.
- `walletAddress?: string` — wallet address to recover, required for `restore` mode.
- `pollingInterval?: number` — optional polling interval in milliseconds (default: `5000`).
- `onSuccess?: (privateKey: string, helperDataUrl?: string) => void` — callback when the private key is successfully restored.
- `onError?: (error: Error) => void` — callback when an error occurs during polling.
- `qrProps` — optional object with props passed to `QRCodeSVG` (e.g., `size`, `fgColor`, `bgColor`, `level`, etc.).
- `loader?` — element to render inside the loader container (e.g., a spinner or text) while the QR code link is being generated.
- `...rest` — any valid HTML attributes applied to the `<a>` element (e.g., `className`, `style`, `target`, etc.).

### Example usage

```tsx
import UnforgettableQrCode from '@rarimo/unforgettable-sdk-react'

// ...

<UnforgettableQrCode
  mode='create'
  qrProps={{ size: 200 }}
  loader={<span>Loading...</span>}
  style={{ margin: '2rem auto', display: 'block' }}
  onSuccess={key => console.log('Recovered:', key)}
  onError={error => console.error(error)}
/>
```

## Hook: useUnforgettableLink()

This React hook generates a secure recovery link and handles polling for the recovered private key from the Unforgettable backend.

### What it does

- Instantiates the `UnforgettableSdk` with the provided mode.
- Generates a secure link containing the public key.
- Starts polling the backend to retrieve the encrypted recovery key.
- On success, decrypts the key and passes it to the `onSuccess` callback.
- On failure, stops polling and fires the `onError` callback.

### Parameters

- `mode` — `'create' | 'restore'` — required field for operation type.
- `appUrl` — optional App URL.
- `apiUrl` — optional API URL.
- `factors?: RecoveryFactor[]` — optional custom recovery factors.
- `walletAddress?: string` — wallet address to recover, required for `restore` mode.
- `pollingInterval?` — optional interval in milliseconds between polling attempts (default: `5000`).
- `onSuccess?` — callback function called with the recovered private key when successful.
- `onError?` — callback function called with an error if polling fails or the transfer is invalid.

### Returns

- A `string` containing the recovery link that can be passed to a QR code component or opened in a browser.

### Example usage

```tsx
const recoveryLink = useUnforgettableLink({
  mode: 'restore',
  pollingInterval: 3000,
  onSuccess: privateKey => {
    console.log('Recovered key:', privateKey)
  },
  onError: err => {
    console.error('Polling error:', err)
  },
})
```

## License

This project is licensed under the [MIT License](./LICENSE).
