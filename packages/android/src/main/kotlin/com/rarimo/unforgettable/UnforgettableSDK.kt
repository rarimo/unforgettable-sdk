package com.rarimo.unforgettable

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName
import kotlinx.serialization.json.Json
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

/**
 * The mode for the Unforgettable SDK
 */
enum class UnforgettableMode {
    CREATE,
    RESTORE
}

/**
 * Options for initializing the Unforgettable SDK
 */
data class UnforgettableSdkOptions(
    val mode: UnforgettableMode,
    val appUrl: String = UNFORGETTABLE_APP_URL,
    val apiUrl: String = UNFORGETTABLE_API_URL,
    val factors: List<RecoveryFactor> = emptyList(),
    val walletAddress: String? = null,
    val group: String? = null,
    val customParams: Map<String, String>? = null
)

/**
 * API response wrapper
 */
@Serializable
private data class DataTransferResponse(
    val data: DataTransferWrapper? = null
)

@Serializable
private data class DataTransferWrapper(
    val id: String,
    val type: String,
    val attributes: DataTransferAttributes
)

@Serializable
private data class DataTransferAttributes(
    val data: String
)

/**
 * Payload inside the data transfer
 */
@Serializable
private data class DataTransferPayload(
    @SerialName("recovery_key")
    val recoveryKey: String,
    @SerialName("helper_data_url")
    val helperDataUrl: String? = null
)

/**
 * Recovered data from the API
 */
data class RecoveredData(
    val recoveryKey: String,
    val helperDataUrl: String? = null
)

/**
 * Errors that can occur in the SDK
 */
sealed class UnforgettableSDKError : Exception() {
    data class NetworkError(override val cause: Throwable) : UnforgettableSDKError()
    object InvalidResponse : UnforgettableSDKError()
    object NotFound : UnforgettableSDKError()
    data class DecodingError(override val cause: Throwable) : UnforgettableSDKError()
    data class CryptoError(override val cause: Throwable) : UnforgettableSDKError()
}

/**
 * Main SDK class for Unforgettable
 */
public class UnforgettableSDK(options: UnforgettableSdkOptions) {
    val mode: UnforgettableMode = options.mode
    val appUrl: String = options.appUrl
    val factors: List<RecoveryFactor> = options.factors
    val walletAddress: String? = options.walletAddress
    val group: String? = options.group
    val customParams: Map<String, String>? = options.customParams
    
    private val apiUrl: String = options.apiUrl
    private val dataTransferId: String = UUID.randomUUID().toString().lowercase()
    private val encryptionKeyPair: DataTransferKeyPair = generateDataTransferKeyPair()
    
    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }
    
    /**
     * Generates the recovery URL
     * @return The recovery URL as a string
     */
    fun getRecoveryUrl(): String {
        val baseUrl = if (appUrl.endsWith("/")) appUrl.dropLast(1) else appUrl
        val path = if (mode == UnforgettableMode.RESTORE) "/r" else "/c"
        
        val hash = composeUnforgettableLocationHash(
            UnforgettablePathParams(
                dataTransferId = dataTransferId,
                encryptionPublicKey = encryptionKeyPair.publicKey,
                factors = factors,
                walletAddress = walletAddress,
                group = group,
                customParams = customParams
            )
        )
        
        return "$baseUrl$path$hash"
    }
    
    /**
     * Retrieves the recovered data from the API
     * @return The recovered data
     * @throws UnforgettableSDKError on failure
     */
    suspend fun getRecoveredData(): RecoveredData = withContext(Dispatchers.IO) {
        val endpoint = "/integrations/helper-keeper/v1/public/data-transfers/$dataTransferId"
        val urlString = "$apiUrl$endpoint"
        
        try {
            val url = URL(urlString)
            val connection = url.openConnection() as HttpURLConnection
            
            try {
                connection.requestMethod = "GET"
                connection.connectTimeout = 30000
                connection.readTimeout = 30000
                
                when (connection.responseCode) {
                    HttpURLConnection.HTTP_OK -> {
                        val responseBody = connection.inputStream.bufferedReader().use { it.readText() }
                        
                        val response = try {
                            json.decodeFromString<DataTransferResponse>(responseBody)
                        } catch (e: Exception) {
                            throw UnforgettableSDKError.DecodingError(e)
                        }
                        
                        val dataTransferWrapper = response.data
                            ?: throw UnforgettableSDKError.NotFound
                        
                        val payload = try {
                            json.decodeFromString<DataTransferPayload>(dataTransferWrapper.attributes.data)
                        } catch (e: Exception) {
                            throw UnforgettableSDKError.DecodingError(e)
                        }
                        
                        // The recovery_key contains raw binary data incorrectly encoded as a UTF-8 string
                        // We need to convert it back to bytes using ISO-8859-1 encoding
                        val encryptedBytes = payload.recoveryKey.toByteArray(Charsets.ISO_8859_1)
                        
                        val decryptedKey = try {
                            encryptionKeyPair.decryptBinary(encryptedBytes)
                        } catch (e: Exception) {
                            throw UnforgettableSDKError.CryptoError(e)
                        }
                        
                        RecoveredData(
                            recoveryKey = decryptedKey,
                            helperDataUrl = payload.helperDataUrl
                        )
                    }
                    HttpURLConnection.HTTP_NOT_FOUND -> {
                        throw UnforgettableSDKError.NotFound
                    }
                    else -> {
                        throw UnforgettableSDKError.InvalidResponse
                    }
                }
            } finally {
                connection.disconnect()
            }
        } catch (e: UnforgettableSDKError) {
            throw e
        } catch (e: Exception) {
            throw UnforgettableSDKError.NetworkError(e)
        }
    }
    
    /**
     * Retrieves only the recovered key
     * @return The recovered key as a string
     * @throws UnforgettableSDKError on failure
     */
    suspend fun getRecoveredKey(): String {
        val recoveredData = getRecoveredData()
        return recoveredData.recoveryKey
    }
}
