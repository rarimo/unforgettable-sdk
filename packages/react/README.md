# Unforgettable SDK React

React QR code component for [Unforgettable SDK](https://github.com/rarimo/unforgettable-sdk).
This package makes it easy to integrate identity verification into your React apps via a scannable QR code, compatible with the Unforgettable.app.

## Features

- Simple QR code component for React
- Works with [Unforgettable SDK core library](https://github.com/rarimo/unforgettable-sdk/tree/main/packages/core)
- Supports **create** and **restore** (basic & advanced verification modes)
- Built-in polling with success/error callbacks
- Fully customizable via props

## Installation

```bash
yarn add @rarimo/unforgettable-sdk-react
```

## Component: UnforgettableQrCode

This component renders a QR code inside an `<a>` tag that links to the identity creation or recovery page on Unforgettable.app.

### Props

- `mode: 'create' | 'restore'` — required field for operation type.

- `appUrl?: string` — optional App URL where you'll be redirected.

- `apiUrl?: string` — optional API URL where you can set custom link.

- `pollingInterval?: number` — optional polling interval in milliseconds (default: `5000`).

- `onSuccess?: (privateKey: string, helperData?: string[]) => void` — callback when the private key is successfully recovered.

- `onError?: (error: Error) => void` — callback when an error occurs during polling.

- `qrProps` — optional object with props passed to `QRCodeSVG` (e.g., `size`, `fgColor`, `bgColor`, `level`, etc.).

- `...rest` — any valid HTML attributes applied to the `<a>` element (e.g., `className`, `style`, `target`, etc.).

- `loader?` — element to render inside the loader container (e.g., a spinner or text) while the QR code link is being generated.

### What it does

- Generates a recovery link using `UnforgettableSdk`.
- Displays a QR code containing the link.
- Starts polling for the recovery key.
- Triggers `onSuccess` or `onError` callbacks when appropriate.

### Example usage

```tsx
<UnforgettableQrCode
  mode={'create'}
  onSuccess={key => console.log('Recovered:', key)}
  onError={error => console.error(error)}
  qrProps={{ size: 200 }}
  style={{ margin: '2rem auto', display: 'block' }}
  loader={<span>Loading...</span>}
/>
```

## Hook: useUnforgettableLink

This React hook generates a secure recovery link and handles polling for the recovered private key from the Unforgettable backend.

### Parameters

- `mode` — `'create' | 'restore'` — required field for operation type.
- `appUrl` — optional App URL.
- `apiUrl` — optional API URL.
- `pollingInterval?` — optional interval in milliseconds between polling attempts (default: `5000`).
- `onSuccess?` — callback function called with the recovered private key when successful.
- `onError?` — callback function called with an error if polling fails or the transfer is invalid.

### Returns

- A `string` containing the recovery link that can be passed to a QR code component or opened in a browser.

### What it does

- Instantiates the `UnforgettableSdk` with the provided mode.
- Generates a secure link containing the public key.
- Starts polling the backend to retrieve the encrypted recovery key.
- On success, decrypts the key and returns it via `onSuccess`.
- On failure, stops polling and triggers `onError`.

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
