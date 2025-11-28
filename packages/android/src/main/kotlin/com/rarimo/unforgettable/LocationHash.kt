package com.rarimo.unforgettable

import java.net.URLEncoder
import java.net.URLDecoder

/**
 * Parameters for Unforgettable location hash
 */
data class UnforgettablePathParams(
    val dataTransferId: String,
    val encryptionPublicKey: String,
    val factors: List<RecoveryFactor>,
    val walletAddress: String? = null,
    val group: String? = null,
    val customParams: Map<String, String>? = null
)

/**
 * Keys used in URL parameters
 */
private enum class ParamsKey(val value: String) {
    DATA_TRANSFER_ID("id"),
    ENCRYPTION_PUBLIC_KEY("epk"),
    FACTORS("f"),
    WALLET_ADDRESS("wa"),
    GROUP("g")
}

private val ALL_PARAMS_KEYS = ParamsKey.values().map { it.value }

/**
 * Errors that can occur when parsing location hash
 */
sealed class LocationHashError : Exception() {
    object InvalidParameters : LocationHashError()
    data class InvalidFactorId(val factorId: String) : LocationHashError()
    data class NonIntegerFactor(val factor: String) : LocationHashError()
}

/**
 * Composes a location hash from parameters
 * @param params The parameters to encode
 * @return A location hash string starting with #
 */
fun composeUnforgettableLocationHash(params: UnforgettablePathParams): String {
    val queryParams = mutableListOf<String>()
    
    queryParams.add("${ParamsKey.DATA_TRANSFER_ID.value}=${URLEncoder.encode(params.dataTransferId, "UTF-8")}")
    queryParams.add("${ParamsKey.ENCRYPTION_PUBLIC_KEY.value}=${URLEncoder.encode(params.encryptionPublicKey, "UTF-8")}")
    queryParams.add("${ParamsKey.FACTORS.value}=${params.factors.joinToString(",") { it.value.toString() }}")
    
    params.walletAddress?.let {
        queryParams.add("${ParamsKey.WALLET_ADDRESS.value}=${URLEncoder.encode(it, "UTF-8")}")
    }
    
    params.group?.let {
        queryParams.add("${ParamsKey.GROUP.value}=${URLEncoder.encode(it, "UTF-8")}")
    }
    
    params.customParams?.forEach { (key, value) ->
        if (!ALL_PARAMS_KEYS.contains(key)) {
            queryParams.add("${URLEncoder.encode(key, "UTF-8")}=${URLEncoder.encode(value, "UTF-8")}")
        }
    }
    
    return "#${queryParams.joinToString("&")}"
}

/**
 * Parses a location hash into parameters
 * @param hash The location hash string (with or without leading #)
 * @return The parsed parameters
 * @throws LocationHashError if parsing fails
 */
fun parseUnforgettableLocationHash(hash: String): UnforgettablePathParams {
    val rawParams = if (hash.startsWith("#")) hash.substring(1) else hash
    
    val params = rawParams.split("&")
        .mapNotNull { param ->
            val parts = param.split("=", limit = 2)
            if (parts.size == 2) parts[0] to URLDecoder.decode(parts[1], "UTF-8")
            else null
        }
        .toMap()
    
    val customParams = params.filterKeys { !ALL_PARAMS_KEYS.contains(it) }
    
    val dataTransferId = params[ParamsKey.DATA_TRANSFER_ID.value]
    val encryptionPublicKey = params[ParamsKey.ENCRYPTION_PUBLIC_KEY.value]
    
    if (dataTransferId.isNullOrEmpty() || encryptionPublicKey.isNullOrEmpty()) {
        throw LocationHashError.InvalidParameters
    }
    
    val factors = parseFactors(params[ParamsKey.FACTORS.value] ?: "")
    val walletAddress = params[ParamsKey.WALLET_ADDRESS.value]
    val group = params[ParamsKey.GROUP.value]
    
    return UnforgettablePathParams(
        dataTransferId = dataTransferId,
        encryptionPublicKey = encryptionPublicKey,
        factors = factors,
        walletAddress = walletAddress,
        group = group,
        customParams = if (customParams.isEmpty()) null else customParams
    )
}

// Private helper functions

private fun parseFactors(rawFactors: String): List<RecoveryFactor> {
    if (rawFactors.isEmpty()) {
        return emptyList()
    }
    
    val factorStrings = rawFactors.split(",").filter { it.isNotEmpty() }
    val factors = mutableListOf<RecoveryFactor>()
    
    for (rawFactor in factorStrings) {
        val num = rawFactor.toIntOrNull()
            ?: throw LocationHashError.NonIntegerFactor(rawFactor)
        
        val factor = RecoveryFactor.fromValue(num)
            ?: throw LocationHashError.InvalidFactorId(rawFactor)
        
        factors.add(factor)
    }
    
    return factors
}
