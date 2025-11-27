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

1. **Select Mode**: Choose between "Create" (new recovery) or "Restore" (recover existing key)
2. **Choose Factors**: Select one or more recovery factors
3. **Optional Settings**: 
   - For Restore mode: Enter wallet address to verify
   - Enter group identifier if using grouped recovery
4. **Generate URL**: Tap "Generate Recovery URL"
5. **Open WebView**: Tap "Open in WebView" to start the recovery process
6. **Wait for Completion**: The app automatically polls for recovery completion
7. **View Results**: Once complete, the private key and Ethereum address are displayed

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
const pollingInterval = setInterval(async () => {
  try {
    const data = await sdk.getRecoveredData()
    setRecoveredKey(data.recoveryKey)
    clearInterval(pollingInterval)
  } catch (error) {
    // Continue polling on 404 (data not ready yet)
    if (error.httpStatus === 404 || error.name === 'NotFoundError') {
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
- Never log private keys to console
- Use React Native Keychain or Secure Storage for sensitive data
- Implement proper authentication before displaying keys
- Add biometric authentication (Face ID/Touch ID)
- Use HTTPS for all network communications
- Implement proper error handling and user feedback
- Add rate limiting for polling

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
