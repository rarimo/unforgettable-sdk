// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "UnforgettableSDK",
    platforms: [
        .iOS(.v13),
        .macOS(.v10_15),
        .tvOS(.v13),
        .watchOS(.v6)
    ],
    products: [
        .library(
            name: "UnforgettableSDK",
            targets: ["UnforgettableSDK"]),
    ],
    targets: [
        .target(
            name: "UnforgettableSDK",
            path: "packages/ios/Sources/UnforgettableSDK"),
        .testTarget(
            name: "UnforgettableSDKTests",
            dependencies: ["UnforgettableSDK"],
            path: "packages/ios/Tests/UnforgettableSDKTests"),
    ]
)
