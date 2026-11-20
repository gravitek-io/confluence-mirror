# Changelog

All notable changes to `@gravitek/confluence-mirror-core` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-11-20

### Added

- **Folder URLs**: `extractFolderIdFromUrl()` and `extractContentFromUrl()` recognise `/folder/<id>` URLs; `UrlTransformer` routes folder links to `?folderId=` (page links keep `?pageId=`)
- **Folder and hierarchy reads** on `ConfluenceClient` (REST v2, also in Basic Auth mode): `getFolder()`, `getDirectChildren()` (cursor pagination, `maxItems` cap with a `truncated` flag), `getAncestors()` and `getContentSummary()`
- **Folder titles in links**: `processADFWithLinks()` enriches folder links; `EnrichedLinkData` gains `contentType` (`"page" | "folder"`)
- New exported types: `ConfluenceContentType`, `ConfluenceTreeItem`, `ConfluenceAncestor`, `ConfluenceContentSummary`, `ConfluenceFolder`, `DirectChildrenResult`, `ConfluenceContentRef`
- Required OAuth2 scopes for these reads are documented per method: `read:folder:confluence`, `read:hierarchical-content:confluence`, `read:content.metadata:confluence`

### Changed

- **Node.js 22 or later is required** (`engines`)
- Added a Vitest test suite and a GitHub Actions CI (Node 22 and 26: install, build, test, audit)
- **Folder links are routed differently**: `UrlTransformer.toLocalUrl()` now turns folder URLs into `<localBaseUrl>/?folderId=<id>` (0.2.0 left them unchanged). Migration: viewers must handle the `folderId` query parameter (for example by rendering the folder with `getFolder()` and `getDirectChildren()`); the demo only shows a notice
- **`EnrichedLinkData.contentType` is a new required field** (`"page" | "folder"`): hand-built `EnrichedLinkData` objects, such as test mocks, must now set it
- **Content IDs are validated** (security): `getPage`, `getChildPages` and the new methods only accept numeric IDs (`/^\d+$/`) and throw `ConfluenceApiError` without any request otherwise, so an ID such as `../../x` can no longer reach other paths on the credentialed host
- `getDirectChildren` validates `maxItems` (integer >= 1), caps the number of requests it makes and stops on an unexpected `_links.next`, reporting `truncated: true`
- Development dependencies refreshed (`@types/node` 22, Next.js and React in the demo)

### Security

Dependency advisories were fixed (`npm audit` went from 16 findings to 0). They affected development tooling and the demo app only: the published package has no runtime dependencies.

- Critical: `next`
- High: `brace-expansion`, `js-yaml`, `nanoid`, `postcss`, `sharp`, `source-map-js`, `zod`
- Moderate: `@humanfs/node`, `minimatch` (the root override is raised to `^11.0.1`), `typescript-eslint` packages

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
