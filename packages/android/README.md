# Unforgettable SDK for Android

A Kotlin library for integrating Unforgettable account recovery into your Android applications.

## Installation

### Gradle

Add to your `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.rarimo:unforgettable-sdk:0.8.0")
}
```

Or if using Groovy `build.gradle`:

```groovy
dependencies {
    implementation 'com.rarimo:unforgettable-sdk:0.8.0'
}
```

### Maven

```xml
<dependency>
    <groupId>com.rarimo</groupId>
    <artifactId>unforgettable-sdk</artifactId>
    <version>0.8.0</version>
</dependency>
```

## Usage

### Creating a Recovery URL

```kotlin
import com.rarimo.unforgettable.*

val sdk = UnforgettableSDK(
    UnforgettableSdkOptions(
        mode = UnforgettableMode.CREATE,
        factors = listOf(RecoveryFactor.FACE, RecoveryFactor.IMAGE, RecoveryFactor.PASSWORD),
        walletAddress = "0x1234567890abcdef",
        group = "my-organization", // Optional
        customParams = mapOf("theme" to "dark", "lang" to "en") // Optional
    )
)

val recoveryUrl = sdk.getRecoveryUrl()
println("Recovery URL: $recoveryUrl")
```

### Restoring an Account

```kotlin
import com.rarimo.unforgettable.*
import kotlinx.coroutines.*

val sdk = UnforgettableSDK(
    UnforgettableSdkOptions(
        mode = UnforgettableMode.RESTORE,
        factors = listOf(RecoveryFactor.FACE, RecoveryFactor.PASSWORD)
    )
)

val recoveryUrl = sdk.getRecoveryUrl()

// After the user completes the recovery process...
lifecycleScope.launch {
    try {
        val recoveredData = sdk.getRecoveredData()
        println("Recovery Key: ${recoveredData.recoveryKey}")
        
        recoveredData.helperDataUrl?.let { url ->
            println("Helper Data URL: $url")
        }
    } catch (e: UnforgettableSDKError) {
        println("Error during recovery: $e")
    }
}
```

### Available Recovery Factors

```kotlin
enum class RecoveryFactor(val value: Int) {
    FACE(1),
    IMAGE(2),
    PASSWORD(3)
}
```

## API

### `UnforgettableSDK`

The main SDK class.

#### Initialization

```kotlin
UnforgettableSDK(options: UnforgettableSdkOptions)
```

**Parameters:**
- `options`: Configuration options for the SDK

#### Methods

##### `getRecoveryUrl()`

Generates the recovery URL to present to the user.

```kotlin
fun getRecoveryUrl(): String
```

**Returns:** The recovery URL as a string

##### `getRecoveredData()`

Retrieves the recovered data from the API (suspending function).

```kotlin
suspend fun getRecoveredData(): RecoveredData
```

**Returns:** The recovered data including the recovery key and optional helper data URL

**Throws:** `UnforgettableSDKError` on failure

##### `getRecoveredKey()`

Retrieves only the recovered key (suspending function).

```kotlin
suspend fun getRecoveredKey(): String
```

**Returns:** The recovered key as a string

**Throws:** `UnforgettableSDKError` on failure

### `UnforgettableSdkOptions`

Configuration options for the SDK.

```kotlin
data class UnforgettableSdkOptions(
    val mode: UnforgettableMode,
    val appUrl: String = UNFORGETTABLE_APP_URL,
    val apiUrl: String = UNFORGETTABLE_API_URL,
    val factors: List<RecoveryFactor> = emptyList(),
    val walletAddress: String? = null,
    val group: String? = null,
    val customParams: Map<String, String>? = null
)
```

**Parameters:**
- `mode`: Either `UnforgettableMode.CREATE` or `UnforgettableMode.RESTORE`
- `appUrl`: The Unforgettable app URL (default: `https://unforgettable.app`)
- `apiUrl`: The Unforgettable API URL (default: `https://api.unforgettable.app`)
- `factors`: List of recovery factors to use
- `walletAddress`: Optional wallet address to associate with the recovery
- `group`: Optional group identifier for organizing recovery keys
- `customParams`: Optional custom URL parameters to pass to the recovery app

### Error Types

#### `CryptoError`

Errors related to cryptographic operations:
- `KeyGenerationFailed`
- `EncryptionFailed`
- `DecryptionFailed`
- `InvalidPublicKey`
- `EncodingFailed`
- `DecodingFailed`

#### `UnforgettableSDKError`

Errors related to SDK operations:
- `NetworkError(cause: Throwable)`
- `InvalidResponse`
- `NotFound`
- `DecodingError(cause: Throwable)`
- `CryptoError(cause: Throwable)`

#### `LocationHashError`

Errors related to URL hash parsing:
- `InvalidParameters`
- `InvalidFactorId(factorId: String)`
- `NonIntegerFactor(factor: String)`

## Android Permissions

Add to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

## Requirements

- Android SDK 21+ (Android 5.0 Lollipop)
- Kotlin 1.9+
- Java 17+

## ProGuard

If you use ProGuard, add these rules to your `proguard-rules.pro`:

```proguard
# Keep SDK classes
-keep class com.rarimo.unforgettable.** { *; }

# Keep serialization classes
-keepclassmembers class com.rarimo.unforgettable.** {
    @kotlinx.serialization.* <fields>;
}
```

## License

MIT License - see LICENSE file for details

## Homepage

[https://unforgettable.app](https://unforgettable.app)
