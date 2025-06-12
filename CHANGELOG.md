# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.14.0] - 2025-06-12
### Added
- New `url_loader.ts` to load templates from URLs.
- Support destructuring in `for`. For example:
  ```vto
  {{ for {name, age} of people }}
  {{ for index, {name, age} of people }}
  {{ for [name, age] of people }}
  {{ for index, [name, age] of people }}
  ```
- New tags `{{ continue }}` and `{{ break }}` to control loops.
- Support for pipes in `if` tags. For example:
  ```vto
  {{ if 4 |> isOdd }}
  ```
- Support for pipes in `function` tags. For example:
  ```vto
  {{ function getText () |> toUpperCase }}
  ```

## [1.13.2] - 2025-06-03
### Fixed
- `set` tag declares the function twice [#108]

## [1.13.1] - 2025-05-31
### Fixed
- function tag was incorrectly detected [#106].
- Autotrim: Don't trim inlined tags. For example:
  ```
  <a {{ if rel }}rel={{rel}}{{/if}}>
  ```

  It now outputs:

  ```diff
  + <a rel=me>
  - <arel=me>
  ```

## [1.13.0] - 2025-05-21
### Changed
- Invalid pipes now throw errors. Previously, they were silenced.
  For example consider the following example: `{{ "foo" |> bar }}`:
  - In previous version, if `bar` is not a valid filter or method, it returns undefined.
  - As of version 1.13 it throws an error.
  - The only exception is `null` or `undefined` that don't fail: `{{ undefined |> bar }}` returns `undefined`.

### Fixed
- Better detection of prototype methods. Example: `{{ 23 |> toString }}`
  - In previous version, it returns `[object Undefined]` because `toString` is detected as a global function (`globalThis.toString() exists`).
  - Now it's correctly detected as a method of the number `23`. That's because global functions are now detected with `Object.hasOwn(globalThis, methodName)`.
- Removed the Deno shim for NPM, making the package lighter on Node.

## [1.12.16] - 2025-03-14
### Added
- New `/bare.ts` module to create bare Vento instance (without any plugin installed) [#102].

### Fixed
- Removed `global` from the list of ignored global variables [#99].

## [1.12.15] - 2025-01-13
### Fixed
- Property destruct [#92], [#93]
- Updated depepencies.

## [1.12.14] - 2024-12-23
### Fixed
- Removed redundant error message [#90].
- Updated dev dependencies.

## [1.12.13] - 2024-12-09
### Fixed
- Improved errors [#88].
- Moved error classes to a different module [#89].
- Improved the code of iterator with an array.
- Updated dependencies.

## [1.12.12] - 2024-11-19
### Added
- New option `autoDataVarname` to replace `useWith`.
  `useWith` is keept as an alias for backward compatibility but will be removed in the future.

### Fixed
- `auto_trim` plugin: Trim comments.
- `set` evaluates the expression twice.
- `for`: Make sure key values of an array are always numbers [#83].

## [1.12.11] - 2024-11-03
### Fixed
- `set` tag in block mode inside loops.
- Improved error if the source is not a string.
- Wrong function name [#74].
- Updated dependencies: `std`, `merijah`.

## [1.12.10] - 2024-07-17
### Fixed
- `auto_trim` plugin throws if there are no next tokens [#73].
- Updated `std` dependencies.

## [0.12.9] - 2024-07-12
### Fixed
- Includes when the inital url is not specified fails [#72].

## [0.12.8] - 2024-07-04
### Added
- Allow the trimming syntax in comments [#70].

### Fixed
- Updated dependencies.
- Improved types.
- Prepare the package to publish on JSR.

## [0.12.7] - 2024-06-09
### Fixed
- Updated dependencies.
- Trim end not working with pipes [#65].

## [0.12.6] - 2024-05-22
### Fixed
- Fix code transformation [#64].
- Updated dependencies.

## [0.12.5] - 2024-04-06
### Fixed
- Array access syntax [#55], [#56].

## [0.12.4] - 2024-03-28
### Fixed
- Parsing dynamic includes with extra data, example:
  ```
  {{ include `${filename}.vto` { name: "value" } }}
  ```
- Object property shorthand [#50]
- Updated dependencies.

## [0.12.2] - 2024-03-25
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
  - Regular expressions including quotes or brackets: `"Hello's".replace(/'/, "")`
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
[#50]: https://github.com/oscarotero/vento/issues/50
[#55]: https://github.com/oscarotero/vento/issues/55
[#56]: https://github.com/oscarotero/vento/issues/56
[#64]: https://github.com/oscarotero/vento/issues/64
[#65]: https://github.com/oscarotero/vento/issues/65
[#70]: https://github.com/oscarotero/vento/issues/70
[#72]: https://github.com/oscarotero/vento/issues/72
[#73]: https://github.com/oscarotero/vento/issues/73
[#74]: https://github.com/oscarotero/vento/issues/74
[#83]: https://github.com/oscarotero/vento/issues/83
[#88]: https://github.com/oscarotero/vento/issues/88
[#89]: https://github.com/oscarotero/vento/issues/89
[#90]: https://github.com/oscarotero/vento/issues/90
[#92]: https://github.com/oscarotero/vento/issues/92
[#93]: https://github.com/oscarotero/vento/issues/93
[#99]: https://github.com/oscarotero/vento/issues/99
[#102]: https://github.com/oscarotero/vento/issues/102
[#106]: https://github.com/oscarotero/vento/issues/106
[#108]: https://github.com/oscarotero/vento/issues/108

[1.14.0]: https://github.com/oscarotero/vento/compare/v1.13.2...v1.14.0
[1.13.2]: https://github.com/oscarotero/vento/compare/v1.13.1...v1.13.2
[1.13.1]: https://github.com/oscarotero/vento/compare/v1.13.0...v1.13.1
[1.13.0]: https://github.com/oscarotero/vento/compare/v1.12.16...v1.13.0
[1.12.16]: https://github.com/oscarotero/vento/compare/v1.12.15...v1.12.16
[1.12.15]: https://github.com/oscarotero/vento/compare/v1.12.14...v1.12.15
[1.12.14]: https://github.com/oscarotero/vento/compare/v1.12.13...v1.12.14
[1.12.13]: https://github.com/oscarotero/vento/compare/v1.12.12...v1.12.13
[1.12.12]: https://github.com/oscarotero/vento/compare/v1.12.11...v1.12.12
[1.12.11]: https://github.com/oscarotero/vento/compare/v1.12.10...v1.12.11
[1.12.10]: https://github.com/oscarotero/vento/compare/v0.12.9...v1.12.10
[0.12.9]: https://github.com/oscarotero/vento/compare/v0.12.8...v0.12.9
[0.12.8]: https://github.com/oscarotero/vento/compare/v0.12.7...v0.12.8
[0.12.7]: https://github.com/oscarotero/vento/compare/v0.12.6...v0.12.7
[0.12.6]: https://github.com/oscarotero/vento/compare/v0.12.5...v0.12.6
[0.12.5]: https://github.com/oscarotero/vento/compare/v0.12.4...v0.12.5
[0.12.4]: https://github.com/oscarotero/vento/compare/v0.12.2...v0.12.4
[0.12.2]: https://github.com/oscarotero/vento/compare/v0.12.1...v0.12.2
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
