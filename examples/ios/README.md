# Unforgettable iOS Example

A complete iOS/macOS example app demonstrating how to use the Unforgettable SDK for account recovery with WebView integration and automatic polling.

## Features

- ✅ Generate recovery URLs for both Create and Restore modes
- ✅ Select multiple recovery factors (Face, Image, Password)
- ✅ Optional wallet address and group parameters
- ✅ Open recovery URL in an embedded WebView
- ✅ Automatic polling for recovery data in restore mode
- ✅ Display decrypted private key
- ✅ Copy-to-clipboard functionality
- ✅ Works on both iOS and macOS

## Requirements

- iOS 15.0+
- Xcode 15.0+
- Swift 5.9+

## Installation

1. Open the project in Xcode:
   ```bash
   cd examples/ios
   open UnforgettableExample.xcodeproj
   ```

2. Select your development team in the project settings (Signing & Capabilities)

3. Build and run the app on a simulator or device (⌘+R)

## Usage

### Creating a Recovery

1. Select **Create** mode
2. Choose recovery factors (e.g., Face + Password)
3. Optionally enter a wallet address
4. Click **Generate Recovery URL**
5. Click **Open in WebView** to complete the recovery setup
6. The URL will open in an embedded browser
7. Follow the on-screen instructions to set up recovery

### Restoring an Account

1. Select **Restore** mode
2. Choose the same recovery factors used during creation
3. Optionally enter the wallet address
4. Click **Generate Recovery URL**
5. Click **Open in WebView**
6. Complete the recovery challenges in the browser
7. The app will automatically poll for the recovery data
8. Once complete, the decrypted private key will be displayed
9. Click **Copy Key** to copy it to clipboard

## Code Structure

```
UnforgettableExample/
├── Sources/
│   └── UnforgettableExample/
│       ├── UnforgettableExampleApp.swift  # App entry point
│       ├── ContentView.swift              # Main UI
│       ├── RecoveryViewModel.swift        # Business logic & state
│       └── WebView.swift                  # WebKit wrapper
└── Package.swift                          # Swift Package configuration
```

## How It Works

### 1. SDK Initialization

```swift
let options = UnforgettableSdkOptions(
    mode: .restore,
    factors: [.face, .password],
    walletAddress: "0x123...",
    group: "my-group"
)

let sdk = try UnforgettableSDK(options: options)
```

### 2. Generate Recovery URL

```swift
let recoveryUrl = sdk.getRecoveryUrl()
// Returns: https://unforgettable.app/r#id=...&epk=...&f=1,3
```

### 3. Open in WebView

The URL is loaded in a `WKWebView` where the user completes the recovery process.

### 4. Automatic Polling (Restore Mode)

```swift
func startPolling() {
    Task {
        while !Task.isCancelled {
            do {
                let data = try await sdk.getRecoveredData()
                // Success! Display the recovered key
                recoveredKey = data.recoveryKey
                break
            } catch UnforgettableSDKError.notFound {
                // Not ready yet, wait and retry
                try? await Task.sleep(nanoseconds: 2_000_000_000)
            }
        }
    }
}
```

### 5. Display Results

The recovered private key is displayed in a monospaced font with copy functionality.

## Key Components

### RecoveryViewModel

Manages the app state and SDK interactions:
- Generates recovery URLs
- Handles WebView presentation
- Implements polling logic
- Manages error states

### ContentView

SwiftUI interface with:
- Mode selection (Create/Restore)
- Recovery factor checkboxes
- Optional parameter inputs
- URL display and actions
- Polling status indicator
- Recovered key display

### WebView

Cross-platform WebKit wrapper:
- Works on iOS and macOS
- Loads recovery URL
- Presents as modal sheet

## Customization

### Change Polling Interval

Edit the sleep duration in `RecoveryViewModel.swift`:

```swift
try? await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds
```

### Add Custom Parameters

```swift
let options = UnforgettableSdkOptions(
    mode: .create,
    factors: [.face],
    customParams: ["custom_key": "custom_value"]
)
```

### Modify UI

The app uses SwiftUI, so you can easily customize colors, layouts, and styles in `ContentView.swift`.

## Error Handling

The app handles various error scenarios:

- **Empty factors**: Alerts if no recovery factors are selected
- **Network errors**: Displays error message from SDK
- **Not found**: Continues polling until data is available
- **Crypto errors**: Shows decryption failures

## Security Notes

⚠️ **This is an example app for demonstration purposes.**

In production:
- Never log or display private keys in plaintext
- Use secure storage (Keychain) for sensitive data
- Implement proper error handling
- Add authentication before displaying keys
- Consider using biometric authentication

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- SDK Documentation: See main README
- GitHub Issues: https://github.com/rarimo/unforgettable-sdk/issues
- Website: https://unforgettable.app
