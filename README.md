<div align="center">

<img src="./images/logo.png" alt="Unforgettable SDK Logo" width="100" />

# Unforgettable SDK

**Secure, seedless wallet recovery for modern applications**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/%40rarimo%2Funforgettable-sdk.svg)](https://badge.fury.io/js/%40rarimo%2Funforgettable-sdk)

[Documentation](https://docs.unforgettable.app) • [Website](https://unforgettable.app) • [Examples](#-examples) • [Changelog](./CHANGELOG.md)

</div>

---

## 📖 Overview

The Unforgettable SDK is a comprehensive, multi-platform toolkit for implementing secure, seedless wallet recovery in your applications. It enables users to recover their private keys using biometric factors (face recognition, physical objects) and traditional methods (passwords) without storing sensitive data on centralized servers.

### Key Features

✨ **Seedless Recovery** - No mnemonics or seed phrases to manage  
🔐 **End-to-End Encryption** - Client-side cryptography, zero-knowledge architecture  
🎯 **Multi-Factor Authentication** - Combine face recognition, images, and passwords  
📱 **Cross-Platform** - TypeScript/JavaScript, iOS (Swift), Android (Kotlin), React Native  
🚀 **Easy Integration** - Simple APIs, React hooks, and native SDKs  
🌐 **Self-Sovereign** - Users control their own recovery process

---

## 📦 Packages

The SDK is organized into platform-specific packages:

| Package | Platform | Version | Documentation |
|---------|----------|---------|---------------|
| [`@rarimo/unforgettable-sdk`](./packages/core) | TypeScript/JavaScript (Core) | ![npm](https://img.shields.io/npm/v/@rarimo/unforgettable-sdk) | [Docs](./packages/core/README.md) |
| [`@rarimo/unforgettable-sdk-react`](./packages/react) | React Components | ![npm](https://img.shields.io/npm/v/@rarimo/unforgettable-sdk-react) | [Docs](./packages/react/README.md) |
| [`com.github.rarimo.unforgettable-sdk:android`](./packages/android) | Android (Kotlin) | ![JitPack](https://jitpack.io/v/rarimo/unforgettable-sdk.svg) | [Docs](./packages/android/README.md) |
| [`UnforgettableSDK`](./packages/ios) | iOS (Swift) | ![SwiftPM](https://img.shields.io/badge/SwiftPM-compatible-brightgreen) | [Docs](./packages/ios/README.md) |

### Package Features

#### Core SDK (TypeScript/JavaScript)
- Works in browsers and Node.js environments
- Cryptographic key generation and encryption
- Recovery URL generation with embedded parameters
- Polling mechanism for recovery completion
- TypeScript type definitions

#### React SDK
- Pre-built QR code component (`UnforgettableQrCode`)
- React hooks for recovery flow management
- Automatic polling and state management
- Customizable styling and error handling

#### Android SDK
- Native Kotlin implementation
- Coroutines support for async operations
- WebView integration helpers
- Comprehensive error types

#### iOS SDK
- Native Swift implementation with Swift Package Manager
- Async/await support
- Combine framework integration
- iOS 13+ support

---

## 🚀 Quick Start

### Web/React

```bash
npm install @rarimo/unforgettable-sdk @rarimo/unforgettable-sdk-react
# or
yarn add @rarimo/unforgettable-sdk @rarimo/unforgettable-sdk-react
```

```tsx
import UnforgettableQrCode from '@rarimo/unforgettable-sdk-react'
import { RecoveryFactor } from '@rarimo/unforgettable-sdk'

function App() {
  return (
    <UnforgettableQrCode
      mode="create"
      factors={[RecoveryFactor.Face, RecoveryFactor.Password]}
      onSuccess={(privateKey) => {
        console.log('Recovery key:', privateKey)
      }}
    />
  )
}
```

### Android

```kotlin
repositories {
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    implementation("com.github.rarimo.unforgettable-sdk:android:0.8.0")
}
```

```kotlin
import com.rarimo.unforgettable.*

val sdk = UnforgettableSDK(
    UnforgettableSdkOptions(
        mode = UnforgettableMode.CREATE,
        factors = listOf(RecoveryFactor.FACE, RecoveryFactor.PASSWORD)
    )
)

val recoveryUrl = sdk.getRecoveryUrl()
val recoveredKey = sdk.getRecoveredKey() // suspending function
```

### iOS

```swift
dependencies: [
    .package(url: "https://github.com/rarimo/unforgettable-sdk.git", from: "0.8.0")
]
```

```swift
import UnforgettableSDK

let sdk = try UnforgettableSDK(
    mode: .create,
    factors: [.face, .password]
)

let recoveryUrl = try sdk.getRecoveryUrl()
let recoveredKey = try await sdk.getRecoveredKey()
```

---

## 💡 Examples

The repository includes comprehensive examples for each platform:

### Web & Mobile

| Platform | Description | Location | Live Demo |
|----------|-------------|----------|-----------|
| **React** | Web app with QR code component | [`examples/react`](./examples/react) | [![StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/rarimo/unforgettable-sdk/tree/main/examples/react) |
| **React Native** | iOS & Android mobile app | [`examples/react-native`](./examples/react-native) | - |
| **Android** | Native Kotlin app with WebView | [`examples/android`](./examples/android) | - |
| **iOS** | Native Swift app | [`examples/ios`](./examples/ios) | - |

Each example demonstrates:
- Creating new recovery setups
- Restoring existing accounts
- Factor selection and configuration
- WebView/QR code integration
- Automatic polling for recovery completion
- Key display and management

---

## 🏗️ Architecture

The SDK follows a zero-knowledge architecture:

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│ Your App    │────────▶│ Unforgettable│◀────────│ User Device │
│ (SDK)       │         │ App (WebView)│         │ (Camera)    │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │
      │                        │
      ▼                        ▼
┌─────────────────────────────────────┐
│  Unforgettable API (Encrypted Data) │
│  • No private keys stored           │
│  • Only encrypted shards            │
│  • Cannot decrypt without factors   │
└─────────────────────────────────────┘
```

1. **Key Generation**: Client generates ephemeral key pairs
2. **Encryption**: Recovery data encrypted with factors (face, password, etc.)
3. **Storage**: Only encrypted shards stored on API
4. **Recovery**: User provides factors → decryption happens client-side
5. **Zero-Knowledge**: Server never sees private keys or decrypted data

---

## 🛠️ Development

### Prerequisites

- **Node.js** 18+ and Yarn 4.x
- **Java** 17 (for Android development)
- **Xcode** 14+ (for iOS development)
- **Gradle** 8.1+ (for Android builds)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rarimo/unforgettable-sdk.git
   cd unforgettable-sdk
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Build all packages**:
   ```bash
   yarn build
   ```

4. **Run tests**:
   ```bash
   yarn test              # All tests
   yarn test:ts           # TypeScript/JavaScript tests
   yarn test:swift        # iOS Swift tests
   yarn test:kotlin       # Android Kotlin tests
   ```

### Monorepo Structure

```
unforgettable-sdk/
├── packages/
│   ├── core/          # TypeScript/JavaScript SDK
│   ├── react/         # React components and hooks
│   ├── android/       # Android SDK (Kotlin)
│   └── ios/           # iOS SDK (Swift)
├── examples/
│   ├── react/         # React web example
│   ├── react-native/  # React Native mobile example
│   ├── android/       # Android example app
│   └── ios/           # iOS example app
└── scripts/           # Build and release scripts
```

### Available Scripts

```bash
yarn build             # Build all packages
yarn lint              # Lint TypeScript code
yarn test              # Run all tests
yarn publish:stable    # Publish packages to NPM
```

---

## 🔧 Troubleshooting

### Android: Java 17 Not Found

If you encounter this error:

```
Cannot find a Java installation on your machine matching: {languageVersion=17}
```

**Solution (macOS)**:

```bash
# Install Java 17
brew install openjdk@17

# Link it
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk

# Verify
/usr/libexec/java_home -V
```

### TypeScript Build Errors

```bash
# Clean and rebuild
yarn clean
yarn install
yarn build
```

### iOS CocoaPods Issues

```bash
cd packages/ios
rm -rf Pods Podfile.lock
pod install
```

---

## 📚 Documentation

- [Core SDK Documentation](./packages/core/README.md)
- [React SDK Documentation](./packages/react/README.md)
- [Android SDK Documentation](./packages/android/README.md)
- [iOS SDK Documentation](./packages/ios/README.md)
- [Full Documentation](https://docs.unforgettable.app)
- [API Reference](https://docs.unforgettable.app/sdk/api/unforgettable-sdk)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style (ESLint for TypeScript, Ktlint for Kotlin, SwiftLint for Swift)
- Add tests for new features
- Update documentation
- Ensure all tests pass (`yarn test`)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

Copyright © 2025 Zero Block Global Foundation

---

## 🔗 Links

- [Website](https://unforgettable.app)
- [Documentation](https://docs.unforgettable.app)
- [Changelog](./CHANGELOG.md)
- [GitHub Issues](https://github.com/rarimo/unforgettable-sdk/issues)
- [npm Package](https://www.npmjs.com/package/@rarimo/unforgettable-sdk)
- [JitPack (Android)](https://jitpack.io/#rarimo/unforgettable-sdk)

---

## 🙏 Acknowledgments

Built with ❤️ by the Rarimo team and contributors.

Powered by:
- [@noble/curves](https://github.com/paulmillr/noble-curves) - Cryptographic curves
- [@noble/ciphers](https://github.com/paulmillr/noble-ciphers) - Encryption
- [@noble/hashes](https://github.com/paulmillr/noble-hashes) - Hash functions
