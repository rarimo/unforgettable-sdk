# Unforgettable SDK

A TypeScript/JavaScript library for integrating Unforgettable account recovery into your web applications.

## Installation

### npm

```bash
npm install @rarimo/unforgettable-sdk
```

### yarn

```bash
yarn add @rarimo/unforgettable-sdk
```

### pnpm

```bash
pnpm add @rarimo/unforgettable-sdk
```

## Usage

### Creating a Recovery URL

```typescript
import { UnforgettableSdk, RecoveryFactor } from '@rarimo/unforgettable-sdk'

const sdk = new UnforgettableSdk({
  mode: 'create',
  factors: [RecoveryFactor.Face, RecoveryFactor.Image, RecoveryFactor.Password],
  walletAddress: '0x1234567890abcdef',
  group: 'my-organization', // Optional
  customParams: { theme: 'dark', lang: 'en' } // Optional
})

const recoveryUrl = await sdk.getRecoveryUrl()
console.log('Recovery URL:', recoveryUrl)
```

### Restoring an Account

```typescript
import { UnforgettableSdk, RecoveryFactor, NotFoundError } from '@rarimo/unforgettable-sdk'

const sdk = new UnforgettableSdk({
  mode: 'restore',
  walletAddress: '0x1234...abcd',
  factors: [RecoveryFactor.Face, RecoveryFactor.Password]
})

const recoveryUrl = await sdk.getRecoveryUrl()

// After the user completes the recovery process...
try {
  const recoveredData = await sdk.getRecoveredData()
  console.log('Recovery Key:', recoveredData.recoveryKey)
  
  if (recoveredData.helperDataUrl) {
    console.log('Helper Data URL:', recoveredData.helperDataUrl)
  }
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Data not ready yet, try again later')
  } else {
    console.error('Error during recovery:', error)
  }
}
```

### Available Recovery Factors

```typescript
enum RecoveryFactor {
  Face = 1,
  Image = 2,
  Password = 3
}
```

## API

### `UnforgettableSdk`

The main SDK class.

#### Constructor

```typescript
new UnforgettableSdk(options: UnforgettableSdkOptions)
```

**Parameters:**
- `options`: Configuration options for the SDK

#### Methods

##### `getRecoveryUrl()`

Generates the recovery URL to present to the user.

```typescript
async getRecoveryUrl(): Promise<string>
```

**Returns:** The recovery URL as a string

##### `getRecoveredData()`

Retrieves the recovered data from the API.

```typescript
async getRecoveredData(): Promise<RecoveredData>
```

**Returns:** The recovered data including the recovery key and optional helper data URL

**Throws:** `NotFoundError` if data is not ready yet, or other errors on failure

##### `getRecoveredKey()`

Retrieves only the recovered key.

```typescript
async getRecoveredKey(): Promise<string>
```

**Returns:** The recovered key as a string

**Throws:** `NotFoundError` if data is not ready yet, or other errors on failure

### `UnforgettableSdkOptions`

Configuration options for the SDK.

```typescript
interface UnforgettableSdkOptions {
  mode: 'create' | 'restore'
  appUrl?: string // Default: 'https://unforgettable.app'
  apiUrl?: string // Default: 'https://api.unforgettable.app'
  factors?: RecoveryFactor[]
  walletAddress?: string
  group?: string
  customParams?: Record<string, string>
}
```

**Parameters:**
- `mode`: Either `'create'` or `'restore'`
- `appUrl`: The Unforgettable app URL (default: `https://unforgettable.app`)
- `apiUrl`: The Unforgettable API URL (default: `https://api.unforgettable.app`)
- `factors`: Optional list of recovery factors to use
- `walletAddress`: Wallet address to associate with the recovery (required for `restore` mode)
- `group`: Optional group identifier for organizing recovery keys
- `customParams`: Optional custom URL parameters to pass to the recovery app

### Error Types

#### `NotFoundError`

Thrown when recovery data is not yet available:

```typescript
import { NotFoundError } from '@rarimo/unforgettable-sdk'

try {
  const key = await sdk.getRecoveredKey()
} catch (error) {
  if (error instanceof NotFoundError) {
    // Data not ready, poll again later
  }
}
```

## Polling for Recovery

The SDK does not automatically poll for recovery completion. You need to implement polling yourself:

```typescript
async function pollForRecovery(sdk: UnforgettableSdk, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const recoveredKey = await sdk.getRecoveredKey()
      console.log('Recovery successful:', recoveredKey)
      return recoveredKey
    } catch (error) {
      if (error instanceof NotFoundError) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        continue
      }
      throw error
    }
  }
  throw new Error('Recovery timeout')
}
```

## Requirements

- Node.js 18+ or modern browser with Web Crypto API support
- TypeScript 5.0+ (optional but recommended)

## License

MIT License - see LICENSE file for details

## Homepage

[https://unforgettable.app](https://unforgettable.app)
