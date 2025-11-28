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
        XCTAssertTrue(hash.contains("f=1,2,3"))
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
        let hash = "#id=test-123&epk=my-key&f=1,2,3&wa=0xabc"
        
        let params = try parseUnforgettableLocationHash(hash)
        
        XCTAssertEqual(params.dataTransferId, "test-123")
        XCTAssertEqual(params.encryptionPublicKey, "my-key")
        XCTAssertEqual(params.factors.count, 3)
        XCTAssertEqual(params.factors[0], .face)
        XCTAssertEqual(params.factors[1], .image)
        XCTAssertEqual(params.factors[2], .password)
        XCTAssertEqual(params.walletAddress, "0xabc")
    }
    
    func testParseLocationHashWithoutHash() throws {
        let hash = "id=test&epk=key&f=1"
        
        let params = try parseUnforgettableLocationHash(hash)
        
        XCTAssertEqual(params.dataTransferId, "test")
        XCTAssertEqual(params.encryptionPublicKey, "key")
        XCTAssertEqual(params.factors.count, 1)
        XCTAssertEqual(params.factors[0], .face)
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
    
    func testComposeLocationHashWithGroup() {
        let params = UnforgettablePathParams(
            dataTransferId: "test-id",
            encryptionPublicKey: "key",
            factors: [.face],
            group: "test-group"
        )
        
        let hash = composeUnforgettableLocationHash(params: params)
        
        XCTAssertTrue(hash.contains("g=test-group"))
    }
    
    func testParseLocationHashWithGroup() throws {
        let hash = "#id=test&epk=key&f=1&g=my-group"
        
        let params = try parseUnforgettableLocationHash(hash)
        
        XCTAssertEqual(params.group, "my-group")
    }
    
    func testComposeLocationHashWithCustomParams() {
        let params = UnforgettablePathParams(
            dataTransferId: "test-id",
            encryptionPublicKey: "key",
            factors: [.face],
            customParams: ["t": "dark", "d": "data"]
        )
        
        let hash = composeUnforgettableLocationHash(params: params)
        
        XCTAssertTrue(hash.contains("t=dark"))
        XCTAssertTrue(hash.contains("d=data"))
    }
    
    func testParseLocationHashWithCustomParams() throws {
        let hash = "#id=test&epk=key&f=1&t=light&d=test-data"
        
        let params = try parseUnforgettableLocationHash(hash)
        
        XCTAssertEqual(params.customParams?["t"], "light")
        XCTAssertEqual(params.customParams?["d"], "test-data")
    }
    
    func testParseLocationHashEmptyFactors() throws {
        let hash = "#id=test&epk=key&f="
        
        let params = try parseUnforgettableLocationHash(hash)
        
        XCTAssertEqual(params.factors.count, 0)
    }
    
    func testParseLocationHashIgnoresEmptyFactorItems() throws {
        let hash = "#id=test&epk=key&f=1,,2,,3"
        
        let params = try parseUnforgettableLocationHash(hash)
        
        XCTAssertEqual(params.factors.count, 3)
        XCTAssertEqual(params.factors, [.face, .image, .password])
    }
    
    func testRoundTripWithAllParams() throws {
        let originalParams = UnforgettablePathParams(
            dataTransferId: "uuid-123",
            encryptionPublicKey: "public-key-data",
            factors: [.face, .image, .password],
            walletAddress: "0x456",
            group: "test-group",
            customParams: ["t": "dark", "d": "data"]
        )
        
        let hash = composeUnforgettableLocationHash(params: originalParams)
        let parsedParams = try parseUnforgettableLocationHash(hash)
        
        XCTAssertEqual(parsedParams.dataTransferId, originalParams.dataTransferId)
        XCTAssertEqual(parsedParams.encryptionPublicKey, originalParams.encryptionPublicKey)
        XCTAssertEqual(parsedParams.factors, originalParams.factors)
        XCTAssertEqual(parsedParams.walletAddress, originalParams.walletAddress)
        XCTAssertEqual(parsedParams.group, originalParams.group)
        XCTAssertEqual(parsedParams.customParams?["t"], "dark")
        XCTAssertEqual(parsedParams.customParams?["d"], "data")
    }
}
