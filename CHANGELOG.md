# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog], and this project adheres to [Semantic Versioning].

## [Unreleased]

## [0.2.0] - 2025-08-05
### Added
- `react` - Add `loader` prop to `UnforgettableQRCode` component to allow custom loading component
- `examples/basic-recovery-react` - Example app demonstrating basic usage (React + TS)

### Changed
- `core` - Wrap keipair generation in Promise to ensure async behavior
- `react` - Generate recovery link asynchronously to avoid blocking the main thread

## [0.1.0] - 2025-07-23
### Added
- `core` package for Unforgettable SDK
- `react` package for Unforgettable SDK QR code component


[Keep a Changelog]: https://keepachangelog.com/en/1.0.0/
[Semantic Versioning]: https://semver.org/spec/v2.0.0.html

[Unreleased]: https://github.com/rarimo/unforgettable-sdk/compare/0.2.0...HEAD
[0.2.0]: https://github.com/rarimo/unforgettable-sdk/compare/0.1.0...0.2.0
[0.1.0]: https://github.com/rarimo/unforgettable-sdk/releases/tag/0.1.0
