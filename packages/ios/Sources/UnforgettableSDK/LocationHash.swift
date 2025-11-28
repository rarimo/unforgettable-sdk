import Foundation

/// Parameters for Unforgettable location hash
public struct UnforgettablePathParams {
    public let dataTransferId: String
    public let encryptionPublicKey: String
    public let factors: [RecoveryFactor]
    public let walletAddress: String?
    public let group: String?
    public let customParams: [String: String]?
    
    public init(
        dataTransferId: String,
        encryptionPublicKey: String,
        factors: [RecoveryFactor],
        walletAddress: String? = nil,
        group: String? = nil,
        customParams: [String: String]? = nil
    ) {
        self.dataTransferId = dataTransferId
        self.encryptionPublicKey = encryptionPublicKey
        self.factors = factors
        self.walletAddress = walletAddress
        self.group = group
        self.customParams = customParams
    }
}

/// Keys used in URL parameters
private enum ParamsKey: String {
    case dataTransferId = "id"
    case encryptionPublicKey = "epk"
    case factors = "f"
    case walletAddress = "wa"
    case group = "g"
}

private let ALL_PARAMS_KEYS: [String] = [
    ParamsKey.dataTransferId.rawValue,
    ParamsKey.encryptionPublicKey.rawValue,
    ParamsKey.factors.rawValue,
    ParamsKey.walletAddress.rawValue,
    ParamsKey.group.rawValue
]

/// Errors that can occur when parsing location hash
public enum LocationHashError: Error {
    case invalidParameters
    case invalidFactorId(String)
    case nonIntegerFactor(String)
}

/// Composes a location hash from parameters
/// - Parameter params: The parameters to encode
/// - Returns: A location hash string starting with #
public func composeUnforgettableLocationHash(params: UnforgettablePathParams) -> String {
    var components = URLComponents()
    components.queryItems = []
    
    components.queryItems?.append(URLQueryItem(
        name: ParamsKey.dataTransferId.rawValue,
        value: params.dataTransferId
    ))
    
    components.queryItems?.append(URLQueryItem(
        name: ParamsKey.encryptionPublicKey.rawValue,
        value: params.encryptionPublicKey
    ))
    
    let factorsString = params.factors.map { String($0.rawValue) }.joined(separator: ",")
    components.queryItems?.append(URLQueryItem(
        name: ParamsKey.factors.rawValue,
        value: factorsString
    ))
    
    if let walletAddress = params.walletAddress {
        components.queryItems?.append(URLQueryItem(
            name: ParamsKey.walletAddress.rawValue,
            value: walletAddress
        ))
    }
    
    if let group = params.group {
        components.queryItems?.append(URLQueryItem(
            name: ParamsKey.group.rawValue,
            value: group
        ))
    }
    
    if let customParams = params.customParams {
        for (key, value) in customParams {
            if !ALL_PARAMS_KEYS.contains(key) {
                components.queryItems?.append(URLQueryItem(
                    name: key,
                    value: value
                ))
            }
        }
    }
    
    return "#" + (components.query ?? "")
}

/// Parses a location hash into parameters
/// - Parameter hash: The location hash string (with or without leading #)
/// - Returns: The parsed parameters
/// - Throws: LocationHashError if parsing fails
public func parseUnforgettableLocationHash(_ hash: String) throws -> UnforgettablePathParams {
    let rawParams = hash.hasPrefix("#") ? String(hash.dropFirst()) : hash
    
    guard let components = URLComponents(string: "?" + rawParams),
          let queryItems = components.queryItems else {
        throw LocationHashError.invalidParameters
    }
    
    var params: [String: String] = [:]
    var customParams: [String: String] = [:]
    
    for item in queryItems {
        if let value = item.value {
            params[item.name] = value
            if !ALL_PARAMS_KEYS.contains(item.name) {
                customParams[item.name] = value
            }
        }
    }
    
    guard let dataTransferId = params[ParamsKey.dataTransferId.rawValue],
          let encryptionPublicKey = params[ParamsKey.encryptionPublicKey.rawValue],
          !dataTransferId.isEmpty,
          !encryptionPublicKey.isEmpty else {
        throw LocationHashError.invalidParameters
    }
    
    let factors = try parseFactors(params[ParamsKey.factors.rawValue] ?? "")
    let walletAddress = params[ParamsKey.walletAddress.rawValue]
    let group = params[ParamsKey.group.rawValue]
    
    return UnforgettablePathParams(
        dataTransferId: dataTransferId,
        encryptionPublicKey: encryptionPublicKey,
        factors: factors,
        walletAddress: walletAddress,
        group: group,
        customParams: customParams.isEmpty ? nil : customParams
    )
}

// MARK: - Private Helpers

private func parseFactors(_ rawFactors: String) throws -> [RecoveryFactor] {
    if rawFactors.isEmpty {
        return []
    }
    
    let factorStrings = rawFactors.split(separator: ",").map(String.init).filter { !$0.isEmpty }
    var factors: [RecoveryFactor] = []
    
    for rawFactor in factorStrings {
        guard let num = Int(rawFactor) else {
            throw LocationHashError.nonIntegerFactor(rawFactor)
        }
        
        guard let factor = RecoveryFactor(rawValue: num) else {
            throw LocationHashError.invalidFactorId(rawFactor)
        }
        
        factors.append(factor)
    }
    
    return factors
}
