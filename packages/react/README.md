# Unforgettable SDK for React

A React library with QR code component and hooks for integrating Unforgettable account recovery into your React applications.

## Installation

### npm

```bash
npm install @rarimo/unforgettable-sdk-react
```

### yarn

```bash
yarn add @rarimo/unforgettable-sdk-react
```

### pnpm

```bash
pnpm add @rarimo/unforgettable-sdk-react
```

## Usage

### QR Code Component

The `UnforgettableQrCode` component renders a QR code that users can scan to complete the recovery process.

```tsx
import UnforgettableQrCode from '@rarimo/unforgettable-sdk-react'
import { RecoveryFactor } from '@rarimo/unforgettable-sdk'

function App() {
  return (
    <UnforgettableQrCode
      mode="create"
      factors={[RecoveryFactor.Face, RecoveryFactor.Password]}
      group="my-app"
      // walletAddress="0x1234567890abcdef" // Required for 'restore' mode
      qrProps={{ size: 300 }}
      onSuccess={(privateKey) => {
        console.log('Recovery successful!')
        console.log('Private Key:', privateKey)
      }}
      onError={(error) => {
        console.error('Recovery failed:', error)
      }}
    />
  )
}
```

### Using the Hook

The `useUnforgettableLink` hook provides more control over the recovery process:

```tsx
import { useUnforgettableLink } from '@rarimo/unforgettable-sdk-react'
import { RecoveryFactor } from '@rarimo/unforgettable-sdk'
import { QRCodeSVG } from 'qrcode.react'

function RecoverySetup() {
  const recoveryLink = useUnforgettableLink({
    mode: 'create',
    factors: [RecoveryFactor.Face, RecoveryFactor.Password],
    group: 'my-app',
    // walletAddress="0x1234567890abcdef" // Required for 'restore' mode
    pollingInterval: 3000,
    onSuccess: (privateKey) => {
      console.log('Recovered key:', privateKey)
    },
    onError: (error) => {
      console.error('Error:', error)
    }
  })

  return (
    <div>
      {recoveryLink ? (
        <a href={recoveryLink} target="_blank" rel="noopener noreferrer">
          <QRCodeSVG value={recoveryLink} size={256} />
        </a>
      ) : (
        <p>Generating recovery link...</p>
      )}
    </div>
  )
}
```

## API

### Component: `UnforgettableQrCode`

A React component that renders a QR code for account recovery.

#### Props

```typescript
interface UnforgettableQrCodeProps {
  mode: 'create' | 'restore'
  appUrl?: string
  apiUrl?: string
  factors?: RecoveryFactor[]
  walletAddress?: string // Required for 'restore' mode
  group?: string
  customParams?: Record<string, string>
  pollingInterval?: number // Default: 5000ms
  pollingDisabled?: boolean // Default: false
  onSuccess?: (privateKey: string) => void
  onError?: (error: Error) => void
  qrProps?: QRCodeSVGProps
  loader?: React.ReactNode
  // ...plus any valid <a> element attributes
}
```

**Parameters:**
- `mode`: Either `'create'` or `'restore'`
- `appUrl`: Optional custom Unforgettable app URL
- `apiUrl`: Optional custom API URL
- `factors`: Optional list of recovery factors to use
- `walletAddress`: Wallet address (required for restore mode)
- `group`: Optional group identifier
- `customParams`: Optional custom URL parameters
- `pollingInterval`: Polling interval in milliseconds (default: 5000)
- `pollingDisabled`: Disable automatic polling (default: false)
- `onSuccess`: Callback when recovery succeeds
- `onError`: Callback when an error occurs
- `qrProps`: Props passed to the QR code component (size, colors, etc.)
- `loader`: Custom loading component

### Hook: `useUnforgettableLink`

A React hook that generates a recovery link and handles polling.

#### Parameters

```typescript
interface UseUnforgettableLinkOptions {
  mode: 'create' | 'restore'
  appUrl?: string
  apiUrl?: string
  factors?: RecoveryFactor[]
  walletAddress?: string
  group?: string
  customParams?: Record<string, string>
  pollingInterval?: number
  pollingDisabled?: boolean
  onSuccess?: (privateKey: string) => void
  onError?: (error: Error) => void
}
```

#### Returns

```typescript
string | null // The recovery URL or null if still generating
```

## Examples

### Create Recovery with Custom Styling

```tsx
<UnforgettableQrCode
  mode="create"
  factors={[RecoveryFactor.Face, RecoveryFactor.Image]}
  qrProps={{
    size: 300,
    bgColor: '#ffffff',
    fgColor: '#000000',
    level: 'H'
  }}
  style={{
    display: 'block',
    margin: '20px auto',
    padding: '10px',
    border: '2px solid #ccc'
  }}
  loader={<div className="spinner">Loading...</div>}
  onSuccess={(key) => console.log('Key:', key)}
/>
```

### Restore Account

```tsx
<UnforgettableQrCode
  mode="restore"
  walletAddress="0x1234567890abcdef"
  factors={[RecoveryFactor.Face, RecoveryFactor.Password]}
  pollingInterval={2000}
  onSuccess={(privateKey) => {
    // Restore wallet with the private key
    restoreWallet(privateKey)
  }}
  onError={(error) => {
    console.error(`Recovery failed: ${error.message}`)
  }}
/>
```

### Manual Polling Control

```tsx
function ManualRecovery() {
  const [startPolling, setStartPolling] = useState(false)
  
  const link = useUnforgettableLink({
    mode: 'create',
    pollingDisabled: !startPolling,
    onSuccess: (key) => {
      console.log('Success:', key)
      setStartPolling(false)
    }
  })

  return (
    <div>
      {link && <QRCodeSVG value={link} />}
      <button onClick={() => setStartPolling(true)}>
        Start Polling
      </button>
    </div>
  )
}
```

## Available Recovery Factors

```typescript
enum RecoveryFactor {
  Face = 1,
  Image = 2,
  Password = 3,
  Geolocation = 4
}
```

## Requirements

- React 17+
- Node.js 18+ or modern browser environment

## License

MIT License - see LICENSE file for details

## Homepage

[https://unforgettable.app](https://unforgettable.app)
