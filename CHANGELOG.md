# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.12.2] - Unreleased
### Fixed
- Nested layouts [#46].
- `set` tags don't work with `useWith` if the variable is already defined.
- Clean all `__output += ""` code outputs.

## [0.12.1] - 2024-03-08
### Fixed
- Updated missing dependencies
- Error with empty templates

## [0.12.0] - 2024-03-08
### Added
- Added the files from `src` folder in npm `exports` entry [#38].
- Automatic code transform to avoid the use of `with` [#43], [#44]. (thanks @wrapperup)

### Deprecated
- `useWith` option.

### Fixed
- Updated dependencies.

## [0.11.0] - 2024-02-29
### Added
- Preprocessor hooks [#33].
- Support for query strings and hashes in the import paths [#33].
- `auto_trim` plugin [#35].

### Changed
- Internal: refactor tag trimming.

### Fixed
- `escape` and `unescape` filters for non-string values [#36].

## [0.10.2] - 2024-01-16
### Fixed
- `for` not working as expected with AsyncIterable [#28]

## [0.10.1] - 2024-01-08
### Added
- Filters of type `AsyncFunction` are automatically awaited. No need to add the `await` keyword manually.

## [0.10.0] - 2023-12-23
### Added
- Filters can use `this` to access to the `Environment` instance and contextual data.

### Fixed
- The following use cases are now correctly parsed:
  - Starting comments inside other comment: `/* This /* is a comment */`
  - Regular expressions including quotes or brakets: `"Hello's".replace(/'/, "")`
- The Javascript tag allows a linebreak after the `>` character and support line comments.
  Example:
  ```
  {{>
    // Line comment
    console.log("hello");
  }}
  ```
- Updated `std` dependencies.

## [0.9.2] - 2023-12-13
### Fixed
- `useWith` configuration does not work [#25].
- Updated dependencies.

## [0.9.1] - 2023-11-03
### Changed
- Improved error messages.

### Fixed
- Updated dependencies.

## [0.9.0] - 2023-09-24
### Added
- New option `useWith` to remove the `with` statement.
- New filter `safe` to avoid autoescape the content [#20].

### Changed
- Use the `std/html` implementation for `escape` and `unescape` filters.
- Simplified compiled function: removed `__data` and `__tmp` variables.
- `unescape` no longer disables autoescaping, only `safe` does [#20].

## [0.8.1] - 2023-09-14
### Added
- CJS version to NPM package [#16].
- Language definition for Highlight.js

## [0.8.0] - 2023-09-04
### Added
- New `echo` tag [#14].
- New `unescape` filter.
- New option `autoescape`.
- `include` supports pipes. For example: `{{ include "template.vto" |> toUpperCase }}`
- `layout` supports pipes. For example: `{{ layout "template.vto" |> markdown }}Text in markdown{{ /layout }}`

### Removed
- The `raw` tag. Use `echo` instead.

### Fixed
- Use correct key for cache queries [#15]

## [0.7.3] - 2023-09-02
### Fixed
- Escape backslashes [#12], [#13].

## [0.7.2] - 2023-09-02
### Fixed
- Escape backtick and `${` in the template [#10].
- Updated dependencies

## [0.7.1] - 2023-08-08
### Fixed
- `import name from ...` tag.

## [0.7.0] - 2023-08-08
### Added
- `function`, `import` and `export` tags [#9].
- `runStringSync` function to run Vento in sync mode.

### Changed
- `run` and `runString` returns a `TemplateResult` interface, instead of a string.

## [0.6.0] - 2023-07-03
### Added
- `layout` tag.

### Changed
- Docs are now at https://vento.js.org

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
[#9]: https://github.com/oscarotero/vento/issues/9
[#10]: https://github.com/oscarotero/vento/issues/10
[#12]: https://github.com/oscarotero/vento/issues/12
[#13]: https://github.com/oscarotero/vento/issues/13
[#14]: https://github.com/oscarotero/vento/issues/14
[#15]: https://github.com/oscarotero/vento/issues/15
[#16]: https://github.com/oscarotero/vento/issues/16
[#20]: https://github.com/oscarotero/vento/issues/20
[#25]: https://github.com/oscarotero/vento/issues/25
[#28]: https://github.com/oscarotero/vento/issues/28
[#33]: https://github.com/oscarotero/vento/issues/33
[#35]: https://github.com/oscarotero/vento/issues/35
[#36]: https://github.com/oscarotero/vento/issues/36
[#38]: https://github.com/oscarotero/vento/issues/38
[#43]: https://github.com/oscarotero/vento/issues/43
[#44]: https://github.com/oscarotero/vento/issues/44
[#46]: https://github.com/oscarotero/vento/issues/46

[0.12.2]: https://github.com/oscarotero/vento/compare/v0.12.1...HEAD
[0.12.1]: https://github.com/oscarotero/vento/compare/v0.12.0...v0.12.1
[0.12.0]: https://github.com/oscarotero/vento/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/oscarotero/vento/compare/v0.10.2...v0.11.0
[0.10.2]: https://github.com/oscarotero/vento/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/oscarotero/vento/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/oscarotero/vento/compare/v0.9.2...v0.10.0
[0.9.2]: https://github.com/oscarotero/vento/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/oscarotero/vento/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/oscarotero/vento/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/oscarotero/vento/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/oscarotero/vento/compare/v0.7.3...v0.8.0
[0.7.3]: https://github.com/oscarotero/vento/compare/v0.7.2...v0.7.3
[0.7.2]: https://github.com/oscarotero/vento/compare/v0.7.1...v0.7.2
[0.7.1]: https://github.com/oscarotero/vento/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/oscarotero/vento/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/oscarotero/vento/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/oscarotero/vento/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/oscarotero/vento/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/oscarotero/vento/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/oscarotero/vento/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/oscarotero/vento/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/oscarotero/vento/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/oscarotero/vento/releases/tag/v0.1.0
