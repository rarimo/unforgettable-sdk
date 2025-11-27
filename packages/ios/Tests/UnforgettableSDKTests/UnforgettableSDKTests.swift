import XCTest
@testable import UnforgettableSDK

final class UnforgettableSDKTests: XCTestCase {
    
    func testSDKInitialization() throws {
        let sdk = try UnforgettableSDK(options: UnforgettableSdkOptions(
            mode: .create,
            factors: [.face, .image, .password],
            walletAddress: "0x1234567890abcdef"
        ))
        
        XCTAssertEqual(sdk.mode, .create)
        XCTAssertEqual(sdk.factors.count, 2)
        XCTAssertEqual(sdk.walletAddress, "0x1234567890abcdef")
    }
    
    func testGetRecoveryUrlCreate() throws {
        let sdk = try UnforgettableSDK(options: UnforgettableSdkOptions(
            mode: .create,
            factors: [.face]
        ))
        
        let url = sdk.getRecoveryUrl()
        
        XCTAssertTrue(url.hasPrefix("https://unforgettable.app/c#"))
        XCTAssertTrue(url.contains("id="))
        XCTAssertTrue(url.contains("epk="))
        XCTAssertTrue(url.contains("f=1"))
    }
    
    func testGetRecoveryUrlRestore() throws {
        let sdk = try UnforgettableSDK(options: UnforgettableSdkOptions(
            mode: .restore,
            factors: [.face, .image, .password],
            walletAddress: "0xabcdef"
        ))
        
        let url = sdk.getRecoveryUrl()
        
        XCTAssertTrue(url.hasPrefix("https://unforgettable.app/r#"))
        XCTAssertTrue(url.contains("id="))
        XCTAssertTrue(url.contains("epk="))
        XCTAssertTrue(url.contains("f=1,3"))
        XCTAssertTrue(url.contains("wa=0xabcdef"))
    }
    
    func testRecoveryFactorAllCases() {
        XCTAssertEqual(RecoveryFactor.allCases.count, 6)
        XCTAssertEqual(ALL_RECOVERY_FACTORS.count, 6)
    }
}
