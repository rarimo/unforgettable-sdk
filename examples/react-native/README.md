# Unforgettable React Native Example

A React Native mobile application demonstrating the Unforgettable SDK for secure key recovery across iOS and Android.

## Features

- **Mode Selection**: Create new recovery or restore existing keys
- **Recovery Factors**: Select from multiple recovery factors (Face, Image, Password)
- **Group Support**: Optional group identifier for multi-user scenarios
- **WebView Integration**: In-app browser for recovery process with camera permissions
- **Automatic Polling**: Continuously checks for recovery completion (2-second intervals)
- **Key Display**: Shows recovered private key and derived Ethereum address
- **Copy to Clipboard**: Easy copying of keys and addresses

## Prerequisites

- Node.js >= 18
- React Native development environment set up
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and JDK

## Installation

**Note**: This example is a standalone project (not part of the Yarn workspace) to avoid React Native build issues.

```bash
# Navigate to the example
cd examples/react-native

# Install dependencies
yarn install
# or
npm install

# iOS only - install pods
cd ios && pod install && cd ..
```

## Running

```bash
# Run on iOS
yarn ios
# or
npm run ios

# Run on Android
yarn android
# or
npm run android

# Start Metro bundler separately (optional)
yarn start
# or
npm start
```

## Usage

### Creating a Recovery

1. Select **Create** mode
2. Choose recovery factors (e.g., Face + Password)
3. Optionally enter a group
4. Tap **Generate Recovery URL**
5. Tap **Open in WebView** to complete the recovery setup
6. The URL will open in an embedded browser
7. Follow the on-screen instructions to set up recovery
8. The app will automatically poll for the recovery data

### Restoring an Account

1. Select **Restore** mode
2. Choose the same recovery factors used during creation
3. Optionally enter the wallet address or group
4. Tap **Generate Recovery URL**
5. Tap **Open in WebView**
6. Complete the recovery challenges in the browser
7. The app will automatically poll for the recovery data
8. Once complete, the decrypted private key will be displayed
9. Tap **Copy Key** to copy it to clipboard

## Architecture

- Uses `@rarimo/unforgettable-sdk` TypeScript SDK (via local file reference)
- React Native WebView for in-app recovery UI with camera permissions
- Polling mechanism for recovery status (404 error handling)
- Polyfills for crypto and URL APIs
- Cross-platform (iOS & Android)

## Dependencies

### Core
- `react`: 18.2.0
- `react-native`: 0.73.2
- `@rarimo/unforgettable-sdk`: file:../../packages/core (local package)
- `viem`: ^2.40.2 (Ethereum utilities)

### React Native Specific
- `react-native-webview`: ^13.6.4 (WebView component)
- `react-native-get-random-values`: 1.11.0 (crypto.getRandomValues polyfill)
- `react-native-url-polyfill`: ^3.0.0 (URLSearchParams polyfill)
- `buffer`: ^6.0.3 (Buffer polyfill for Node.js APIs)
- `fastestsmallesttextencoderdecoder`: ^1.0.22 (TextEncoder/Decoder polyfill)

## Project Structure

```
react-native/
├── App.tsx              # Main application component with UI and logic
├── index.js             # Entry point (registers app component)
├── package.json         # Dependencies (standalone, uses file: for SDK)
├── tsconfig.json        # TypeScript configuration
├── babel.config.js      # Babel configuration
├── metro.config.js      # Metro bundler configuration
├── jest.config.js       # Jest testing configuration
├── ios/                 # iOS native code and Xcode project
│   ├── Podfile          # CocoaPods dependencies
│   └── ...
└── android/             # Android native code and Gradle project
    ├── build.gradle     # Android build configuration
    └── ...
```

## Code Highlights

### Polyfills Setup

The app requires several polyfills for Web APIs not available in React Native:

```tsx
import 'react-native-get-random-values'  // crypto.getRandomValues()
import 'react-native-url-polyfill/auto'  // URLSearchParams
import 'fastestsmallesttextencoderdecoder'  // TextEncoder/TextDecoder

import { Buffer } from 'buffer'
global.Buffer = Buffer  // Node.js Buffer API
```

### SDK Usage

```tsx
import { UnforgettableSdk, RecoveryFactor } from '@rarimo/unforgettable-sdk'

const sdk = new UnforgettableSdk({
  mode: 'restore',
  factors: [RecoveryFactor.Face, RecoveryFactor.Image, RecoveryFactor.Password],
  walletAddress: '0x123...',
  group: 'my-group'
})

const recoveryUrl = await sdk.getRecoveryUrl()
```

### Polling with Error Handling

```tsx
import { NotFoundError } from '@rarimo/unforgettable-sdk'

const pollingInterval = setInterval(async () => {
  try {
    const data = await sdk.getRecoveredData()
    setRecoveredKey(data.recoveryKey)
    clearInterval(pollingInterval)
  } catch (error) {
    // Continue polling on 404 (data not ready yet)
    if (error instanceof NotFoundError) {
      return
    }
    // Stop on other errors
    console.error(error)
    clearInterval(pollingInterval)
  }
}, 2000)
```

### WebView Camera Permissions

```tsx
<WebView
  source={{ uri: recoveryUrl }}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  mediaPlaybackRequiresUserAction={false}
  allowsInlineMediaPlayback={true}
  mediaCapturePermissionGrantType='grant'  // Auto-grant camera
  allowsProtectedMedia={true}
/>
```

## Troubleshooting

### Metro Bundler Errors

If you see errors about missing modules:
```bash
# Clear Metro cache
yarn start --reset-cache
```

### iOS Build Errors

```bash
# Clean and reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Android Build Errors

```bash
# Clean Gradle cache
cd android
./gradlew clean
cd ..
```

### Buffer is not defined

Make sure the Buffer polyfill is imported at the top of `App.tsx`:
```tsx
import { Buffer } from 'buffer'
global.Buffer = Buffer
```

## Security Notes

⚠️ **This is an example app for demonstration purposes.**

In production:
- Never log or display private keys in plaintext
- Use React Native Keychain or Secure Storage for sensitive data
- Implement proper error handling
- Add authentication before displaying keys
- Consider using biometric authentication

## Known Limitations

- Standalone project (not in Yarn workspace) due to React Native Xcode integration
- Uses file: protocol for SDK dependency (relative path)
- Requires manual rebuild if SDK packages change
- WebView doesn't support all desktop browser features

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- SDK Documentation: See main README
- GitHub Issues: https://github.com/rarimo/unforgettable-sdk/issues
- Website: https://unforgettable.app
