package app.unforgettable.sdk

import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

class CryptoUtilsTest {
    
    @Test
    fun `test generate key pair`() {
        val keyPair = generateDataTransferKeyPair()
        
        assertTrue(keyPair.publicKey.isNotEmpty())
        assertTrue(keyPair.publicKey.matches(Regex("^[A-Za-z0-9_-]+$")))
    }
    
    @Test
    fun `test encrypt and decrypt`() {
        val keyPair = generateDataTransferKeyPair()
        val originalData = "Hello, World!"
        
        val encrypted = encryptDataTransferData(keyPair.publicKey, originalData)
        assertNotEquals(encrypted, originalData)
        
        val decrypted = keyPair.decrypt(encrypted)
        assertEquals(originalData, decrypted)
    }
    
    @Test
    fun `test encrypt and decrypt long data`() {
        val keyPair = generateDataTransferKeyPair()
        val originalData = "A".repeat(100)
        
        val encrypted = encryptDataTransferData(keyPair.publicKey, originalData)
        val decrypted = keyPair.decrypt(encrypted)
        
        assertEquals(originalData, decrypted)
    }
    
    @Test
    fun `test multiple key pairs are different`() {
        val keyPair1 = generateDataTransferKeyPair()
        val keyPair2 = generateDataTransferKeyPair()
        
        assertNotEquals(keyPair1.publicKey, keyPair2.publicKey)
    }
}
