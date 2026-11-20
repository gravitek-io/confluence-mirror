# confluence-mirror-core

Core logic for Confluence page rendering - framework agnostic.

Requires Node.js 22 or later.

## Installation

```bash
npm install @gravitek/confluence-mirror-core
```

## Features

- ✅ **Confluence REST API Client** - Authenticate and fetch pages
- ✅ **Folder Browsing** - Read folders, direct children, ancestors and content summaries (REST v2)
- ✅ **ADF Processing** - Parse Atlas Document Format
- ✅ **Media Processing** - Extract and rewrite media URLs
- ✅ **TOC Extraction** - Generate table of contents from headings
- ✅ **TypeScript Support** - Full type definitions
- ✅ **Zero Dependencies** - Pure logic, no UI framework dependencies

## Quick Start

```typescript
import { 
  ConfluenceClient, 
  processADFWithMedia, 
  processADFWithTOC 
} from '@gravitek/confluence-mirror-core';

// Initialize client
const client = ConfluenceClient.createWithBasicAuth(
  "https://your-domain.atlassian.net",
  "your-email@domain.com",
  "your-api-key"
);

// Fetch a page
const page = await client.getPage("page-id");

// Process ADF with media URLs
const processedContent = await processADFWithMedia(
  JSON.parse(page.body.atlas_doc_format.value),
  page.body.storage?.value || "",
  "page-id"
);

// Extract table of contents
const { enrichedDocument, tableOfContents } = processADFWithTOC(processedContent);
```

## API Reference

### ConfluenceClient

```typescript
class ConfluenceClient {
  constructor(authStrategy: AuthStrategy, baseUrl?: string)
  static createWithBasicAuth(baseUrl: string, email: string, apiKey: string): ConfluenceClient
  static createWithOAuth2(clientId: string, clientSecret: string): ConfluenceClient


  async getPage(pageId: string, includeChildren?: boolean): Promise<ConfluencePage>
  async getChildPages(pageId: string): Promise<ConfluenceChildPage[]>
  async getCurrentUser(): Promise<any>

  // Folders and hierarchy (REST v2, since 0.3.0)
  async getFolder(id: string): Promise<ConfluenceFolder>
  async getDirectChildren(
    parentType: ConfluenceContentType,
    id: string,
    options?: { maxItems?: number }
  ): Promise<DirectChildrenResult>
  async getAncestors(type: ConfluenceContentType, id: string): Promise<ConfluenceAncestor[]>
  async getContentSummary(type: ConfluenceContentType, id: string): Promise<ConfluenceContentSummary>
  
  static extractPageIdFromUrl(url: string): string | null
}
```

### Folders and hierarchy

Since 0.3.0, the client reads folders and the page tree through the Confluence REST v2 API. In Basic Auth mode these methods use REST v2 too (`/wiki/api/v2`).

```typescript
// A folder, with its space ({ key, name }, or null if the space lookup failed)
const folder = await client.getFolder("1001");
console.log(folder.title, folder.space?.key);

// Direct children of a page or folder, in tree order (default cap: 1000 items)
const { items, truncated } = await client.getDirectChildren("folder", "1001", {
  maxItems: 200,
});
for (const item of items) console.log(item.type, item.id, item.title);

// Ancestors, root first
const ancestors = await client.getAncestors("page", "2002");

// Metadata without the body (title, spaceId, parentId, parentType)
const summary = await client.getContentSummary("folder", "1001");
```

Supported content types for these reads are `page` and `folder`; other kinds are rejected with a `ConfluenceApiError` before any request is sent.

### Folder URLs

URL helpers recognise folder URLs such as `https://example.atlassian.net/wiki/spaces/DOC/folder/1001/Guides`:

```typescript
import {
  extractFolderIdFromUrl,
  extractContentFromUrl,
  UrlTransformer,
} from '@gravitek/confluence-mirror-core';

extractFolderIdFromUrl("https://example.atlassian.net/wiki/spaces/DOC/folder/1001/Guides"); // "1001"
extractContentFromUrl("https://example.atlassian.net/wiki/spaces/DOC/pages/2002/Intro");   // { type: "page", id: "2002" }

// Folder links are routed to `?folderId=`, page links to `?pageId=`
const transformer = new UrlTransformer({
  confluenceBaseUrl: "https://example.atlassian.net",
  localBaseUrl: "https://docs.example.com",
});
transformer.toLocalUrl("https://example.atlassian.net/wiki/spaces/DOC/folder/1001/Guides");
// "https://docs.example.com/?folderId=1001"
```

`processADFWithLinks()` also enriches folder links with the folder title. `EnrichedLinkData` gains a `contentType` field (`"page" | "folder"`); `pageId` holds the folder ID for folders.

### Required OAuth2 scopes

A service account (OAuth2) needs these granular scopes, all suffixed with `:confluence`:

| Scope | Used for |
| --- | --- |
| `read:page:confluence` | Reading pages and their child pages |
| `read:attachment:confluence` | Attachments and media of a page |
| `read:user:confluence` | Page authors and the current user |
| `read:label:confluence` | Page labels |
| `read:space:confluence` | Resolving the space (key and name) of a page or folder |
| `read:embed:confluence` | Embedded content |
| `read:folder:confluence` | Reading folders (`getFolder`), needed since 0.3.0 |
| `read:hierarchical-content:confluence` | Direct children and ancestors, needed since 0.3.0 |
| `read:content.metadata:confluence` | Content summaries (`getContentSummary`), needed since 0.3.0 |

The service account must also have access to the Confluence spaces it reads.

### Processing Functions

```typescript
// Media processing
async function processADFWithMedia(
  adfDocument: ADFDocument,
  storageHtml: string,
  pageId: string
): Promise<ADFDocument>

// TOC processing  
function processADFWithTOC(adfDocument: ADFDocument): {
  enrichedDocument: ADFDocument;
  tableOfContents: TocItem[];
}

// Utility functions
function extractTextFromADFNodes(nodes: ADFNode[]): string
function generateSlug(text: string, existingSlugs?: Set<string>): string
```

### Types

```typescript
interface ConfluencePage {
  id: string;
  title: string;
  body: {
    atlas_doc_format?: { value: string };
    storage?: { value: string; representation: string };
  };
  version: { number: number };
  space: { key: string; name: string };
  _links: { webui: string };
  children?: { page?: { results: ConfluenceChildPage[]; size: number } };
}

interface ADFDocument {
  version: number;
  type: "doc";
  content: ADFNode[];
}

interface TocItem {
  id: string;
  title: string;
  level: number;
}
```

## Error Handling

```typescript
import { ConfluenceApiError } from '@gravitek/confluence-mirror-core';

try {
  const page = await client.getPage("invalid-id");
} catch (error) {
  if (error instanceof ConfluenceApiError) {
    console.log(`API Error ${error.statusCode}: ${error.message}`);
  }
}
```

## Contributing

This package contains pure logic with no UI dependencies. When contributing:

1. Keep functions pure and testable
2. Maintain TypeScript strict mode compliance  
3. Add tests for new functionality
4. Update type definitions as needed

## License

Apache-2.0