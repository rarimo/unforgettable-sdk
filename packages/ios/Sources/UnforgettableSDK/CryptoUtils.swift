import Foundation
import CryptoKit

// Cryptographic constants
private let x25519PublicKeySize = 32 // bytes
private let chacha20NonceSize = 12 // bytes (96 bits)
private let poly1305TagSize = 16 // bytes (128 bits)
private let hkdfKeySize = 32 // bytes (256 bits)
private let minEncryptedSize = x25519PublicKeySize + chacha20NonceSize + poly1305TagSize

public enum CryptoError: Error {
    case keyGenerationFailed
    case encryptionFailed
    case decryptionFailed
    case invalidPublicKey
    case encodingFailed
    case decodingFailed
    case invalidCiphertext
}

public struct DataTransferKeyPair {
    public let publicKey: String
    private let privateKey: Curve25519.KeyAgreement.PrivateKey
    
    init(publicKey: String, privateKey: Curve25519.KeyAgreement.PrivateKey) {
        self.publicKey = publicKey
        self.privateKey = privateKey
    }
    
    public func decrypt(_ encryptedData: String) throws -> String {
        // Encrypted data format: [32 bytes ephemeral public key][12 bytes nonce][ciphertext + 16 bytes auth tag]
        let combined = try base64URLDecode(encryptedData)
        
        guard combined.count >= minEncryptedSize else {
            throw CryptoError.invalidCiphertext
        }
        
        // Extract ephemeral public key (bytes 0-31)
        let ephemeralPublicKeyData = combined.prefix(x25519PublicKeySize)
        
        // Extract nonce (bytes 32-43)
        let nonce = combined.dropFirst(x25519PublicKeySize).prefix(chacha20NonceSize)
        
        // Extract ciphertext with authentication tag (bytes 44+)
        let ciphertext = combined.dropFirst(x25519PublicKeySize + chacha20NonceSize)
        
        // Perform X25519 key exchange: our private key + their ephemeral public key = shared secret
        let ephemeralPublicKey = try Curve25519.KeyAgreement.PublicKey(rawRepresentation: ephemeralPublicKeyData)
        let sharedSecret = try privateKey.sharedSecretFromKeyAgreement(with: ephemeralPublicKey)
        
        // Derive the actual encryption key from shared secret using HKDF
        let encryptionKey = try deriveEncryptionKey(sharedSecret: sharedSecret)
        
        let sealedBox = try ChaChaPoly.SealedBox(
            nonce: ChaChaPoly.Nonce(data: nonce),
            ciphertext: ciphertext.dropLast(16),
            tag: ciphertext.suffix(16)
        )
        
        let decryptedData = try ChaChaPoly.open(sealedBox, using: encryptionKey)
        
        guard let result = String(data: decryptedData, encoding: .utf8) else {
            throw CryptoError.decodingFailed
        }
        
        return result
    }
    
    public func decryptBinary(_ encryptedData: Data) throws -> String {
        guard let base64URLString = String(data: encryptedData, encoding: .isoLatin1) else {
            throw CryptoError.decodingFailed
        }
        
        return try decrypt(base64URLString)
    }
}

public func generateDataTransferKeyPair() throws -> DataTransferKeyPair {
    let privateKey = Curve25519.KeyAgreement.PrivateKey()
    let publicKeyData = privateKey.publicKey.rawRepresentation
    let publicKeyBase64URL = base64URLEncode(publicKeyData)
    
    return DataTransferKeyPair(publicKey: publicKeyBase64URL, privateKey: privateKey)
}

public func encryptDataTransferData(publicKey: String, data: String) throws -> String {
    let recipientPublicKeyData = try base64URLDecode(publicKey)
    guard recipientPublicKeyData.count == x25519PublicKeySize else {
        throw CryptoError.invalidPublicKey
    }
    
    let recipientPublicKey = try Curve25519.KeyAgreement.PublicKey(rawRepresentation: recipientPublicKeyData)
    
    let ephemeralPrivateKey = Curve25519.KeyAgreement.PrivateKey()
    let ephemeralPublicKey = ephemeralPrivateKey.publicKey
    
    let sharedSecret = try ephemeralPrivateKey.sharedSecretFromKeyAgreement(with: recipientPublicKey)
    let encryptionKey = try deriveEncryptionKey(sharedSecret: sharedSecret)
    
    var nonceBytes = Data(count: chacha20NonceSize)
    let result = nonceBytes.withUnsafeMutableBytes { buffer in
        SecRandomCopyBytes(kSecRandomDefault, chacha20NonceSize, buffer.baseAddress!)
    }
    guard result == errSecSuccess else {
        throw CryptoError.encryptionFailed
    }
    let nonce = try ChaChaPoly.Nonce(data: nonceBytes)
    
    guard let dataToEncrypt = data.data(using: .utf8) else {
        throw CryptoError.encodingFailed
    }
    
    let sealedBox = try ChaChaPoly.seal(dataToEncrypt, using: encryptionKey, nonce: nonce)
    
    // Build encrypted data format: [32 bytes ephemeral public key][12 bytes nonce][ciphertext + 16 bytes auth tag]
    var combined = Data()
    combined.append(ephemeralPublicKey.rawRepresentation) // Bytes 0-31: ephemeral public key
    combined.append(nonceBytes) // Bytes 32-43: nonce
    combined.append(sealedBox.ciphertext) // Ciphertext
    combined.append(sealedBox.tag) // 16-byte Poly1305 authentication tag
    
    return base64URLEncode(combined)
}

private func deriveEncryptionKey(sharedSecret: SharedSecret, info: String = "unforgettable-encryption") throws -> SymmetricKey {
    let infoData = info.data(using: .utf8) ?? Data()
    
    return sharedSecret.hkdfDerivedSymmetricKey(
        using: SHA256.self,
        salt: Data(),
        sharedInfo: infoData,
        outputByteCount: hkdfKeySize
    )
}

private func base64URLEncode(_ data: Data) -> String {
    let base64 = data.base64EncodedString()
    return base64
        .replacingOccurrences(of: "+", with: "-")
        .replacingOccurrences(of: "/", with: "_")
        .replacingOccurrences(of: "=", with: "")
}

private func base64URLDecode(_ string: String) throws -> Data {
    var base64 = string
        .replacingOccurrences(of: "-", with: "+")
        .replacingOccurrences(of: "_", with: "/")
    
    let remainder = base64.count % 4
    if remainder > 0 {
        base64 += String(repeating: "=", count: 4 - remainder)
    }
    
    guard let data = Data(base64Encoded: base64) else {
        throw CryptoError.decodingFailed
    }
    
    return data
}
