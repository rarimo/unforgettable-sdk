import XCTest
@testable import UnforgettableSDK

final class LocationHashTests: XCTestCase {
    
    func testComposeLocationHash() {
        let params = UnforgettablePathParams(
            dataTransferId: "test-id-123",
            encryptionPublicKey: "test-key",
            factors: [.face, .image, .password],
            walletAddress: "0x123"
        )
        
        let hash = composeUnforgettableLocationHash(params: params)
        
        XCTAssertTrue(hash.hasPrefix("#"))
        XCTAssertTrue(hash.contains("id=test-id-123"))
        XCTAssertTrue(hash.contains("epk=test-key"))
        XCTAssertTrue(hash.contains("f=1,3"))
        XCTAssertTrue(hash.contains("wa=0x123"))
    }
    
    func testComposeLocationHashWithoutWallet() {
        let params = UnforgettablePathParams(
            dataTransferId: "test-id",
            encryptionPublicKey: "key",
            factors: [.image]
        )
        
        let hash = composeUnforgettableLocationHash(params: params)
        
        XCTAssertTrue(hash.hasPrefix("#"))
        XCTAssertTrue(hash.contains("id=test-id"))
        XCTAssertTrue(hash.contains("epk=key"))
        XCTAssertTrue(hash.contains("f=2"))
        XCTAssertFalse(hash.contains("wa="))
    }
    
    func testParseLocationHash() throws {
        let hash = "#id=test-123&epk=my-key&f=1,3&wa=0xabc"
        
        let params = try parseUnforgettableLocationHash(hash)
        
        XCTAssertEqual(params.dataTransferId, "test-123")
        XCTAssertEqual(params.encryptionPublicKey, "my-key")
        XCTAssertEqual(params.factors.count, 2)
        XCTAssertEqual(params.factors[0], .face)
        XCTAssertEqual(params.factors[1], .password)
        XCTAssertEqual(params.walletAddress, "0xabc")
    }
    
    func testParseLocationHashWithoutHash() throws {
        let hash = "id=test&epk=key&f=4"
        
        let params = try parseUnforgettableLocationHash(hash)
        
        XCTAssertEqual(params.dataTransferId, "test")
        XCTAssertEqual(params.encryptionPublicKey, "key")
        XCTAssertEqual(params.factors.count, 1)
        XCTAssertEqual(params.factors[0], .object)
    }
    
    func testParseLocationHashInvalidThrows() {
        let invalidHash = "#invalid"
        
        XCTAssertThrowsError(try parseUnforgettableLocationHash(invalidHash))
    }
    
    func testParseLocationHashInvalidFactorThrows() {
        let hash = "#id=test&epk=key&f=99"
        
        XCTAssertThrowsError(try parseUnforgettableLocationHash(hash)) { error in
            if case LocationHashError.invalidFactorId = error {
                // Expected error
            } else {
                XCTFail("Expected LocationHashError.invalidFactorId")
            }
        }
    }
    
    func testRoundTripLocationHash() throws {
        let originalParams = UnforgettablePathParams(
            dataTransferId: "uuid-123",
            encryptionPublicKey: "public-key-data",
            factors: [.face, .image, .password],
            walletAddress: "0x456"
        )
        
        let hash = composeUnforgettableLocationHash(params: originalParams)
        let parsedParams = try parseUnforgettableLocationHash(hash)
        
        XCTAssertEqual(parsedParams.dataTransferId, originalParams.dataTransferId)
        XCTAssertEqual(parsedParams.encryptionPublicKey, originalParams.encryptionPublicKey)
        XCTAssertEqual(parsedParams.factors, originalParams.factors)
        XCTAssertEqual(parsedParams.walletAddress, originalParams.walletAddress)
    }
}
