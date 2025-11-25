import XCTest
@testable import UnforgettableSDK

final class CryptoUtilsTests: XCTestCase {
    
    func testGenerateKeyPair() throws {
        let keyPair = try generateDataTransferKeyPair()
        
        XCTAssertFalse(keyPair.publicKey.isEmpty)
        XCTAssertFalse(keyPair.publicKey.contains("+"))
        XCTAssertFalse(keyPair.publicKey.contains("/"))
        XCTAssertFalse(keyPair.publicKey.contains("="))
    }
    
    func testEncryptDecrypt() throws {
        let keyPair = try generateDataTransferKeyPair()
        let originalData = "Hello, World!"
        
        let encrypted = try keyPair.encrypt(originalData)
        XCTAssertNotEqual(encrypted, originalData)
        
        let decrypted = try keyPair.decrypt(encrypted)
        XCTAssertEqual(decrypted, originalData)
    }
    
    func testEncryptDecryptLongData() throws {
        let keyPair = try generateDataTransferKeyPair()
        let originalData = String(repeating: "A", count: 100)
        
        let encrypted = try keyPair.encrypt(originalData)
        let decrypted = try keyPair.decrypt(encrypted)
        
        XCTAssertEqual(decrypted, originalData)
    }
    
    func testMultipleKeyPairs() throws {
        let keyPair1 = try generateDataTransferKeyPair()
        let keyPair2 = try generateDataTransferKeyPair()
        
        XCTAssertNotEqual(keyPair1.publicKey, keyPair2.publicKey)
    }
}
