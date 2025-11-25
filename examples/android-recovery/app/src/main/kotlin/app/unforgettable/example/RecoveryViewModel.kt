package app.unforgettable.example

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.unforgettable.sdk.UnforgettableSDK
import app.unforgettable.sdk.UnforgettableMode
import app.unforgettable.sdk.UnforgettableSdkOptions
import app.unforgettable.sdk.RecoveryFactor
import app.unforgettable.sdk.UnforgettableSDKError
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.spongycastle.jce.ECNamedCurveTable
import org.spongycastle.jce.spec.ECPrivateKeySpec
import org.spongycastle.jce.provider.BouncyCastleProvider
import org.spongycastle.jce.interfaces.ECPrivateKey
import org.spongycastle.crypto.digests.KeccakDigest
import java.math.BigInteger
import java.security.KeyFactory
import java.security.Security

class RecoveryViewModel : ViewModel() {
    private val _mode = MutableStateFlow(UnforgettableMode.CREATE)
    val mode: StateFlow<UnforgettableMode> = _mode.asStateFlow()
    
    private val _selectedFactors = MutableStateFlow(setOf(RecoveryFactor.FACE, RecoveryFactor.PASSWORD))
    val selectedFactors: StateFlow<Set<RecoveryFactor>> = _selectedFactors.asStateFlow()
    
    private val _walletAddress = MutableStateFlow("")
    val walletAddress: StateFlow<String> = _walletAddress.asStateFlow()
    
    private val _group = MutableStateFlow("")
    val group: StateFlow<String> = _group.asStateFlow()
    
    private val _recoveryUrl = MutableStateFlow("")
    val recoveryUrl: StateFlow<String> = _recoveryUrl.asStateFlow()
    
    private val _isWebViewVisible = MutableStateFlow(false)
    val isWebViewVisible: StateFlow<Boolean> = _isWebViewVisible.asStateFlow()
    
    private val _isPolling = MutableStateFlow(false)
    val isPolling: StateFlow<Boolean> = _isPolling.asStateFlow()
    
    private val _recoveredKey = MutableStateFlow("")
    val recoveredKey: StateFlow<String> = _recoveredKey.asStateFlow()
    
    private val _recoveredWalletAddress = MutableStateFlow("")
    val recoveredWalletAddress: StateFlow<String> = _recoveredWalletAddress.asStateFlow()
    
    private val _errorMessage = MutableStateFlow("")
    val errorMessage: StateFlow<String> = _errorMessage.asStateFlow()
    
    private val _statusMessage = MutableStateFlow("")
    val statusMessage: StateFlow<String> = _statusMessage.asStateFlow()
    
    private var sdk: UnforgettableSDK? = null
    private var pollingJob: Job? = null
    
    val allFactors = RecoveryFactor.values().toList()
    
    fun setMode(newMode: UnforgettableMode) {
        _mode.value = newMode
    }
    
    fun toggleFactor(factor: RecoveryFactor) {
        val current = _selectedFactors.value.toMutableSet()
        if (current.contains(factor)) {
            current.remove(factor)
        } else {
            current.add(factor)
        }
        _selectedFactors.value = current
    }
    
    fun setWalletAddress(address: String) {
        _walletAddress.value = address
    }
    
    fun setGroup(groupValue: String) {
        _group.value = groupValue
    }
    
    fun generateRecoveryUrl() {
        _errorMessage.value = ""
        _statusMessage.value = ""
        _recoveredKey.value = ""
        _recoveredWalletAddress.value = ""
        
        if (_selectedFactors.value.isEmpty()) {
            _errorMessage.value = "Please select at least one recovery factor"
            return
        }
        
        try {
            val options = UnforgettableSdkOptions(
                mode = _mode.value,
                factors = _selectedFactors.value.toList(),
                walletAddress = if (_walletAddress.value.isEmpty()) null else _walletAddress.value,
                group = if (_group.value.isEmpty()) null else _group.value
            )
            
            sdk = UnforgettableSDK(options)
            _recoveryUrl.value = sdk!!.getRecoveryUrl()
            _statusMessage.value = "Recovery URL generated successfully!"
        } catch (e: Exception) {
            _errorMessage.value = "Failed to generate URL: ${e.message}"
        }
    }
    
    fun openInWebView() {
        if (_recoveryUrl.value.isEmpty()) return
        _isWebViewVisible.value = true
        startPolling()
    }
    
    fun closeWebView() {
        _isWebViewVisible.value = false
    }
    
    fun startPolling() {
        val currentSdk = sdk ?: return
        
        stopPolling()
        _isPolling.value = true
        _statusMessage.value = "Waiting for recovery data..."
        
        pollingJob = viewModelScope.launch {
            while (true) {
                try {
                    val recoveredData = currentSdk.getRecoveredData()
                    
                    _recoveredKey.value = recoveredData.recoveryKey
                    _recoveredWalletAddress.value = deriveEthereumAddress(recoveredData.recoveryKey)
                    _statusMessage.value = "✅ Recovery successful!"
                    _isPolling.value = false
                    _isWebViewVisible.value = false
                    
                    recoveredData.helperDataUrl?.let { url ->
                        _statusMessage.value += "\n\nHelper Data URL: $url"
                    }
                    break
                } catch (e: UnforgettableSDKError.NotFound) {
                    // Data not available yet, continue polling
                    delay(2000) // 2 seconds
                } catch (e: Exception) {
                    _errorMessage.value = "Recovery failed: ${e.message}"
                    _isPolling.value = false
                    break
                }
            }
        }
    }
    
    fun stopPolling() {
        pollingJob?.cancel()
        pollingJob = null
        _isPolling.value = false
    }
    
    fun setStatusMessage(message: String) {
        _statusMessage.value = message
    }
    
    override fun onCleared() {
        super.onCleared()
        stopPolling()
    }
    
    private fun deriveEthereumAddress(privateKey: String): String {
        return try {
            // Register SpongyCastle provider
            Security.insertProviderAt(BouncyCastleProvider(), 1)
            
            // Remove 0x prefix if present
            val cleanKey = privateKey.removePrefix("0x")
            
            // Convert hex to BigInteger
            val privateKeyInt = BigInteger(cleanKey, 16)
            
            // Get secp256k1 curve parameters
            val ecSpec = ECNamedCurveTable.getParameterSpec("secp256k1")
            
            // Create private key spec
            val privateKeySpec = ECPrivateKeySpec(privateKeyInt, ecSpec)
            
            // Generate private key
            val keyFactory = KeyFactory.getInstance("EC", "SC")
            val privKey = keyFactory.generatePrivate(privateKeySpec) as ECPrivateKey
            
            // Derive public key point
            val publicPoint = ecSpec.g.multiply(privKey.d).normalize()
            
            // Get uncompressed public key bytes (skip the 0x04 prefix)
            val pubKeyX = publicPoint.xCoord.encoded
            val pubKeyY = publicPoint.yCoord.encoded
            val publicKeyBytes = pubKeyX + pubKeyY
            
            // Apply Keccak-256 hash
            val keccak = KeccakDigest(256)
            keccak.update(publicKeyBytes, 0, publicKeyBytes.size)
            val hash = ByteArray(keccak.digestSize)
            keccak.doFinal(hash, 0)
            
            // Take last 20 bytes for Ethereum address
            val addressBytes = hash.sliceArray(12 until hash.size)
            val addressHex = addressBytes.joinToString("") { "%02x".format(it) }
            
            // Apply EIP-55 checksum (mixed case)
            val checksumHash = ByteArray(32)
            val checksumKeccak = KeccakDigest(256)
            checksumKeccak.update(addressHex.toByteArray(), 0, addressHex.length)
            checksumKeccak.doFinal(checksumHash, 0)
            
            val checksumAddress = addressHex.mapIndexed { i, c ->
                if (c in '0'..'9') c
                else {
                    val hashByte = checksumHash[i / 2].toInt() and 0xFF
                    val nibble = if (i % 2 == 0) hashByte shr 4 else hashByte and 0x0F
                    if (nibble >= 8) c.uppercaseChar() else c.lowercaseChar()
                }
            }.joinToString("")
            
            "0x$checksumAddress"
        } catch (e: Exception) {
            "Error: ${e.message}"
        }
    }
}
