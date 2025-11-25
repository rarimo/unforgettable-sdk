import Foundation
import Security

/// Errors that can occur during cryptographic operations
public enum CryptoError: Error {
    case keyGenerationFailed
    case encryptionFailed
    case decryptionFailed
    case invalidPublicKey
    case encodingFailed
    case decodingFailed
}

/// A key pair for data transfer encryption
public struct DataTransferKeyPair {
    /// Base64 URL-encoded public key
    public let publicKey: String
    
    /// The SecKey reference to the private key
    private let privateKey: SecKey
    
    /// The SecKey reference to the public key
    private let publicKeyRef: SecKey
    
    init(publicKey: String, privateKey: SecKey, publicKeyRef: SecKey) {
        self.publicKey = publicKey
        self.privateKey = privateKey
        self.publicKeyRef = publicKeyRef
    }
    
    /// Encrypts data using the public key
    /// - Parameter data: The string data to encrypt
    /// - Returns: The encrypted data as a base64-encoded string
    public func encrypt(_ data: String) throws -> String {
        guard let dataToEncrypt = data.data(using: .utf8) else {
            throw CryptoError.encodingFailed
        }
        
        var error: Unmanaged<CFError>?
        guard let encryptedData = SecKeyCreateEncryptedData(
            publicKeyRef,
            .rsaEncryptionPKCS1,
            dataToEncrypt as CFData,
            &error
        ) as Data? else {
            throw CryptoError.encryptionFailed
        }
        
        return encryptedData.base64EncodedString()
    }
    
    /// Decrypts data using the private key
    /// - Parameter encryptedData: The base64-encoded encrypted string data
    /// - Returns: The decrypted data as a string
    public func decrypt(_ encryptedData: String) throws -> String {
        guard let dataToDecrypt = Data(base64Encoded: encryptedData) else {
            throw CryptoError.decodingFailed
        }
        
        var error: Unmanaged<CFError>?
        guard let decryptedData = SecKeyCreateDecryptedData(
            privateKey,
            .rsaEncryptionPKCS1,
            dataToDecrypt as CFData,
            &error
        ) as Data? else {
            throw CryptoError.decryptionFailed
        }
        
        guard let result = String(data: decryptedData, encoding: .utf8) else {
            throw CryptoError.decodingFailed
        }
        
        return result
    }
    
    /// Decrypts binary data using the private key
    /// - Parameter encryptedData: The raw encrypted binary data
    /// - Returns: The decrypted data as a string
    public func decryptBinary(_ encryptedData: Data) throws -> String {
        var error: Unmanaged<CFError>?
        guard let decryptedData = SecKeyCreateDecryptedData(
            privateKey,
            .rsaEncryptionPKCS1,
            encryptedData as CFData,
            &error
        ) as Data? else {
            throw CryptoError.decryptionFailed
        }
        
        guard let result = String(data: decryptedData, encoding: .utf8) else {
            throw CryptoError.decodingFailed
        }
        
        return result
    }
}

/// Generates a data transfer key pair
/// - Parameter bits: The key size in bits (default: 2048)
/// - Returns: A DataTransferKeyPair
public func generateDataTransferKeyPair(bits: Int = 2048) throws -> DataTransferKeyPair {
    let attributes: [String: Any] = [
        kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
        kSecAttrKeySizeInBits as String: bits,
    ]
    
    var error: Unmanaged<CFError>?
    guard let privateKey = SecKeyCreateRandomKey(attributes as CFDictionary, &error) else {
        throw CryptoError.keyGenerationFailed
    }
    
    guard let publicKey = SecKeyCopyPublicKey(privateKey) else {
        throw CryptoError.keyGenerationFailed
    }
    
    // Export public key and convert to base64 URL
    var exportError: Unmanaged<CFError>?
    guard let publicKeyData = SecKeyCopyExternalRepresentation(publicKey, &exportError) as Data? else {
        throw CryptoError.keyGenerationFailed
    }
    
    let publicKeyPEM = convertToBase64URL(publicKeyData: publicKeyData)
    
    return DataTransferKeyPair(publicKey: publicKeyPEM, privateKey: privateKey, publicKeyRef: publicKey)
}

/// Encrypts data using a base64 URL-encoded public key
/// - Parameters:
///   - publicKey: Base64 URL-encoded public key
///   - data: The string data to encrypt
/// - Returns: The encrypted data as a base64-encoded string
public func encryptDataTransferData(publicKey: String, data: String) throws -> String {
    let pemKey = base64URLToPEM(publicKey)
    
    guard let publicKeyData = extractPublicKeyData(from: pemKey) else {
        throw CryptoError.invalidPublicKey
    }
    
    let attributes: [String: Any] = [
        kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
        kSecAttrKeyClass as String: kSecAttrKeyClassPublic,
        kSecAttrKeySizeInBits as String: 2048,
    ]
    
    var error: Unmanaged<CFError>?
    guard let secKey = SecKeyCreateWithData(publicKeyData as CFData, attributes as CFDictionary, &error) else {
        throw CryptoError.invalidPublicKey
    }
    
    guard let dataToEncrypt = data.data(using: .utf8) else {
        throw CryptoError.encodingFailed
    }
    
    var encryptError: Unmanaged<CFError>?
    guard let encryptedData = SecKeyCreateEncryptedData(
        secKey,
        .rsaEncryptionPKCS1,
        dataToEncrypt as CFData,
        &encryptError
    ) as Data? else {
        throw CryptoError.encryptionFailed
    }
    
    return encryptedData.base64EncodedString()
}

// MARK: - Private Helpers

private func convertToBase64URL(publicKeyData: Data) -> String {
    let pemData = createPEMFromPublicKey(publicKeyData)
    return pemToBase64URL(pemData)
}

private func createPEMFromPublicKey(_ keyData: Data) -> String {
    let base64String = keyData.base64EncodedString()
    let lines = base64String.split(every: 64)
    
    var pem = "-----BEGIN PUBLIC KEY-----\n"
    for line in lines {
        pem += line + "\n"
    }
    pem += "-----END PUBLIC KEY-----\n"
    
    return pem
}

private func pemToBase64URL(_ pem: String) -> String {
    return pem
        .replacingOccurrences(of: "-----BEGIN PUBLIC KEY-----", with: "")
        .replacingOccurrences(of: "-----END PUBLIC KEY-----", with: "")
        .replacingOccurrences(of: "\r", with: "")
        .replacingOccurrences(of: "\n", with: "")
        .replacingOccurrences(of: "+", with: "-")
        .replacingOccurrences(of: "/", with: "_")
        .trimmingCharacters(in: .whitespaces)
        .replacingOccurrences(of: "=", with: "")
}

private func base64URLToPEM(_ base64URL: String) -> String {
    var base64 = base64URL
        .replacingOccurrences(of: "-", with: "+")
        .replacingOccurrences(of: "_", with: "/")
    
    // Add padding
    let remainder = base64.count % 4
    if remainder > 0 {
        base64 += String(repeating: "=", count: 4 - remainder)
    }
    
    let lines = base64.split(every: 64)
    var pem = "-----BEGIN PUBLIC KEY-----\n"
    for line in lines {
        pem += line + "\n"
    }
    pem += "-----END PUBLIC KEY-----\n"
    
    return pem
}

private func extractPublicKeyData(from pem: String) -> Data? {
    let base64String = pem
        .replacingOccurrences(of: "-----BEGIN PUBLIC KEY-----", with: "")
        .replacingOccurrences(of: "-----END PUBLIC KEY-----", with: "")
        .replacingOccurrences(of: "\r", with: "")
        .replacingOccurrences(of: "\n", with: "")
        .trimmingCharacters(in: .whitespaces)
    
    return Data(base64Encoded: base64String)
}

// Extension to split string into chunks
private extension String {
    func split(every length: Int) -> [String] {
        var result: [String] = []
        var currentIndex = startIndex
        
        while currentIndex < endIndex {
            let nextIndex = index(currentIndex, offsetBy: length, limitedBy: endIndex) ?? endIndex
            result.append(String(self[currentIndex..<nextIndex]))
            currentIndex = nextIndex
        }
        
        return result
    }
}
