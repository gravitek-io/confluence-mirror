import {
  ADFDocument,
  processADFWithTOC,
  processADFWithMedia,
} from "@gravitek/confluence-mirror-core";
import OptimizedADFRenderer from "@/components/confluence/OptimizedAdfRenderer";

interface ShowroomContentProps {
  document: ADFDocument;
}

// Server Component for showroom content
export default async function ShowroomContent({
  document,
}: ShowroomContentProps) {
  // Process the document with media (for showroom special handling)
  const mediaProcessedDocument = await processADFWithMedia(
    document,
    "",
    "showroom"
  );

  // Pre-process the document for TOC extraction
  const { enrichedDocument, tableOfContents } = processADFWithTOC(
    mediaProcessedDocument
  );

  return (
    <div className="prose prose-lg max-w-full">
      <div className="confluence-hybrid-content">
        <OptimizedADFRenderer
          document={enrichedDocument}
          pageId="showroom"
          tableOfContents={tableOfContents}
        />
      </div>
    </div>
  );
}
