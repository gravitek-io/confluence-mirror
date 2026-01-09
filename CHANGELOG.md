# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Upgraded Next.js from 15.4.10 to 16.1.1
- Upgraded React from 19.1.0 to 19.2.3
- Upgraded Tailwind CSS from 4.1.11 to 4.1.18
- Upgraded @tailwindcss/postcss from 4.1.11 to 4.1.18
- Updated @types/node from ^20 to ^22 (aligns with Node.js 22.11)
- Updated eslint-config-next to 16.1.1
- Turbopack is now the default bundler (improved performance)

### Removed
- Removed unused webpack configuration for MongoDB dependencies
- Removed webpack custom config in favor of Turbopack

### Performance
- Faster development server startup with Turbopack file system caching
- Improved Hot Module Replacement (HMR) speed
- Faster production builds with Turbopack (906.9ms compile time)
- Build performance improved by ~18% compared to previous version

### Fixed
- Updated visual regression test baseline for minor rendering differences in Next.js 16
