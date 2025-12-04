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
        XCTAssertEqual(sdk.factors.count, 3)
        XCTAssertEqual(sdk.walletAddress, "0x1234567890abcdef")
    }
    
    func testGetRecoveryUrlCreate() throws {
        let sdk = try UnforgettableSDK(options: UnforgettableSdkOptions(
            mode: .create,
            factors: [.face]
        ))
        
        let url = sdk.getRecoveryUrl()
        
        XCTAssertTrue(url.hasPrefix("https://unforgettable.app/sdk/c#"))
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
        
        XCTAssertTrue(url.hasPrefix("https://unforgettable.app/sdk/r#"))
        XCTAssertTrue(url.contains("id="))
        XCTAssertTrue(url.contains("epk="))
        XCTAssertTrue(url.contains("f=1,2,3"))
        XCTAssertTrue(url.contains("wa=0xabcdef"))
    }
    
    func testRecoveryFactorAllCases() {
        XCTAssertEqual(RecoveryFactor.allCases.count, 3)
        XCTAssertEqual(ALL_RECOVERY_FACTORS.count, 3)
    }
    
    func testSDKWithGroup() throws {
        let sdk = try UnforgettableSDK(options: UnforgettableSdkOptions(
            mode: .create,
            factors: [.face],
            group: "test-group"
        ))
        
        XCTAssertEqual(sdk.group, "test-group")
    }
    
    func testSDKWithCustomParams() throws {
        let customParams = ["t": "dark", "d": "data"]
        let sdk = try UnforgettableSDK(options: UnforgettableSdkOptions(
            mode: .create,
            factors: [.face],
            customParams: customParams
        ))
        
        XCTAssertEqual(sdk.customParams?["t"], "dark")
        XCTAssertEqual(sdk.customParams?["d"], "data")
    }
    
    func testGetRecoveryUrlWithGroup() throws {
        let sdk = try UnforgettableSDK(options: UnforgettableSdkOptions(
            mode: .create,
            factors: [.face],
            group: "my-group"
        ))
        
        let url = sdk.getRecoveryUrl()
        
        XCTAssertTrue(url.contains("g=my-group"))
    }
    
    func testGetRecoveryUrlWithCustomParams() throws {
        let sdk = try UnforgettableSDK(options: UnforgettableSdkOptions(
            mode: .create,
            factors: [.face],
            customParams: ["t": "light", "d": "test"]
        ))
        
        let url = sdk.getRecoveryUrl()
        
        XCTAssertTrue(url.contains("t=light"))
        XCTAssertTrue(url.contains("d=test"))
    }
    
    func testGetRecoveryUrlWithCustomAppUrl() throws {
        let sdk = try UnforgettableSDK(options: UnforgettableSdkOptions(
            mode: .create,
            appUrl: "https://custom.app",
            factors: [.face]
        ))
        
        let url = sdk.getRecoveryUrl()
        
        XCTAssertTrue(url.hasPrefix("https://custom.app/c#"))
    }
    
    func testRecoveryFactorFromValue() {
        XCTAssertEqual(RecoveryFactor(rawValue: 1), .face)
        XCTAssertEqual(RecoveryFactor(rawValue: 2), .image)
        XCTAssertEqual(RecoveryFactor(rawValue: 3), .password)
        XCTAssertNil(RecoveryFactor(rawValue: 99))
    }
}
