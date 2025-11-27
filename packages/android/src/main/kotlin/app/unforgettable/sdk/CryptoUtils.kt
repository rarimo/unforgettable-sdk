package app.unforgettable.sdk

import com.google.crypto.tink.subtle.X25519
import com.google.crypto.tink.subtle.Hkdf
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

// Cryptographic constants
private const val X25519_PUBLIC_KEY_SIZE = 32 // bytes
private const val CHACHA20_NONCE_SIZE = 12 // bytes (96 bits)
private const val POLY1305_TAG_SIZE = 16 // bytes (128 bits)
private const val HKDF_KEY_SIZE = 32 // bytes (256 bits)
private const val MIN_ENCRYPTED_SIZE = X25519_PUBLIC_KEY_SIZE + CHACHA20_NONCE_SIZE + POLY1305_TAG_SIZE

sealed class CryptoError : Exception() {
    object KeyGenerationFailed : CryptoError()
    object EncryptionFailed : CryptoError()
    object DecryptionFailed : CryptoError()
    object InvalidPublicKey : CryptoError()
    object EncodingFailed : CryptoError()
    object DecodingFailed : CryptoError()
    object InvalidCiphertext : CryptoError()
}

class DataTransferKeyPair(
    val publicKey: String,
    private val privateKey: ByteArray
) {
    fun decrypt(encryptedData: String): String {
        return try {
            // Encrypted data format: [32 bytes ephemeral public key][12 bytes nonce][ciphertext + 16 bytes auth tag]
            val combined = base64URLDecode(encryptedData)
            
            if (combined.size < MIN_ENCRYPTED_SIZE) {
                throw CryptoError.InvalidCiphertext
            }
            
            // Extract ephemeral public key (bytes 0-31)
            val ephemeralPublicKey = combined.sliceArray(0 until X25519_PUBLIC_KEY_SIZE)
            
            // Extract nonce (bytes 32-43)
            val nonce = combined.sliceArray(X25519_PUBLIC_KEY_SIZE until X25519_PUBLIC_KEY_SIZE + CHACHA20_NONCE_SIZE)
            
            // Extract ciphertext with authentication tag (bytes 44+)
            val ciphertextWithTag = combined.sliceArray(X25519_PUBLIC_KEY_SIZE + CHACHA20_NONCE_SIZE until combined.size)
            
            // Perform X25519 key exchange: our private key + their ephemeral public key = shared secret
            val sharedSecret = X25519.computeSharedSecret(privateKey, ephemeralPublicKey)
            
            // Derive the actual encryption key from shared secret using HKDF
            val encryptionKey = deriveEncryptionKey(sharedSecret)
            
            val decryptedBytes = decryptChaCha20Poly1305(encryptionKey, nonce, ciphertextWithTag)
            
            String(decryptedBytes, Charsets.UTF_8)
        } catch (e: Exception) {
            throw CryptoError.DecryptionFailed
        }
    }
    
    fun decryptBinary(encryptedBytes: ByteArray): String {
        val base64URLString = String(encryptedBytes, Charsets.ISO_8859_1)
        return decrypt(base64URLString)
    }
}

fun generateDataTransferKeyPair(): DataTransferKeyPair {
    return try {
        val privateKey = X25519.generatePrivateKey()
        val publicKey = X25519.publicFromPrivate(privateKey)
        val publicKeyBase64URL = base64URLEncode(publicKey)
        
        DataTransferKeyPair(publicKeyBase64URL, privateKey)
    } catch (e: Exception) {
        throw CryptoError.KeyGenerationFailed
    }
}

fun encryptDataTransferData(publicKey: String, data: String): String {
    return try {
        val recipientPublicKey = base64URLDecode(publicKey)
        if (recipientPublicKey.size != X25519_PUBLIC_KEY_SIZE) {
            throw CryptoError.InvalidPublicKey
        }
        
        val ephemeralPrivateKey = X25519.generatePrivateKey()
        val ephemeralPublicKey = X25519.publicFromPrivate(ephemeralPrivateKey)
        
        val sharedSecret = X25519.computeSharedSecret(ephemeralPrivateKey, recipientPublicKey)
        val encryptionKey = deriveEncryptionKey(sharedSecret)
        
        val nonce = ByteArray(CHACHA20_NONCE_SIZE)
        SecureRandom().nextBytes(nonce)
        
        val dataBytes = data.toByteArray(Charsets.UTF_8)
        val ciphertextWithTag = encryptChaCha20Poly1305(encryptionKey, nonce, dataBytes) // Includes 16-byte Poly1305 authentication tag
        
        // Build encrypted data format: [32 bytes ephemeral public key][12 bytes nonce][ciphertext + 16 bytes auth tag]
        val combined = ByteArray(X25519_PUBLIC_KEY_SIZE + CHACHA20_NONCE_SIZE + ciphertextWithTag.size)
        System.arraycopy(ephemeralPublicKey, 0, combined, 0, X25519_PUBLIC_KEY_SIZE) // Bytes 0-31: ephemeral public key
        System.arraycopy(nonce, 0, combined, X25519_PUBLIC_KEY_SIZE, CHACHA20_NONCE_SIZE) // Bytes 32-43: nonce
        System.arraycopy(ciphertextWithTag, 0, combined, X25519_PUBLIC_KEY_SIZE + CHACHA20_NONCE_SIZE, ciphertextWithTag.size) // Bytes 44+: ciphertext + tag
        
        base64URLEncode(combined)
    } catch (e: Exception) {
        throw CryptoError.EncryptionFailed
    }
}

private fun encryptChaCha20Poly1305(key: ByteArray, nonce: ByteArray, plaintext: ByteArray): ByteArray {
    val cipher = Cipher.getInstance("ChaCha20-Poly1305")
    val keySpec = SecretKeySpec(key, "ChaCha20")
    val ivSpec = IvParameterSpec(nonce)
    cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec)
    return cipher.doFinal(plaintext)
}

private fun decryptChaCha20Poly1305(key: ByteArray, nonce: ByteArray, ciphertext: ByteArray): ByteArray {
    val cipher = Cipher.getInstance("ChaCha20-Poly1305")
    val keySpec = SecretKeySpec(key, "ChaCha20")
    val ivSpec = IvParameterSpec(nonce)
    cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec)
    return cipher.doFinal(ciphertext)
}

private fun deriveEncryptionKey(sharedSecret: ByteArray, info: String = "unforgettable-encryption"): ByteArray {
    val infoBytes = info.toByteArray(Charsets.UTF_8)
    return Hkdf.computeHkdf("HmacSha256", sharedSecret, null, infoBytes, HKDF_KEY_SIZE)
}

private fun base64URLEncode(data: ByteArray): String {
    val base64 = Base64.getEncoder().encodeToString(data)
    return base64
        .replace("+", "-")
        .replace("/", "_")
        .replace("=", "")
}

private fun base64URLDecode(string: String): ByteArray {
    var base64 = string
        .replace("-", "+")
        .replace("_", "/")
    
    val remainder = base64.length % 4
    if (remainder > 0) {
        base64 += "=".repeat(4 - remainder)
    }
    
    return Base64.getDecoder().decode(base64)
}
