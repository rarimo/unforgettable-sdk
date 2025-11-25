package app.unforgettable.sdk

import java.security.KeyPair
import java.util.Base64
import java.security.KeyPairGenerator
import java.security.PrivateKey
import java.security.PublicKey
import javax.crypto.Cipher

/**
 * Errors that can occur during cryptographic operations
 */
sealed class CryptoError : Exception() {
    object KeyGenerationFailed : CryptoError()
    object EncryptionFailed : CryptoError()
    object DecryptionFailed : CryptoError()
    object InvalidPublicKey : CryptoError()
    object EncodingFailed : CryptoError()
    object DecodingFailed : CryptoError()
}

/**
 * A key pair for data transfer encryption
 */
class DataTransferKeyPair(
    private val keyPair: KeyPair
) {
    /**
     * Base64 URL-encoded public key
     */
    val publicKey: String = convertToBase64URL(keyPair.public)

    /**
     * Encrypts data using the public key
     * @param data The string data to encrypt
     * @return The encrypted data as a base64-encoded string
     */
    fun encrypt(data: String): String {
        return try {
            val cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding")
            cipher.init(Cipher.ENCRYPT_MODE, keyPair.public)
            val encryptedBytes = cipher.doFinal(data.toByteArray(Charsets.UTF_8))
            Base64.getEncoder().encodeToString(encryptedBytes)
        } catch (e: Exception) {
            throw CryptoError.EncryptionFailed
        }
    }

    /**
     * Decrypts data using the private key
     * @param encryptedData The base64-encoded encrypted string data
     * @return The decrypted data as a string
     */
    fun decrypt(encryptedData: String): String {
        return try {
            val cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding")
            cipher.init(Cipher.DECRYPT_MODE, keyPair.private)
            val encryptedBytes = Base64.getDecoder().decode(encryptedData)
            val decryptedBytes = cipher.doFinal(encryptedBytes)
            String(decryptedBytes, Charsets.UTF_8)
        } catch (e: Exception) {
            throw CryptoError.DecryptionFailed
        }
    }

    private fun convertToBase64URL(publicKey: PublicKey): String {
        val pemData = createPEMFromPublicKey(publicKey)
        return pemToBase64URL(pemData)
    }

    private fun createPEMFromPublicKey(publicKey: PublicKey): String {
        val base64String = Base64.getEncoder().encodeToString(publicKey.encoded)
        val lines = base64String.chunked(64)
        
        return buildString {
            appendLine("-----BEGIN PUBLIC KEY-----")
            lines.forEach { line -> appendLine(line) }
            appendLine("-----END PUBLIC KEY-----")
        }
    }

    private fun pemToBase64URL(pem: String): String {
        return pem
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replace("\r", "")
            .replace("\n", "")
            .replace("+", "-")
            .replace("/", "_")
            .trim()
            .replace("=", "")
    }
}

/**
 * Generates a data transfer key pair
 * @param bits The key size in bits (default: 2048)
 * @return A DataTransferKeyPair
 */
fun generateDataTransferKeyPair(bits: Int = 2048): DataTransferKeyPair {
    return try {
        val keyPairGenerator = KeyPairGenerator.getInstance("RSA")
        keyPairGenerator.initialize(bits)
        val keyPair = keyPairGenerator.generateKeyPair()
        DataTransferKeyPair(keyPair)
    } catch (e: Exception) {
        throw CryptoError.KeyGenerationFailed
    }
}

/**
 * Encrypts data using a base64 URL-encoded public key
 * @param publicKey Base64 URL-encoded public key
 * @param data The string data to encrypt
 * @return The encrypted data as a base64-encoded string
 */
fun encryptDataTransferData(publicKey: String, data: String): String {
    return try {
        val pemKey = base64URLToPEM(publicKey)
        val publicKeyObj = extractPublicKey(pemKey)
        
        val cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding")
        cipher.init(Cipher.ENCRYPT_MODE, publicKeyObj)
        val encryptedBytes = cipher.doFinal(data.toByteArray(Charsets.UTF_8))
        Base64.getEncoder().encodeToString(encryptedBytes)
    } catch (e: Exception) {
        throw CryptoError.EncryptionFailed
    }
}

// Private helper functions

private fun base64URLToPEM(base64URL: String): String {
    var base64 = base64URL
        .replace("-", "+")
        .replace("_", "/")
    
    // Add padding
    val remainder = base64.length % 4
    if (remainder > 0) {
        base64 += "=".repeat(4 - remainder)
    }
    
    val lines = base64.chunked(64)
    return buildString {
        appendLine("-----BEGIN PUBLIC KEY-----")
        lines.forEach { appendLine(it) }
        appendLine("-----END PUBLIC KEY-----")
    }
}

private fun extractPublicKey(pem: String): PublicKey {
    try {
        val base64String = pem
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replace("\r", "")
            .replace("\n", "")
            .trim()
        
        val keyBytes = Base64.getDecoder().decode(base64String)
        val keySpec = java.security.spec.X509EncodedKeySpec(keyBytes)
        val keyFactory = java.security.KeyFactory.getInstance("RSA")
        return keyFactory.generatePublic(keySpec)
    } catch (e: Exception) {
        throw CryptoError.InvalidPublicKey
    }
}
