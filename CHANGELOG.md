# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## 2.0.0 - Unreleased
### Changed
- Implemented a different approach to resolve the variables without using `meriyah` to analyze the code. [#128]

### Removed
- Deprecated option `useWith`.
- All extenal dependencies (`meriyah`, `estree`, etc).

[#128]: https://github.com/ventojs/vento/issues/128
