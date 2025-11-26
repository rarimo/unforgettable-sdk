# Unforgettable Android Example

A complete Android example app demonstrating how to use the Unforgettable SDK for account recovery with WebView integration and automatic polling.

## Features

- ✅ Generate recovery URLs for both Create and Restore modes
- ✅ Select multiple recovery factors (Face, Image, Password)
- ✅ Optional wallet address and group parameters
- ✅ Open recovery URL in an embedded WebView
- ✅ Automatic polling for recovery data in both modes
- ✅ Display decrypted private key
- ✅ Copy-to-clipboard functionality
- ✅ Material Design 3 UI with Jetpack Compose

## Requirements

- Android SDK 21+ (Android 5.0 Lollipop)
- Android Studio Hedgehog or later
- Kotlin 1.9.21+
- Gradle 8.1+

## Installation

1. Open the project in Android Studio:
   ```bash
   cd examples/android
   ```

2. Open the folder in Android Studio

3. Sync Gradle files

4. Build and run the app on an emulator or device

## Usage

### Creating a Recovery

1. Select **Create** mode
2. Choose recovery factors (e.g., Face + Password)
3. Optionally enter a group
4. Click **Generate Recovery URL**
5. Click **Open in WebView** to complete the recovery setup
6. The URL will open in an embedded browser
7. Follow the on-screen instructions to set up recovery
8. The app will automatically poll for the recovery data

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

## Project Structure

```
app/src/main/kotlin/app/unforgettable/example/
├── MainActivity.kt              # App entry point
├── RecoveryScreen.kt            # Main UI with Compose
├── RecoveryViewModel.kt         # Business logic & state
├── WebViewDialog.kt             # WebView wrapper
└── ui/theme/                    # Material Design theme
    ├── Color.kt
    ├── Theme.kt
    └── Type.kt
```

## How It Works

### 1. SDK Initialization

```kotlin
val options = UnforgettableSdkOptions(
    mode = UnforgettableMode.RESTORE,
    factors = listOf(RecoveryFactor.FACE, RecoveryFactor.PASSWORD),
    walletAddress = "0x123...",
    group = "my-group"
)

val sdk = UnforgettableSDK(options)
```

### 2. Generate Recovery URL

```kotlin
val recoveryUrl = sdk.getRecoveryUrl()
// Returns: https://unforgettable.app/r#id=...&epk=...&f=1,3
```

### 3. Open in WebView

The URL is loaded in a WebView with camera permissions enabled.

### 4. Automatic Polling

```kotlin
viewModelScope.launch {
    while (true) {
        try {
            val data = sdk.getRecoveredData()
            // Success! Display the recovered key
            break
        } catch (e: UnforgettableSDKError.NotFound) {
            // Not ready yet, wait and retry
            delay(2000)
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
- Implements polling logic with coroutines
- Manages error states
- Uses StateFlow for reactive UI updates

### RecoveryScreen

Jetpack Compose interface with:
- Mode selection (Create/Restore)
- Recovery factor checkboxes
- Optional parameter inputs
- URL display and actions
- Polling status indicator
- Recovered key display
- Material Design 3 components

### WebViewDialog

Full-screen WebView dialog:
- Enables JavaScript and DOM storage
- Automatically grants camera permissions
- Loads recovery URL
- Dismissible with close button

## Customization

### Change Polling Interval

Edit the delay in `RecoveryViewModel.kt`:

```kotlin
delay(2000) // 2 seconds in milliseconds
```

### Add Custom Parameters

```kotlin
val options = UnforgettableSdkOptions(
    mode = UnforgettableMode.CREATE,
    factors = listOf(RecoveryFactor.FACE),
    customParams = mapOf("custom_key" to "custom_value")
)
```

### Modify UI Theme

The app uses Material Design 3. Customize colors in `ui/theme/Color.kt` and `ui/theme/Theme.kt`.

## Permissions

The app requires the following permissions:
- `INTERNET` - For API communication
- `CAMERA` - For face recognition in WebView

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
- Use encrypted storage (EncryptedSharedPreferences) for sensitive data
- Implement proper error handling
- Add authentication before displaying keys
- Consider using biometric authentication

## Building

### Debug Build

```bash
./gradlew assembleDebug
```

### Release Build

```bash
./gradlew assembleRelease
```

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- SDK Documentation: See main README
- GitHub Issues: https://github.com/rarimo/unforgettable-sdk/issues
- Website: https://unforgettable.app
