# UnforgettableSDK for Swift

A Swift library for integrating Unforgettable account recovery into your iOS, macOS, tvOS, and watchOS applications.

## Installation

### Swift Package Manager

Add the following to your `Package.swift` file:

```swift
dependencies: [
    .package(url: "https://github.com/rarimo/unforgettable-sdk", from: "0.6.0")
]
```

Or add it through Xcode:
1. File → Add Package Dependencies
2. Enter the repository URL
3. Select the version you want to use

## Usage

### Creating a Recovery URL

```swift
import UnforgettableSDK

do {
    let sdk = try UnforgettableSDK(options: UnforgettableSdkOptions(
        mode: .create,
        factors: [.face, .image, .password],
        walletAddress: "0x1234567890abcdef"
    ))
    
    let recoveryUrl = sdk.getRecoveryUrl()
    print("Recovery URL: \(recoveryUrl)")
} catch {
    print("Error initializing SDK: \(error)")
}
```

### Restoring an Account

```swift
import UnforgettableSDK

do {
    let sdk = try UnforgettableSDK(options: UnforgettableSdkOptions(
        mode: .restore,
        factors: [.face, .image, .password],
    ))
    
    let recoveryUrl = sdk.getRecoveryUrl()
    
    // After the user completes the recovery process...
    let recoveredData = try await sdk.getRecoveredData()
    print("Recovery Key: \(recoveredData.recoveryKey)")
    
    if let helperDataUrl = recoveredData.helperDataUrl {
        print("Helper Data URL: \(helperDataUrl)")
    }
} catch {
    print("Error during recovery: \(error)")
}
```

### Available Recovery Factors

```swift
public enum RecoveryFactor: Int {
    case face = 1
    case image = 2
    case password = 3
}
```

## API

### `UnforgettableSDK`

The main SDK class.

#### Initialization

```swift
init(options: UnforgettableSdkOptions) throws
```

**Parameters:**
- `options`: Configuration options for the SDK

**Throws:** `CryptoError` if key generation fails

#### Methods

##### `getRecoveryUrl()`

Generates the recovery URL to present to the user.

```swift
func getRecoveryUrl() -> String
```

**Returns:** The recovery URL as a string

##### `getRecoveredData()`

Retrieves the recovered data from the API.

```swift
func getRecoveredData() async throws -> RecoveredData
```

**Returns:** The recovered data including the recovery key and optional helper data URL

**Throws:** `UnforgettableSDKError` on failure

##### `getRecoveredKey()`

Retrieves only the recovered key.

```swift
func getRecoveredKey() async throws -> String
```

**Returns:** The recovered key as a string

**Throws:** `UnforgettableSDKError` on failure

### `UnforgettableSdkOptions`

Configuration options for the SDK.

```swift
public struct UnforgettableSdkOptions {
    public let mode: UnforgettableMode
    public let appUrl: String
    public let apiUrl: String
    public let factors: [RecoveryFactor]
    public let walletAddress: String?
}
```

**Parameters:**
- `mode`: Either `.create` or `.restore`
- `appUrl`: The Unforgettable app URL (default: `https://unforgettable.app`)
- `apiUrl`: The Unforgettable API URL (default: `https://api.unforgettable.app`)
- `factors`: Array of recovery factors to use
- `walletAddress`: Optional wallet address to associate with the recovery

### Error Types

#### `CryptoError`

Errors related to cryptographic operations:
- `keyGenerationFailed`
- `encryptionFailed`
- `decryptionFailed`
- `invalidPublicKey`
- `encodingFailed`
- `decodingFailed`

#### `UnforgettableSDKError`

Errors related to SDK operations:
- `networkError(Error)`
- `invalidResponse`
- `notFound`
- `decodingError(Error)`
- `cryptoError(Error)`

## Requirements

- iOS 13.0+ / macOS 10.15+ / tvOS 13.0+ / watchOS 6.0+
- Swift 5.9+
- Xcode 15.0+

## License

MIT License - see LICENSE file for details

## Homepage

[https://unforgettable.app](https://unforgettable.app)
