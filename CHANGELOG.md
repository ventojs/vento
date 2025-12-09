# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.3.0] - Unreleased
### Added
- New `default` tag to assign fallback content to a variable [#164], [#166].

### Fixed
- Support `break` and `continue` tags by `auto_trim` plugin.

## [2.2.0] - 2025-10-15
### Added
- Support for destructuring in set [#158] [#154].

### Fixed
- Possible variables naming collision [#157].
- `auto_trim` plugin edge cases [#159].
- `set`: allow `$` character in the variable name.

## [2.1.1] - 2025-09-18
### Fixed
- The tag `include` fails when it's inside a `slot`.

## [2.1.0] - 2025-09-17
### Added
- New `strict` mode to fail when using an undefined variable. This mode has a different performance profile than normal mode; it's mostly intended for testing and debug purposes. [#101], [#142]

### Fixed
- Variable detection with spread operator [#156]

## [2.0.2] - 2025-09-13
### Added
- The closing tag `{{ /layout }}` is optional. [#145], [#151].

### Fixed
- Static content after a function declaration is not printed [#147], [#150].
- Fix and simplify escaping of JSON (and other) [#146], [#148].
- Improved performance for `escape` filter and `compileFilters` internal function.
- Use `SafeString` object only if `autoescape` is `true`.

## [2.0.1] - 2025-09-05
### Fixed
- One-letter variable names are not captured.

## [2.0.0] - 2025-09-01
Vento 2.0 is now dependency-free and compatible with browsers without a build step.

### Added
- Build-less browser support.
- `plugins/mod.ts` module to register all default plugins easily.
- Support for precompiled templates.
- New filesystem loader to use File System API.
- Better errors reporting [#131], [#137]
- `core/errors.ts` module to format errors.
- New `{{ slot }}` tag to pass extra variables to `{{ layout }}` [#140]

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
- Prism and Highlight.js adapters: Rename language name to `vto` (from `vento`).

### Removed
- `runStringSync` function.
- Deprecated option `useWith`.
- All extenal dependencies (`meriyah`, `estree`, etc).
- `bare.ts` file since now it's useless.

### Fixed
- Functions output when the autoescape is enabled [#95]
- Improved escape filter performance [#134]

[#95]: https://github.com/ventojs/vento/issues/95
[#101]: https://github.com/ventojs/vento/issues/101
[#128]: https://github.com/ventojs/vento/issues/128
[#131]: https://github.com/ventojs/vento/issues/131
[#134]: https://github.com/ventojs/vento/issues/134
[#137]: https://github.com/ventojs/vento/issues/137
[#140]: https://github.com/ventojs/vento/issues/140
[#142]: https://github.com/ventojs/vento/issues/142
[#145]: https://github.com/ventojs/vento/issues/145
[#146]: https://github.com/ventojs/vento/issues/146
[#147]: https://github.com/ventojs/vento/issues/147
[#148]: https://github.com/ventojs/vento/issues/148
[#150]: https://github.com/ventojs/vento/issues/150
[#151]: https://github.com/ventojs/vento/issues/151
[#154]: https://github.com/ventojs/vento/issues/154
[#156]: https://github.com/ventojs/vento/issues/156
[#157]: https://github.com/ventojs/vento/issues/157
[#158]: https://github.com/ventojs/vento/issues/158
[#159]: https://github.com/ventojs/vento/issues/159
[#164]: https://github.com/ventojs/vento/issues/164
[#166]: https://github.com/ventojs/vento/issues/166

[2.3.0]: https://github.com/ventojs/vento/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/ventojs/vento/compare/v2.1.1...v2.2.0
[2.1.1]: https://github.com/ventojs/vento/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/ventojs/vento/compare/v2.0.2...v2.1.0
[2.0.2]: https://github.com/ventojs/vento/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/ventojs/vento/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/ventojs/vento/releases/tag/v2.0.0
