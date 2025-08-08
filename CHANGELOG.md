# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## 2.0.0 - Unreleased
Vento 2.0 is now dependency-free and compatible with browsers without a build step.

### Added
- Build-less browser support.
- `plugins/mod.ts` module to register all default plugins easily.
- Support for precompiled templates.
- New filesystem loader to use File System API.
- Better errors reporting [#131], [#137]

### Changed
- Renamed `src` directory to `core`.
- Moved all loaders to the `loaders` root directory.
- Implemented a different approach to resolve the variables without using `meriyah` to analyze the code. [#128]

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
