package com.rarimo.unforgettable

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
        
        assertTrue(url.startsWith("https://unforgettable.app/sdk/c#"))
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
        
        assertTrue(url.startsWith("https://unforgettable.app/sdk/r#"))
        assertTrue(url.contains("id="))
        assertTrue(url.contains("epk="))
        assertTrue(url.contains("f=1") && url.contains("3"))
        assertTrue(url.contains("wa=0xabcdef"))
    }
    
    @Test
    fun `test recovery factor all cases`() {
        assertEquals(4, RecoveryFactor.values().size)
        assertEquals(4, RecoveryFactor.ALL_RECOVERY_FACTORS.size)
    }
    
    @Test
    fun `test recovery factor from value`() {
        assertEquals(RecoveryFactor.FACE, RecoveryFactor.fromValue(1))
        assertEquals(RecoveryFactor.IMAGE, RecoveryFactor.fromValue(2))
        assertEquals(RecoveryFactor.PASSWORD, RecoveryFactor.fromValue(3))
        assertEquals(RecoveryFactor.GEOLOCATION, RecoveryFactor.fromValue(4))
        assertEquals(null, RecoveryFactor.fromValue(99))
    }
    
    @Test
    fun `test SDK with group`() {
        val sdk = UnforgettableSDK(
            options = UnforgettableSdkOptions(
                mode = UnforgettableMode.CREATE,
                factors = listOf(RecoveryFactor.FACE),
                group = "test-group"
            )
        )
        
        assertEquals("test-group", sdk.group)
    }
    
    @Test
    fun `test SDK with custom params`() {
        val customParams = mapOf("t" to "dark", "d" to "data")
        val sdk = UnforgettableSDK(
            options = UnforgettableSdkOptions(
                mode = UnforgettableMode.CREATE,
                factors = listOf(RecoveryFactor.FACE),
                customParams = customParams
            )
        )
        
        assertEquals("dark", sdk.customParams?.get("t"))
        assertEquals("data", sdk.customParams?.get("d"))
    }
    
    @Test
    fun `test get recovery url with group`() {
        val sdk = UnforgettableSDK(
            options = UnforgettableSdkOptions(
                mode = UnforgettableMode.CREATE,
                factors = listOf(RecoveryFactor.FACE),
                group = "my-group"
            )
        )
        
        val url = sdk.getRecoveryUrl()
        
        assertTrue(url.contains("g=my-group"))
    }
    
    @Test
    fun `test get recovery url with custom params`() {
        val sdk = UnforgettableSDK(
            options = UnforgettableSdkOptions(
                mode = UnforgettableMode.CREATE,
                factors = listOf(RecoveryFactor.FACE),
                customParams = mapOf("t" to "light", "d" to "test")
            )
        )
        
        val url = sdk.getRecoveryUrl()
        
        assertTrue(url.contains("t=light"))
        assertTrue(url.contains("d=test"))
    }
    
    @Test
    fun `test get recovery url with custom app url`() {
        val sdk = UnforgettableSDK(
            options = UnforgettableSdkOptions(
                mode = UnforgettableMode.CREATE,
                factors = listOf(RecoveryFactor.FACE),
                appUrl = "https://custom.app"
            )
        )
        
        val url = sdk.getRecoveryUrl()
        
        assertTrue(url.startsWith("https://custom.app/c#"))
    }
}
