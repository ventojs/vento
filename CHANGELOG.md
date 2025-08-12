# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## 2.0.0 - Unreleased
Vento 2.0 is now dependency-free and compatible with browsers without a build step.

## [1.15.2] - 2025-07-29
### Fixed
- `auto_trim` plugin is applied when not expected [#136].

## [1.15.1] - 2025-07-20
### Fixed
- Show original code on error.

## [1.15.0] - 2025-07-16
### Added
- Expose `url_loader` and all plugins for browser compatibility. [#115] [#129]
- Support renamed imports and exports. [#125]

### Changed
- Use `node:` specifiers in both Node and Deno environment to reduce dependencies. [#118]
- Improved benchmarking. [#119]
- Rework the JavaScript analyzer to fix parsing issues and use a generator instead of visitor function. [#121], [#127]
- Remove `jsr:@std/html` dependency. [#126]

### Fixed
- Improved the tokenization of `echo` tags. [#120]
- Big performance improvement: Async templates wasn't properly cached, causing the same template to be compiled several times.

### Added
- Build-less browser support.
- `plugins/mod.ts` module to register all default plugins easily.
- Support for precompiled templates.
- New filesystem loader to use File System API.
- Better errors reporting [#131], [#137]

### Changed
- Renamed `src` directory to `core`.
- Moved all loaders to the `loaders` root directory.
- Implemented a different approach to resolve the variables without using `meriyah` to analyze the code [#128].
- The signature of `tag` plugins has changed:
  ```diff
  -- (env: Environment, code: string, output: string, tokens: Tokens[])
  ++ (env: Environment, token: Token, output: string, tokens: Tokens[])
  ```
- The `compileTokens` function has changed. The third argument is a string with the closing tag and now it throws an error if its not found:
  ```diff
  -- env.compileTokens(tokens, tmpOutput, ["/code"]);
  -- if (tokens.length && (tokens[0][0] !== "tag" || tokens[0][1] !== "/code")) {
  --   throw new Error("missing closing tag");
  -- }
  ++ env.compileTokens(tokens, tmpOutput, "/code");
  ```

### Removed
- `runStringSync` function.
- Deprecated option `useWith`.
- All extenal dependencies (`meriyah`, `estree`, etc).
- `bare.ts` file since now it's useless.

### Fixed
- Functions output when the autoescape is enabled [#95]
- Improved escape filter performance [#134]

[#95]: https://github.com/ventojs/vento/issues/95
[#128]: https://github.com/ventojs/vento/issues/128
[#131]: https://github.com/ventojs/vento/issues/131
[#134]: https://github.com/ventojs/vento/issues/134
[#137]: https://github.com/ventojs/vento/issues/137
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
[#115]: https://github.com/oscarotero/vento/issues/115
[#118]: https://github.com/oscarotero/vento/issues/118
[#119]: https://github.com/oscarotero/vento/issues/119
[#120]: https://github.com/oscarotero/vento/issues/120
[#121]: https://github.com/oscarotero/vento/issues/121
[#125]: https://github.com/oscarotero/vento/issues/125
[#126]: https://github.com/oscarotero/vento/issues/126
[#127]: https://github.com/oscarotero/vento/issues/127
[#129]: https://github.com/oscarotero/vento/issues/129
[#136]: https://github.com/oscarotero/vento/issues/136

[1.15.2]: https://github.com/oscarotero/vento/compare/v1.15.1...v1.15.2
[1.15.1]: https://github.com/oscarotero/vento/compare/v1.15.0...v1.15.1
[1.15.0]: https://github.com/oscarotero/vento/compare/v1.14.0...v1.15.0
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
