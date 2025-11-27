import Foundation

/// Default URL for the Unforgettable application
public let UNFORGETTABLE_APP_URL = "https://unforgettable.app"

/// Default URL for the Unforgettable API
public let UNFORGETTABLE_API_URL = "https://api.unforgettable.app"

/// Available recovery factors for authentication
public enum RecoveryFactor: Int, CaseIterable, Codable {
    case face = 1
    case image = 2
    case password = 3
}

/// All available recovery factors
public let ALL_RECOVERY_FACTORS = RecoveryFactor.allCases
