import Foundation

/// The mode for the Unforgettable SDK
public enum UnforgettableMode: String, Codable {
    case create
    case restore
}

/// Options for initializing the Unforgettable SDK
public struct UnforgettableSdkOptions {
    public let mode: UnforgettableMode
    public let appUrl: String
    public let apiUrl: String
    public let factors: [RecoveryFactor]
    public let walletAddress: String?
    public let group: String?
    public let customParams: [String: String]?
    
    public init(
        mode: UnforgettableMode,
        appUrl: String = UNFORGETTABLE_APP_URL,
        apiUrl: String = UNFORGETTABLE_API_URL,
        factors: [RecoveryFactor] = [],
        walletAddress: String? = nil,
        group: String? = nil,
        customParams: [String: String]? = nil
    ) {
        self.mode = mode
        self.appUrl = appUrl
        self.apiUrl = apiUrl
        self.factors = factors
        self.walletAddress = walletAddress
        self.group = group
        self.customParams = customParams
    }
}

/// Payload inside the data transfer
struct DataTransferPayload: Codable {
    let recovery_key: String
    let helper_data_url: String?
}

/// Recovered data from the API
public struct RecoveredData {
    public let recoveryKey: String
    public let helperDataUrl: String?
    
    public init(recoveryKey: String, helperDataUrl: String? = nil) {
        self.recoveryKey = recoveryKey
        self.helperDataUrl = helperDataUrl
    }
}

/// Errors that can occur in the SDK
public enum UnforgettableSDKError: Error {
    case networkError(Error)
    case invalidResponse
    case notFound
    case decodingError(Error)
    case cryptoError(Error)
}

/// Main SDK class for Unforgettable
public class UnforgettableSDK {
    public let mode: UnforgettableMode
    public let appUrl: String
    public let factors: [RecoveryFactor]
    public let walletAddress: String?
    public let group: String?
    public let customParams: [String: String]?
    
    private let apiUrl: String
    private let dataTransferId: String
    private let encryptionKeyPair: DataTransferKeyPair
    
    /// Initializes the Unforgettable SDK
    /// - Parameter options: Configuration options
    /// - Throws: CryptoError if key generation fails
    public init(options: UnforgettableSdkOptions) throws {
        self.mode = options.mode
        self.appUrl = options.appUrl
        self.apiUrl = options.apiUrl
        self.factors = options.factors
        self.walletAddress = options.walletAddress
        self.group = options.group
        self.customParams = options.customParams
        
        self.dataTransferId = UUID().uuidString.lowercased()
        self.encryptionKeyPair = try generateDataTransferKeyPair()
    }
    
    /// Generates the recovery URL
    /// - Returns: The recovery URL as a string
    public func getRecoveryUrl() -> String {
        let baseUrl = appUrl.hasSuffix("/") ? String(appUrl.dropLast()) : appUrl
        let path = mode == .restore ? "/r" : "/c"
        
        let urlString = baseUrl + path
        
        let hash = composeUnforgettableLocationHash(params: UnforgettablePathParams(
            dataTransferId: dataTransferId,
            encryptionPublicKey: encryptionKeyPair.publicKey,
            factors: factors,
            walletAddress: walletAddress,
            group: group,
            customParams: customParams
        ))
        
        return urlString + hash
    }
    
    /// Retrieves the recovered data from the API
    /// - Returns: The recovered data
    /// - Throws: UnforgettableSDKError on failure
    public func getRecoveredData() async throws -> RecoveredData {
        let endpoint = "/integrations/helper-keeper/v1/public/data-transfers/\(dataTransferId)"
        let urlString = apiUrl + endpoint
        
        guard let url = URL(string: urlString) else {
            throw UnforgettableSDKError.invalidResponse
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw UnforgettableSDKError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            if httpResponse.statusCode == 404 {
                throw UnforgettableSDKError.notFound
            }
            throw UnforgettableSDKError.invalidResponse
        }
        
        // Parse the response
        let decoder = JSONDecoder()
        let dataTransferResponse: DataTransferResponse
        
        do {
            dataTransferResponse = try decoder.decode(DataTransferResponse.self, from: data)
        } catch {
            throw UnforgettableSDKError.decodingError(error)
        }
        
        guard let dataTransferWrapper = dataTransferResponse.data else {
            throw UnforgettableSDKError.notFound
        }
        
        // Parse the nested payload from attributes.data
        let payload: DataTransferPayload
        do {
            guard let payloadData = dataTransferWrapper.attributes.data.data(using: .utf8) else {
                throw UnforgettableSDKError.decodingError(NSError(domain: "UnforgettableSDK", code: -1))
            }
            payload = try decoder.decode(DataTransferPayload.self, from: payloadData)
        } catch {
            throw UnforgettableSDKError.decodingError(error)
        }
        
        // The recovery_key contains raw binary data incorrectly encoded as a UTF-8 string
        // We need to convert it back to Data by reading the raw bytes
        guard let encryptedData = payload.recovery_key.data(using: .isoLatin1) else {
            throw UnforgettableSDKError.decodingError(NSError(domain: "UnforgettableSDK", code: -2))
        }
        
        // Decrypt the recovery key using the binary data directly
        let decryptedKey: String
        do {
            decryptedKey = try encryptionKeyPair.decryptBinary(encryptedData)
        } catch {
            throw UnforgettableSDKError.cryptoError(error)
        }
        
        return RecoveredData(
            recoveryKey: decryptedKey,
            helperDataUrl: payload.helper_data_url
        )
    }
    
    /// Retrieves only the recovered key
    /// - Returns: The recovered key as a string
    /// - Throws: UnforgettableSDKError on failure
    public func getRecoveredKey() async throws -> String {
        let recoveredData = try await getRecoveredData()
        return recoveredData.recoveryKey
    }
}

// MARK: - Response Models

private struct DataTransferResponse: Codable {
    let data: DataTransferWrapper?
}

private struct DataTransferWrapper: Codable {
    let id: String
    let type: String
    let attributes: DataTransferAttributes
}

private struct DataTransferAttributes: Codable {
    let data: String
}
