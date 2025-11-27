package app.unforgettable.sdk

import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class LocationHashTest {
    
    @Test
    fun `test compose location hash`() {
        val params = UnforgettablePathParams(
            dataTransferId = "test-id-123",
            encryptionPublicKey = "test-key",
            factors = listOf(RecoveryFactor.FACE, RecoveryFactor.PASSWORD),
            walletAddress = "0x123"
        )
        
        val hash = composeUnforgettableLocationHash(params)
        
        assertTrue(hash.startsWith("#"))
        assertTrue(hash.contains("id=test-id-123"))
        assertTrue(hash.contains("epk=test-key"))
        assertTrue(hash.contains("f=1%2C3") || hash.contains("f=1,3"))
        assertTrue(hash.contains("wa=0x123"))
    }
    
    @Test
    fun `test compose location hash without wallet`() {
        val params = UnforgettablePathParams(
            dataTransferId = "test-id",
            encryptionPublicKey = "key",
            factors = listOf(RecoveryFactor.IMAGE)
        )
        
        val hash = composeUnforgettableLocationHash(params)
        
        assertTrue(hash.startsWith("#"))
        assertTrue(hash.contains("id=test-id"))
        assertTrue(hash.contains("epk=key"))
        assertTrue(hash.contains("f=2"))
        assertFalse(hash.contains("wa="))
    }
    
    @Test
    fun `test parse location hash`() {
        val hash = "#id=test-123&epk=my-key&f=1,3&wa=0xabc"
        
        val params = parseUnforgettableLocationHash(hash)
        
        assertEquals("test-123", params.dataTransferId)
        assertEquals("my-key", params.encryptionPublicKey)
        assertEquals(2, params.factors.size)
        assertEquals(RecoveryFactor.FACE, params.factors[0])
        assertEquals(RecoveryFactor.PASSWORD, params.factors[1])
        assertEquals("0xabc", params.walletAddress)
    }
    
    @Test
    fun `test parse location hash without hash prefix`() {
        val hash = "id=test&epk=key&f=4"
        
        val params = parseUnforgettableLocationHash(hash)
        
        assertEquals("test", params.dataTransferId)
        assertEquals("key", params.encryptionPublicKey)
        assertEquals(1, params.factors.size)
        assertEquals(RecoveryFactor.OBJECT, params.factors[0])
    }
    
    @Test
    fun `test parse invalid location hash throws`() {
        val invalidHash = "#invalid"
        
        assertFailsWith<LocationHashError.InvalidParameters> {
            parseUnforgettableLocationHash(invalidHash)
        }
    }
    
    @Test
    fun `test parse invalid factor throws`() {
        val hash = "#id=test&epk=key&f=99"
        
        assertFailsWith<LocationHashError.InvalidFactorId> {
            parseUnforgettableLocationHash(hash)
        }
    }
    
    @Test
    fun `test round trip location hash`() {
        val originalParams = UnforgettablePathParams(
            dataTransferId = "uuid-123",
            encryptionPublicKey = "public-key-data",
            factors = listOf(RecoveryFactor.FACE, RecoveryFactor.IMAGE, RecoveryFactor.PASSWORD),
            walletAddress = "0x456"
        )
        
        val hash = composeUnforgettableLocationHash(originalParams)
        val parsedParams = parseUnforgettableLocationHash(hash)
        
        assertEquals(originalParams.dataTransferId, parsedParams.dataTransferId)
        assertEquals(originalParams.encryptionPublicKey, parsedParams.encryptionPublicKey)
        assertEquals(originalParams.factors, parsedParams.factors)
        assertEquals(originalParams.walletAddress, parsedParams.walletAddress)
    }
}
