# Unforgettable React Example

A web application demonstrating the Unforgettable SDK React component for secure key recovery.

## Features

- **Mode Selection**: Create new recovery or restore existing keys
- **Recovery Factors**: Select from 6 different authentication factors (Face, Image, Password, Object, Book, Geolocation)
- **QR Code Integration**: Built-in QR code component for easy mobile scanning
- **Real-time Key Generation**: Instantly displays recovered private key and Ethereum address
- **Group Support**: Optional group identifier for multi-user scenarios
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js >= 18
- Yarn package manager

## Installation

Install dependencies from the **monorepo root**:

```bash
yarn install
```

Build the SDK packages from the **monorepo root**:

```bash
yarn build
```

## Running

From the **monorepo root**, run:

```bash
yarn workspace react-example dev
```

Or navigate to the example directory:

```bash
cd examples/react
yarn dev
```

The app will be available at **http://localhost:5173** by default.

## Live Demo

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/rarimo/unforgettable-sdk/tree/main/examples/react)

## Usage

### Creating a Recovery

1. Select **CREATE** mode
2. Choose one or more recovery factors by clicking on them (selected factors turn blue with checkmarks)
3. Optionally enter a group identifier
4. A QR code will appear automatically
5. Scan the QR code with your mobile device or click it to open in a new tab
6. Complete the recovery setup process in the opened page
7. The private key and wallet address will appear once complete

### Restoring an Account

1. Select **RESTORE** mode
2. Choose the same recovery factors used during creation
3. Enter the wallet address to restore (optional but recommended for verification)
4. Optionally enter the same group identifier if one was used during creation
5. Scan or click the QR code
6. Complete the recovery challenges
7. The recovered private key will be displayed automatically

## Code Structure

```
react/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles (Tailwind CSS)
├── index.html           # HTML template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── vite.config.ts       # Vite configuration
```

## How It Works

### 1. Using the React Component

```tsx
import UnforgettableQrCode from '@rarimo/unforgettable-sdk-react'
import { RecoveryFactor } from '@rarimo/unforgettable-sdk'

<UnforgettableQrCode
  mode="create"
  factors={[RecoveryFactor.Face, RecoveryFactor.Password]}
  group="my-group"
  onSuccess={(key, helperDataUrl) => {
    console.log('Private key:', key)
    console.log('Wallet:', privateKeyToAccount(key).address)
  }}
  onError={(error) => console.error(error)}
/>
```

### 2. Factor Selection

Users can toggle recovery factors on/off. The component validates that at least one factor is selected.

### 3. QR Code Generation

The `UnforgettableQrCode` component automatically:
- Generates a recovery URL with encrypted parameters
- Renders it as a scannable QR code
- Handles the recovery flow
- Returns the private key on success

### 4. Key Display

Once recovery is complete, the app displays:
- The recovered private key (hex format)
- The derived Ethereum wallet address
- Helper data URL (if applicable)

## Customization

### Change QR Code Size

```tsx
<UnforgettableQrCode
  qrProps={{ size: 300 }} // Default is 200
  ...
/>
```

### Add Custom Styling

The app uses Tailwind CSS for styling. Modify classes in `App.tsx` or update `index.css` for global styles.

## Security Notes

⚠️ **This is an example app for demonstration purposes.**

In production:
- Never log private keys to console
- Use secure storage for sensitive data
- Implement proper authentication
- Consider using HTTPS for all communications
- Add rate limiting and abuse prevention

## Troubleshooting

### QR Code Not Appearing

- Ensure at least one recovery factor is selected
- Check browser console for errors
- Verify SDK packages are built (`yarn build` from root)

### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules && yarn install`
- Rebuild SDK packages: `cd ../.. && yarn build`

### Vite Errors

- Check that `vite.config.ts` has the React dedupe configuration
- Ensure all dependencies are installed

## Dependencies

- `react`: ^19.2.0
- `@rarimo/unforgettable-sdk`: Local package (core SDK)
- `@rarimo/unforgettable-sdk-react`: Local package (React component)
- `viem`: ^2.0.0 (Ethereum utilities)
- `vite`: ^5.0.0 (Build tool)
- `tailwindcss`: ^3.4.0 (Styling)

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- SDK Documentation: See main README
- GitHub Issues: https://github.com/rarimo/unforgettable-sdk/issues
- Website: https://unforgettable.app
