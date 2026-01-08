import React from "react";
import { renderADF } from "./AdfRenderer";
import { ADFDocument, TocItem, ConfluenceChildPage } from "confluence-mirror-core";
import OptimizedTOC from "./OptimizedToc";

interface OptimizedADFRendererProps {
  document: ADFDocument;
  pageId: string;
  tableOfContents: TocItem[];
  childPages?: ConfluenceChildPage[];
}

// Server Component - no 'use client' directive
export default function OptimizedADFRenderer({
  document,
  pageId,
  tableOfContents,
  childPages = [],
}: OptimizedADFRendererProps) {
  return (
    <div>
      {/* Display TOC at the top if there are headings */}
      {tableOfContents.length > 0 && <OptimizedTOC items={tableOfContents} />}

      {/* Render the ADF document with pre-processed data */}
      {renderADF(document, undefined, { pageId, childPages })}
    </div>
  );
}
