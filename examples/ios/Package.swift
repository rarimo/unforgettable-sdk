// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "UnforgettableExample",
    platforms: [
        .iOS(.v15),
        .macOS(.v12)
    ],
    products: [
        .executable(
            name: "UnforgettableExample",
            targets: ["UnforgettableExample"]
        )
    ],
    dependencies: [
        .package(path: "../../packages/ios")
    ],
    targets: [
        .executableTarget(
            name: "UnforgettableExample",
            dependencies: [
                .product(name: "UnforgettableSDK", package: "ios")
            ],
            path: "UnforgettableExample/Sources"
        )
    ]
)
