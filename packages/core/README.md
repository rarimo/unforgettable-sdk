# Unforgettable SDK

`Unforgettable SDK` is a secure client-side toolkit used for key exchange and recovery within the [Unforgettable.app](https://unforgettable.app) ecosystem. It allows you to generate secure links to Unforgettable.app and retrieve a private key recovered from the specified factors.

---

## 📦 Installation

```bash
yarn add @rarimo/unforgettable-sdk
```

## Usage

### Create recovery key

1. Create a new SDK instance:

```ts
import { UnforgettableSdk, RecoveryFactor } from '@rarimo/unforgettable-sdk'

const sdk = new UnforgettableSdk({
  // 'create' for creating a new key, 'restore' for recovering an existing one
  mode: 'create',
  // Optional, defaults to 'https://unforgettable.app'
  appUrl: 'https://custom.app',
  // Optional, defaults to 'https://api.unforgettable.app'
  apiUrl: 'https://api.custom.app',
  // Factors to use for recovery. If not provided, the user will select them during the recovery process.
  factors: [RecoveryFactor.Face, RecoveryFactor.Image, RecoveryFactor.Password]
})
```

2. Generate a secure recovery URL to share:

```ts
const recoveryUrl = await sdk.getRecoveryUrl()
// You can now share this URL or display it as a QR code.
// This is a direct link to Unforgettable.app with embedded necessary query parameters.
console.log('Recovery URL:', recoveryUrl)
```

3. Get the recovered key and helper data URL:

```ts
try {
  const recoveryKey = await sdk.getRecoveredKey()
  // This is the recovered Unforgettable private key.
  // You can now create a wallet with it.
  console.log('Recovered key:', recoveryKey)
} catch (error) {
  if (error?.httpStatus === 404) {
    // No recovery data found yet, try again later
   } else {
    console.error('Recovery error:', error)
   }
}
```

### Restore existing key

1. Create a new SDK instance with the wallet address:

```ts
import { UnforgettableSdk, RecoveryFactor } from '@rarimo/unforgettable-sdk'

const sdk = new UnforgettableSdk({
  mode: 'restore',
  walletAddress: '0x1234...abcd', // The wallet address associated with the key to recover
  appUrl: 'https://custom.app', // Optional
  apiUrl: 'https://api.custom.app', // Optional
  factors: [RecoveryFactor.Face, RecoveryFactor.Image, RecoveryFactor.Password] // Optional
})
```

2. Generate a secure recovery URL to share:

```ts
const recoveryUrl = await sdk.getRecoveryUrl()
console.log('Recovery URL:', recoveryUrl)
```

3. Get the recovered key:

```ts
try {
  const recoveryKey = await sdk.getRecoveredKey()
  console.log('Recovered key:', recoveryKey)
} catch (error) {
  if (error?.httpStatus === 404) {
    // No recovery data found yet, try again later
   } else {
    console.error('Recovery error:', error)
   }
}
```

## License

This project is licensed under the [MIT License](./LICENSE).
