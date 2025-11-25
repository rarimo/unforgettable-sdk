# React Native Unforgettable Recovery Example

A React Native mobile application demonstrating the Unforgettable SDK for secure key recovery across iOS and Android.

## Features

- **Mode Selection**: Create new recovery or restore existing keys
- **Recovery Factors**: Select from 6 different authentication factors (Face ID, Image, Password, Object, Book, Geolocation)
- **WebView Integration**: In-app browser for recovery process
- **Automatic Polling**: Continuously checks for recovery completion
- **Key Display**: Shows recovered private key and derived Ethereum address
- **Copy to Clipboard**: Easy copying of keys and addresses

## Prerequisites

- Node.js >= 18
- React Native development environment set up
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and JDK

## Installation

```bash
# Install dependencies
npm install

# iOS only - install pods
cd ios && pod install && cd ..
```

## Running

```bash
# Run on iOS
npm run ios

# Run on Android
npm run android

# Start Metro bundler
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

- Uses `@unforgettable/core` TypeScript SDK
- React Native WebView for in-app recovery UI
- Polling mechanism for recovery status
- Cross-platform (iOS & Android)

## Dependencies

- `react-native`: ^0.73.2
- `react-native-webview`: ^13.6.4
- `@unforgettable/core`: Local package

## Project Structure

```
react-native-recovery/
├── App.tsx              # Main application component
├── index.js             # Entry point
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── babel.config.js      # Babel config
├── ios/                 # iOS native code
└── android/             # Android native code
```

## Notes

- WebView permissions for camera and other features are handled automatically
- The app demonstrates polling every 2 seconds for recovery completion
- Private key derivation is simplified - use a proper crypto library in production
