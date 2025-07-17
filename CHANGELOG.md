# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## 2.0.0 - Unreleased
### Added
- Build-less browser support.
- `plugins/mod.ts` module to register all default plugins easily.

### Changed
- Implemented a different approach to resolve the variables without using `meriyah` to analyze the code. [#128]

### Removed
- Deprecated option `useWith`.
- All extenal dependencies (`meriyah`, `estree`, etc).
- `bare.ts` file since now it's useless.

[#128]: https://github.com/ventojs/vento/issues/128
