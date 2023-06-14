# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- Support for trims [#2].

### Fixed
- Template literals in includes [#1].
- Chain errors using the `cause` property.

## [0.3.1] - 2023-06-14
### Fixed
- Improved errors.
- Print `null` and `undefined` values.

## [0.3.0] - 2023-06-12
### Added
- New option `dataVarname`.
- Benchmark for Eta.

### Changed
- Improved the tokenizer.

## [0.2.0] - 2023-06-10
### Added
- `runString` function.

### Changed
- Removed `=` character for printing tags.

## [0.1.0] - 2023-06-04
First version

[#1]: https://github.com/oscarotero/vento/issues/1
[#2]: https://github.com/oscarotero/vento/issues/2

[Unreleased]: https://github.com/oscarotero/vento/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/oscarotero/vento/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/oscarotero/vento/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/oscarotero/vento/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/oscarotero/vento/releases/tag/v0.1.0
