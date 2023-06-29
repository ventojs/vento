# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.5.1] - 2023-06-29
### Fixed
- Regular expression for `{{ set }}` tag.
- Multiline code for `set`, `include`, `for`

## [0.5.0] - 2023-06-18
### Added
- Allow to add arbitrary JavaScript expressions with `{{> [js code] }}`.

## [0.4.0] - 2023-06-14
### Added
- Support for trims [#2].
  For example: `<h1> {{- title -}} </h1>`.
- Support for comments [#3].
  For example: `{{# this is a comment #}}`.
- Support for raw code [#4].
  For example: `{{raw}} {{ username }} {{/raw}}`.
- Support for async filters and global functions [#5]
  For example: {{ url |> await fetch |> await json |> JSON.stringify }}

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
[#3]: https://github.com/oscarotero/vento/issues/3
[#4]: https://github.com/oscarotero/vento/issues/4
[#5]: https://github.com/oscarotero/vento/issues/5

[0.5.1]: https://github.com/oscarotero/vento/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/oscarotero/vento/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/oscarotero/vento/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/oscarotero/vento/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/oscarotero/vento/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/oscarotero/vento/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/oscarotero/vento/releases/tag/v0.1.0
