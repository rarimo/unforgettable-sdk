package app.unforgettable.sdk

import com.google.crypto.tink.subtle.X25519
import com.google.crypto.tink.subtle.Hkdf
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

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
            val combined = base64URLDecode(encryptedData)
            
            if (combined.size < 32 + 12 + 16) {
                throw CryptoError.InvalidCiphertext
            }
            
            val ephemeralPublicKey = combined.sliceArray(0 until 32)
            val nonce = combined.sliceArray(32 until 44)
            val ciphertext = combined.sliceArray(44 until combined.size)
            
            val sharedSecret = X25519.computeSharedSecret(privateKey, ephemeralPublicKey)
            val encryptionKey = deriveEncryptionKey(sharedSecret)
            
            val decryptedBytes = decryptChaCha20Poly1305(encryptionKey, nonce, ciphertext)
            
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
        if (recipientPublicKey.size != 32) {
            throw CryptoError.InvalidPublicKey
        }
        
        val ephemeralPrivateKey = X25519.generatePrivateKey()
        val ephemeralPublicKey = X25519.publicFromPrivate(ephemeralPrivateKey)
        
        val sharedSecret = X25519.computeSharedSecret(ephemeralPrivateKey, recipientPublicKey)
        val encryptionKey = deriveEncryptionKey(sharedSecret)
        
        val nonce = ByteArray(12)
        SecureRandom().nextBytes(nonce)
        
        val dataBytes = data.toByteArray(Charsets.UTF_8)
        val encrypted = encryptChaCha20Poly1305(encryptionKey, nonce, dataBytes)
        
        val combined = ByteArray(32 + 12 + encrypted.size)
        System.arraycopy(ephemeralPublicKey, 0, combined, 0, 32)
        System.arraycopy(nonce, 0, combined, 32, 12)
        System.arraycopy(encrypted, 0, combined, 44, encrypted.size)
        
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
    return Hkdf.computeHkdf("HmacSha256", sharedSecret, null, infoBytes, 32)
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
