package app.unforgettable.sdk

const val UNFORGETTABLE_APP_URL = "https://unforgettable.app"
const val UNFORGETTABLE_API_URL = "https://api.unforgettable.app"

enum class RecoveryFactor(val value: Int) {
    FACE(1),
    IMAGE(2),
    PASSWORD(3);

    companion object {
        fun fromValue(value: Int): RecoveryFactor? {
            return values().firstOrNull { it.value == value }
        }

        val ALL_RECOVERY_FACTORS: List<RecoveryFactor> = values().toList()
    }
}
