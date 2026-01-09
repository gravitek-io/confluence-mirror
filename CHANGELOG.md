# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Upgraded Next.js from 15.4.10 to 16.1.1
- Turbopack is now the default bundler (improved performance)
- Updated eslint-config-next to 16.1.1

### Removed
- Removed unused webpack configuration for MongoDB dependencies
- Removed webpack custom config in favor of Turbopack

### Performance
- Faster development server startup with Turbopack file system caching
- Improved Hot Module Replacement (HMR) speed
- Faster production builds with Turbopack

### Fixed
- Updated visual regression test baseline for minor rendering differences in Next.js 16
