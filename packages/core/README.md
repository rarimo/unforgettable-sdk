# Unforgettable SDK

`UnforgettableSdk` is a secure client-side toolkit used for key exchange and recovery within the [Unforgettable.app](https://unforgettable.app) ecosystem. It allows you to generate protected recovery links and retrieve encrypted secrets using a private RSA key pair.

---

## 📦 Installation

```bash
yarn add @rarimo/unforgettable-sdk
```

## Usage

### Quick Start

```ts
import { UnforgettableSdk } from '@rarimo/unforgettable-sdk'

// Initialize SDK in "create" or "restore" mode
const sdk = new UnforgettableSdk({ mode: 'create' })

// Generate a secure recovery URL to share
const recoveryUrl = await sdk.getRecoveryUrl()
console.log('Recovery URL:', recoveryUrl)

// Later: recover the secret key
const recoveredKey = await sdk.getRecoveredKey()
console.log('Recovered Key:', recoveredKey)
```

## Security Notes

- RSA keys are generated entirely on the client.
- The private key never leaves the client environment.
- Only the public key is sent in the URL (encoded in base64url).
- Cryptographic operations use

## License

This project is licensed under the [MIT License](./LICENSE).
