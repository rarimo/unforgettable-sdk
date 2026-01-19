import Foundation

public let UNFORGETTABLE_APP_URL = "https://unforgettable.app/sdk"
public let UNFORGETTABLE_API_URL = "https://api.unforgettable.app"

public enum RecoveryFactor: Int, CaseIterable, Codable {
    case face = 1
    case image = 2
    case password = 3
    case geolocation = 4
}

public let ALL_RECOVERY_FACTORS = RecoveryFactor.allCases
