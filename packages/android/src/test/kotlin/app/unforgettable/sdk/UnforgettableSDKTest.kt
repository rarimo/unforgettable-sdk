package app.unforgettable.sdk

import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class UnforgettableSDKTest {
    
    @Test
    fun `test SDK initialization`() {
        val sdk = UnforgettableSDK(
            UnforgettableSdkOptions(
                mode = UnforgettableMode.CREATE,
                factors = listOf(RecoveryFactor.FACE, RecoveryFactor.PASSWORD),
                walletAddress = "0x1234567890abcdef"
            )
        )
        
        assertEquals(UnforgettableMode.CREATE, sdk.mode)
        assertEquals(2, sdk.factors.size)
        assertEquals("0x1234567890abcdef", sdk.walletAddress)
    }
    
    @Test
    fun `test get recovery URL for create mode`() {
        val sdk = UnforgettableSDK(
            UnforgettableSdkOptions(
                mode = UnforgettableMode.CREATE,
                factors = listOf(RecoveryFactor.FACE)
            )
        )
        
        val url = sdk.getRecoveryUrl()
        
        assertTrue(url.startsWith("https://unforgettable.app/c#"))
        assertTrue(url.contains("id="))
        assertTrue(url.contains("epk="))
        assertTrue(url.contains("f=1"))
    }
    
    @Test
    fun `test get recovery URL for restore mode`() {
        val sdk = UnforgettableSDK(
            UnforgettableSdkOptions(
                mode = UnforgettableMode.RESTORE,
                factors = listOf(RecoveryFactor.FACE, RecoveryFactor.PASSWORD),
                walletAddress = "0xabcdef"
            )
        )
        
        val url = sdk.getRecoveryUrl()
        
        assertTrue(url.startsWith("https://unforgettable.app/r#"))
        assertTrue(url.contains("id="))
        assertTrue(url.contains("epk="))
        assertTrue(url.contains("f=1") && url.contains("3"))
        assertTrue(url.contains("wa=0xabcdef"))
    }
    
    @Test
    fun `test recovery factor all cases`() {
        assertEquals(6, RecoveryFactor.values().size)
        assertEquals(6, RecoveryFactor.ALL_RECOVERY_FACTORS.size)
    }
    
    @Test
    fun `test recovery factor from value`() {
        assertEquals(RecoveryFactor.FACE, RecoveryFactor.fromValue(1))
        assertEquals(RecoveryFactor.IMAGE, RecoveryFactor.fromValue(2))
        assertEquals(RecoveryFactor.PASSWORD, RecoveryFactor.fromValue(3))
        assertEquals(RecoveryFactor.OBJECT, RecoveryFactor.fromValue(4))
        assertEquals(RecoveryFactor.BOOK, RecoveryFactor.fromValue(5))
        assertEquals(RecoveryFactor.GEOLOCATION, RecoveryFactor.fromValue(6))
        assertEquals(null, RecoveryFactor.fromValue(99))
    }
}
