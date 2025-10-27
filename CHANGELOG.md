# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog], and this project adheres to [Semantic Versioning].

## [Unreleased]

## [0.6.0] - 2025-10-27
### Added
- `react` - Add `pollingDisabled` prop to change polling behaviour

### Changed
- `core` - Allow app URL to have a custom path

## [0.5.1] - 2025-09-23
### Changed
- `core` - Update example usage in README.md

## [0.5.0] - 2025-09-23
### Changed
- Use exact package versions in `package.json`
- `core` - Move data transfer key pair logic to utils
- `core` - Update default app and API URLs from dev to production environments

## [0.4.0] - 2025-09-15
### Added
- `core` - Add `factors` and `walletAddress` SDK options.
- `core` - Add location hash compose/parse utils.
- `core` - Add recovery factor constants.
- `react` - Add support for the new SDK options.
- `examples/basic-recovery-react` - Display wallet address and helper data URL.

### Changed
- `core` - Return helper data URL instead of raw helpers in `onSuccess` callback.

## [0.3.1] - 2025-08-22
### Fixed
- `core` - Fix helper data parsing in `getRecoveredData` method

## [0.3.0] - 2025-08-22
### Added
- `core` - Add `getRecoveredData` method to return helper data
- `react` - Add `helperData` parameter to `onSuccess` callback

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

[Unreleased]: https://github.com/rarimo/unforgettable-sdk/compare/0.6.0...HEAD
[0.6.0]: https://github.com/rarimo/unforgettable-sdk/compare/0.5.1...0.6.0
[0.5.1]: https://github.com/rarimo/unforgettable-sdk/compare/0.5.0...0.5.1
[0.5.0]: https://github.com/rarimo/unforgettable-sdk/compare/0.4.0...0.5.0
[0.4.0]: https://github.com/rarimo/unforgettable-sdk/compare/0.3.1...0.4.0
[0.3.1]: https://github.com/rarimo/unforgettable-sdk/compare/0.3.0...0.3.1
[0.3.0]: https://github.com/rarimo/unforgettable-sdk/compare/0.2.0...0.3.0
[0.2.0]: https://github.com/rarimo/unforgettable-sdk/compare/0.1.0...0.2.0
[0.1.0]: https://github.com/rarimo/unforgettable-sdk/releases/tag/0.1.0
