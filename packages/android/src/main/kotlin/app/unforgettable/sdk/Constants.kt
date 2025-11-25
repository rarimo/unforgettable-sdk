package app.unforgettable.sdk

/**
 * Default URL for the Unforgettable application
 */
const val UNFORGETTABLE_APP_URL = "https://unforgettable.app"

/**
 * Default URL for the Unforgettable API
 */
const val UNFORGETTABLE_API_URL = "https://api.unforgettable.app"

/**
 * Available recovery factors for authentication
 */
enum class RecoveryFactor(val value: Int) {
    FACE(1),
    IMAGE(2),
    PASSWORD(3),
    OBJECT(4),
    BOOK(5),
    GEOLOCATION(6);

    companion object {
        /**
         * Get RecoveryFactor from its integer value
         */
        fun fromValue(value: Int): RecoveryFactor? {
            return values().firstOrNull { it.value == value }
        }

        /**
         * All available recovery factors
         */
        val ALL_RECOVERY_FACTORS: List<RecoveryFactor> = values().toList()
    }
}
