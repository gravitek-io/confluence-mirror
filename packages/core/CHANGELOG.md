# Changelog

All notable changes to `@gravitek/confluence-mirror-core` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-09

### ⚠️ Breaking Changes

- **Package name changed** from `confluence-mirror-core` to `@gravitek/confluence-mirror-core`
  - Migration: `npm uninstall confluence-mirror-core && npm install @gravitek/confluence-mirror-core`
  - No API changes, only package name/namespace

### Added

- **Link Processor**: New `processADFWithLinks()` function to enrich Confluence page links with titles
- **URL Transformer**: New `UrlTransformer` class to convert Confluence URLs to local viewer URLs
- **File Attachment Support**: Media processor now handles documents (PowerPoint, PDF, Word, Excel, etc.)
- **OAuth2 Authentication**: Full OAuth2 support with automatic token refresh
- **Link Enrichment**: Automatically fetch and display page titles instead of raw URLs

### Changed

- **Package Namespace**: Moved to `@gravitek` organization for better branding
- **Version Bump**: 0.1.3 → 0.2.0 to reflect significant new features
- **Media Types**: Added `"file"` type for attachments (was `"unknown"`)
- **Date Parsing**: Improved handling of string timestamps from Confluence API

### Fixed

- **Date Display**: Fixed parsing of Confluence timestamps (string to number conversion)
- **Media URLs**: Better handling of attachment filenames in media processor
- **Child Pages Links**: Transform child page URLs to local viewer URLs

### Internal

- Export `EnrichedLinkData` and `LinkProcessorOptions` types
- Export `UrlTransformer` utility class
- Improved TypeScript types for media processing

## [0.1.3] - 2024-08-24

### Added

- Initial public release
- Confluence REST API client with Basic Auth
- ADF processing and parsing
- Media URL extraction from Storage format
- Table of Contents generation
- TypeScript support with full type definitions
- Zero runtime dependencies

### Features

- `ConfluenceClient` for API interactions
- `processADFWithMedia()` for media enrichment
- `processADFWithTOC()` for TOC extraction
- URL extraction utilities
- Error handling with `ConfluenceApiError`

---

## Migration Guide: 0.1.x → 0.2.0

### Package Installation

**Before:**
```bash
npm install confluence-mirror-core
```

**After:**
```bash
npm install @gravitek/confluence-mirror-core
```

### Imports

**Before:**
```typescript
import { ConfluenceClient } from 'confluence-mirror-core';
```

**After:**
```typescript
import { ConfluenceClient } from '@gravitek/confluence-mirror-core';
```

### API Usage (No Changes)

The API remains exactly the same. All existing code continues to work after updating imports:

```typescript
// Same API, just new package name
const client = ConfluenceClient.createWithBasicAuth(baseUrl, email, apiKey);
const page = await client.getPage(pageId);
```

### New Features Available in 0.2.0

```typescript
// Link enrichment
import { processADFWithLinks } from '@gravitek/confluence-mirror-core';
const { adf, enrichedLinks } = await processADFWithLinks(document, {
  confluenceClient,
  confluenceBaseUrl
});

// URL transformation
import { UrlTransformer } from '@gravitek/confluence-mirror-core';
const transformer = new UrlTransformer({
  confluenceBaseUrl: 'https://your-domain.atlassian.net',
  localBaseUrl: 'http://localhost:3000'
});
const localUrl = transformer.toLocalUrl(confluenceUrl);
```
