import React from "react";
import { renderADF } from "./AdfRenderer";
import { ADFDocument, TocItem, ConfluenceChildPage } from "@gravitek/confluence-mirror-core";

interface OptimizedADFRendererProps {
  document: ADFDocument;
  pageId: string;
  tableOfContents: TocItem[];
  childPages?: ConfluenceChildPage[];
  localBaseUrl?: string;
}

// Server Component - no 'use client' directive
export default function OptimizedADFRenderer({
  document,
  pageId,
  tableOfContents,
  childPages = [],
  localBaseUrl,
}: OptimizedADFRendererProps) {
  // Get Confluence base URL for building full URLs
  const confluenceBaseUrl = process.env.CONFLUENCE_BASE_URL || '';

  return (
    <div>
      {/* Render the ADF document with pre-processed data */}
      {/* ToC will be rendered inline where the macro appears in the document */}
      {renderADF(document, undefined, {
        pageId,
        childPages,
        confluenceBaseUrl,
        localBaseUrl,
        tableOfContents,
      })}
    </div>
  );
}
